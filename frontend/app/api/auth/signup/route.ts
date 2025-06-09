import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import User from "@/models/User";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
import { serialize } from "cookie";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Await the async createToken function
    const token = await createToken({ userId: newUser._id });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const response = NextResponse.json({ message: "User created successfully" }, { status: 201 });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    console.error("Error in POST /api/auth:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
