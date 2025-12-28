import express from "express";
import { checkAuth, login, signup } from "../controllers/UserController.js"; // Added .js
import { protectRoute } from "../middleware/auth.js"; // Added .js

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;