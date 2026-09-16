import mongoose from 'mongoose';
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please provide a valid MongoDB connection string.",
  );
}

// Global connection state to avoid multiple connections in development
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(process.env.DATABASE_URL as string);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export * from "./schema";
