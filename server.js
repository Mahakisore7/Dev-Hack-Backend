// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import http from "http";
// import { Server } from "socket.io"; 
// import { connectDB } from "./lib/db.js";

// import userRouter from "./routes/userRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js"; 
// import incidentRouter from "./routes/incidentRoutes.js";

// const app = express();
// const server = http.createServer(app);

// // Socket.io Setup (Crucial for the Admin Map)
// const io = new Server(server, {
//     cors: { origin: "*" }
// });

// app.set("socketio", io);

// app.use(cors({
//     origin: "https://resqq.netlify.app", // Replace with your frontend URL if different
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "token"] // Ensure "token" is allowed if you use it in headers
// }));
// app.use(express.json({limit:"4mb"})); 

// // DB Connection
// connectDB(); 

// // Routes
// app.use("/api/status", (req, res) => {
//     res.send("Emergency Server is Live");
// });

// // --- MOUNT ROUTES ---
// app.use("/api/auth", userRouter);  // Users Login/Signup
// app.use("/api/admin", adminRoutes); // Admin Dashboard Logic
// app.use("/api/incidents", incidentRouter);

// // Socket.io Connection Logic
// io.on("connection", (socket) => {
//     console.log("📡 Admin/Responder connected: " + socket.id);
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

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

// 🟢 1. UNIFIED CORS CONFIGURATION
// Note: Ensure NO trailing slash at the end of the URL
const allowedOrigins = [
    "https://resqq.netlify.app", 
    "http://localhost:5173"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("CORS Blocked Origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS for preflight
    credentials: true,
    allowedHeaders: ["Content-Type", "token", "Authorization"] // Added Authorization for safety
};

// 🟢 2. APPLY TO SOCKET.IO
const io = new Server(server, {
    cors: corsOptions
});

app.set("socketio", io);

// 🟢 3. APPLY TO EXPRESS MIDDLEWARE
app.use(cors(corsOptions));
app.use(express.json({ limit: "4mb" })); 

// DB Connection
connectDB(); 

// Routes
app.use("/api/status", (req, res) => {
    res.send("Emergency Server is Live");
});

// --- MOUNT ROUTES ---
app.use("/api/auth", userRouter);   // Users Login/Signup
app.use("/api/admin", adminRoutes); // Admin Dashboard Logic
app.use("/api/incidents", incidentRouter);

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("📡 Admin/Responder connected: " + socket.id);
});

// 🟢 4. DYNAMIC PORT FOR RENDER
// Render provides the PORT env variable; hardcoding 5000 will fail in production
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});