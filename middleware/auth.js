import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // Checks for 'token' in headers
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // FIX: Find user by the specific userId from the decoded token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth Middleware Error:", error.message);
        res.status(500).json({ success: false, message: "Invalid Token" });
    }
};

// NEW: Check if the user is an Admin or Responder
export const verifyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'responder')) {
        next(); // They are allowed, proceed!
    } else {
        res.status(403).json({ success: false, message: "Access Denied: Admins Only" });
    }
};