// Attendance marking endpoint
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Student from "@/models/Student";
import connectDB from "@/lib/db";

const PYTHON_API_URL = process.env.PYTHON_API_URL!;

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Get embedding from Python API
    const imageBytes = await imageFile.arrayBuffer();
    const embeddingRes = await fetch(`${PYTHON_API_URL}/generate-embedding`, {
      method: "POST",
      body: Buffer.from(imageBytes),
      headers: { "Content-Type": "application/octet-stream" },
    });

    if (!embeddingRes.ok) {
      const error = await embeddingRes.json();
      return NextResponse.json(
        { error: `Face processing failed: ${error.error || "Unknown error"}` },
        { status: 400 }
      );
    }

    const { embedding } = await embeddingRes.json();

    // Find matching student
    const students = await Student.find({});
    let bestMatch = null;
    let highestSimilarity = 0;
    const THRESHOLD = 0.65; // Adjust based on your testing

    for (const student of students) {
      for (const storedEmbedding of student.embeddings) {
        // Calculate cosine similarity
        const similarity = calculateCosineSimilarity(
          embedding,
          storedEmbedding
        );
        if (similarity > highestSimilarity && similarity > THRESHOLD) {
          highestSimilarity = similarity;
          bestMatch = student;
        }
      }
    }

    if (!bestMatch) {
      return NextResponse.json(
        { success: false, message: "No matching student found" },
        { status: 404 }
      );
    }

    // Mark attendance
    const today = new Date().toISOString().split("T")[0];
    await Student.updateOne(
      { _id: bestMatch._id },
      {
        $push: {
          attendance: {
            date: new Date(),
            status: "Present",
            verifiedBy: "face_recognition",
            confidence: highestSimilarity,
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      student: {
        name: bestMatch.name,
        rollNumber: bestMatch.rollNumber,
        confidence: highestSimilarity,
      },
    });
  } catch (error) {
    console.error("Error in attendance marking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function for cosine similarity
function calculateCosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
