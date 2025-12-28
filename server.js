import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io"; 
import { connectDB } from "./lib/db.js";

import userRouter from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import incidentRouter from "./routes/incidentRoutes.js";

const app = express();
const server = http.createServer(app);

// Socket.io Setup (Crucial for the Admin Map)
const io = new Server(server, {
    cors: { origin: "*" }
});

app.set("socketio", io);

app.use(cors({
    origin: "https://incomparable-flan-be4154.netlify.app", // Replace with your frontend URL if different
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "token"] // Ensure "token" is allowed if you use it in headers
}));
app.use(express.json({limit:"4mb"})); 

// DB Connection
connectDB(); 

// Routes
app.use("/api/status", (req, res) => {
    res.send("Emergency Server is Live");
});

// --- MOUNT ROUTES ---
app.use("/api/auth", userRouter);  // Users Login/Signup
app.use("/api/admin", adminRoutes); // Admin Dashboard Logic
app.use("/api/incidents", incidentRouter);

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("📡 Admin/Responder connected: " + socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});