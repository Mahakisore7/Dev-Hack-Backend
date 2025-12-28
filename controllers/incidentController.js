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
            incident: newIncident 
        });

    } catch (error) {
        console.error("Create Incident Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// FOR CITIZENS: Get only recent, unverified reports for the Feed
export const getRecentIncidents = async (req, res) => {
    try {
        // STRICT FILTER: Status must be 'Unverified'
        const incidents = await Incident.find({ status: 'Unverified' })
            .sort({ createdAt: -1 }) // Newest first
            .limit(10) // Limit to 10 for speed
            .populate("reportedBy", "username"); // Show reporter name

        res.status(200).json({ success: true, count: incidents.length, incidents });

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
        
        // Sync the voteCount
        incident.voteCount = incident.upvotes.length;

        // AUTOMATED LOGIC: If 5 people verify, mark as "Verified" automatically
        // if (incident.voteCount >= 5 && incident.status === "Unverified") {
        //     incident.status = "Verified";
        // }

        await incident.save();

        res.status(200).json({ success: true, message: "Upvote added", incident });

    } catch (error) {
        console.error("Upvote Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

