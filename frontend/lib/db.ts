// lib/db.ts

import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;
const DB_NAME = process.env.MONGODB_DB_NAME!;

if (!MONGODB_URL || !DB_NAME) {
  throw new Error("Please define MONGODB_URL and MONGODB_DB_NAME in your .env file.");
}

let isConnected = false; // 🔒 Persistent connection across hot reloads

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URL, {
      dbName: DB_NAME,
    });

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;
