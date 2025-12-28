import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import "dotenv/config";

const createAdmin = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ DB Connected");

        // 1. Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@prometeo.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists. You can login now.");
            process.exit();
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        // 3. Create User
        const newAdmin = new User({
            username: "Super Admin",
            email: "admin@prometeo.com",
            password: hashedPassword,
            role: "admin"
        });

        await newAdmin.save();
        console.log("🎉 SUCCESS: Admin Created!");
        console.log("📧 Email: admin@prometeo.com");
        console.log("🔑 Pass: admin123");
        
        process.exit();
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

createAdmin();