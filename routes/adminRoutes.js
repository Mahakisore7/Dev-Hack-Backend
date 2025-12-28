import express from "express";
import { 
    getAdminFeed, 
    updateIncidentStatus, 
    seedIncidents,
    mergeIncidents
} from "../controllers/adminController.js";
import { protectRoute, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// 🛡️ SECURITY WALL: All routes below require Login + Admin Role
router.use(protectRoute, verifyAdmin);

// 1. Get Sorted Admin Feed
router.get("/feed", getAdminFeed);

// 2. Unified Update Action (Status & Notes)
// This single route handles "Mark Resolved", "Reject", and "Add Note"
router.patch("/:id", updateIncidentStatus);

// 3. Merge Duplicates
router.post("/merge", mergeIncidents);

// 4. Utility (Seeding Test Data)
router.get("/seed", seedIncidents);

export default router;