import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[DB] Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.log("[DB] connection failed:", error.message);
        throw error;
    }
}
