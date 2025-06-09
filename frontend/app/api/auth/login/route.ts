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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createToken({ userId: user._id });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
    response.headers.set("Set-Cookie", cookie);
    return response;

  } catch (error) {
    console.error("Error in POST /api/auth/login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
