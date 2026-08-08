import dotenv from "dotenv";
import mongoose from "mongoose";
import { config } from "./config.js";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            config.MONGO_URI
        );

        console.log(`MongoDB connected`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
