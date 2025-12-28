import Incident from "../models/Incident.js";

// 1. Create a New Incident (Citizen Reporting)
export const createIncident = async (req, res) => {
    try {
        const { type, description, location, mediaUrl } = req.body;

        // Basic Validation
        if (!type || !location || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, message: "Type and Location are required" });
        }

        const newIncident = new Incident({
            type,
            description,
            location,
            mediaUrl,
            reportedBy: req.user._id, // Taken from the protectRoute middleware
            status: "Unverified",     // Default from schema
            severity: "Medium"        // Default from schema
        });

        await newIncident.save();

        // ⚡ REAL-TIME ALERT: Notify all connected Admins immediately
        const io = req.app.get("socketio");
        io.emit("new-incident", newIncident);

        res.status(201).json({ 
            success: true, 
            message: "Incident Reported Successfully", 
            data: newIncident 
        });

    } catch (error) {
        console.error("Create Incident Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. GET INCIDENTS (Renamed from 'getRecentIncidents' to match routes)
export const getIncidents = async (req, res) => {
    try {
        // Fetch all incidents that are NOT resolved (Active feed)
        // You can change filter to { status: 'Unverified' } if you only want unverified ones
        const incidents = await Incident.find({ status: { $ne: 'Resolved' } })
            .sort({ createdAt: -1 }) // Newest first
            .populate("reportedBy", "username"); // Show reporter name

        res.status(200).json({ success: true, count: incidents.length, data: incidents });

    } catch (error) {
        console.error("User Feed Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 3. Upvote/Verify Incident (The Crowd-Sourcing Logic)
export const upvoteIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const incident = await Incident.findById(id);
        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        // Check if user has already upvoted
        if (incident.upvotes.includes(userId)) {
            return res.status(400).json({ success: false, message: "You have already verified this incident" });
        }

        // Add user to upvotes array
        incident.upvotes.push(userId);
        incident.voteCount = incident.upvotes.length; // Sync the voteCount

        await incident.save();

        res.status(200).json({ success: true, message: "Upvote added", data: incident });

    } catch (error) {
        console.error("Upvote Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};