import mongoose from "mongoose";
import { env } from "./env.js"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGODB_URI);
        //* console.log(conn);
        console.log(`[DB] Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.log("[DB] connection failed:", error.message);
        throw error;
    }
}


