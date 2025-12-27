import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; 
import { connectDB } from "./lib/db.js";

// --- IMPORTS (Uncommented & Restored) ---
import userRouter from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // <--- RESTORED YOUR WORK

const app = express();
const server = http.createServer(app);

// Socket.io Setup (Crucial for the Admin Map)
const io = new Server(server, {
    cors: { origin: "*" }
});

// Pass 'io' to your routes (so you can alert admins when a user reports)
app.set("socketio", io);

app.use(cors());
app.use(express.json()); // <--- CRITICAL: He missed this! Without this, POST requests fail.

// DB Connection
connectDB(); 

// Routes
app.use("/api/status", (req, res) => {
    res.send("Emergency Server is Live");
});

// --- MOUNT ROUTES ---
app.use("/api/auth", userRouter);  // Users Login/Signup
app.use("/api/admin", adminRoutes); // Admin Dashboard Logic

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("📡 Admin/Responder connected: " + socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});