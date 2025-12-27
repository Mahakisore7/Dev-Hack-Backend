import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; // Added for real-time
import { connectDB } from "./lib/db.js"; // Added .js extension
//import userRouter from "./routes/userRoutes.js";
//import incidentRouter from "./routes/incidentRoutes.js"; // Renamed from message to match project

const app = express();
const server = http.createServer(app);

// Socket.io Setup (Crucial for the Admin Map)
const io = new Server(server, {
    cors: { origin: "*" }
});

// Pass 'io' to your routes so you can emit alerts when a user reports something
app.set("socketio", io);

// Middleware
app.use(cors());

// DB Connection
await connectDB();

// Routes
app.use("/api/status", (req, res) => {
    res.send("Emergency Server is Live");
});
//app.use("/api/auth", userRouter);
//app.use("/api/incidents", incidentRouter); 

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("📡 Admin/Responder connected: " + socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
