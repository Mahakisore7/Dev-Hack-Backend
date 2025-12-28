import express from "express";
import { 
    createIncident, 
    getIncidents, 
    upvoteIncident,
    downvoteIncident // <--- 1. Import the new downvote controller
} from "../controllers/incidentController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Route: POST /api/incidents (Create Report)
router.post("/", protectRoute, createIncident);

// Route: GET /api/incidents (Fetch Map Data)
router.get("/", protectRoute, getIncidents);

// Route: POST /api/incidents/:id/upvote (Verify Report)
router.post("/:id/upvote", protectRoute, upvoteIncident);

// Route: POST /api/incidents/:id/downvote (Downvote/Reject Report)
router.post("/:id/downvote", protectRoute, downvoteIncident); // <--- 2. Add the new route

export default router;