import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("✅ Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.log("❌ Database connection error:", err);
        });

        // Simply use the variable. Do not add extra strings to it.
        await mongoose.connect(process.env.MONGODB_URI);
        
    } catch (error) {
        console.log("❌ Failed to connect to DB:", error.message);
        process.exit(1); // Stop app if DB fails
    }
}