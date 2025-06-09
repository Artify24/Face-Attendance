import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Student from "@/models/Student";
import connectDB from "@/lib/db";
import fs from "fs";
import path from "path";

const PYTHON_API_URL = process.env.PYTHON_API_URL!;
const IMAGE_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "students"
);

// Helper function to save image
const saveImage = async (file: File, rollNumber: string) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
    fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
  }

  const filename = `${rollNumber}-${Date.now()}.jpg`;
  const filepath = path.join(IMAGE_UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buffer);

  return `/images/students/${filename}`;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const formData = await request.formData();

    // Extract form data
    const fields = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      rollNumber: formData.get("rollNumber") as string,
      branch: formData.get("branch") as string,
      year: formData.get("year") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      image: formData.get("image") as File,
    };

    // Validate fields
    if (Object.values(fields).some((field) => !field)) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check for existing student
    const existingStudent = await Student.findOne({
      $or: [{ email: fields.email }, { rollNumber: fields.rollNumber }],
    });
    if (existingStudent) {
      return NextResponse.json(
        { error: "Student already exists" },
        { status: 409 }
      );
    }

    // Process image and get embedding
    const imageBytes = await fields.image.arrayBuffer();
    console.log("Image field:", fields.image);
    console.log("Image bytes length:", imageBytes.byteLength);

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

    // Save student record
    const imageUrl = await saveImage(fields.image, fields.rollNumber);
    const newStudent = new Student({
      ...fields,
      imageUrls: [imageUrl],
      embeddings: [embedding],
    });

    await newStudent.save();

    return NextResponse.json(
      {
        success: true,
        student: {
          id: newStudent._id,
          rollNumber: newStudent.rollNumber,
          imageUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in student registration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
