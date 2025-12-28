import express from "express";
import { 
    getAdminFeed, 
    updateIncidentStatus, 
    addAdminNote, 
    seedIncidents,
    mergeIncidents
} from "../controllers/adminController.js";
import { protectRoute, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply Security globally to all admin routes
// This means EVERY route below requires Login + Admin Role
router.use(protectRoute, verifyAdmin);

// 1. Get Sorted Admin Feed
router.get("/feed", getAdminFeed);

// 2. Actions
router.patch("/:id/status", updateIncidentStatus);
router.patch("/:id/notes", addAdminNote);
router.post("/merge", mergeIncidents);

// 3. Utility
router.get("/seed", seedIncidents);

export default router;