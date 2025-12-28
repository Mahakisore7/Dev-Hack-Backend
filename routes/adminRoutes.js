import express from "express";
import { 
    getAdminFeed, 
    updateIncidentStatus, 
    addAdminNote,     
    mergeIncidents
} from "../controllers/adminController.js";
import { protectRoute, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// 🛡️ SECURITY WALL: All routes below require Login + Admin Role
router.use(protectRoute, verifyAdmin);

// 1. Get Sorted Admin Feed (Handles ?status=All or ?status=Unverified)
router.get("/feed", getAdminFeed);

// 2. Update Status (Matches Postman: PUT /api/admin/update-status/:id)
router.put("/update-status/:id", updateIncidentStatus);

// 3. Add Admin Note (Matches Postman: PUT /api/admin/add-note/:id)
router.put("/add-note/:id", addAdminNote);

// 4. Merge Duplicates
router.post("/merge", mergeIncidents);

// 5. Utility (Seeding Test Data)
// Changed to POST to follow standard practices, but GET works too if you prefer browser access
// router.post("/seed", seedIncidents); 

export default router;