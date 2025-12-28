import express from "express";
import { createIncident, getIncidents, upvoteIncident } from "../controllers/incidentController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route: POST /api/incidents (Create Report)
router.post("/", protectRoute, createIncident);

// Route: GET /api/incidents (Fetch Map Data)
router.get("/", protectRoute, getIncidents);

// Route: POST /api/incidents/:id/upvote (Verify Report)
router.post("/:id/upvote", protectRoute, upvoteIncident);

export default router;