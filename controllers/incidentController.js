import Incident from "../models/Incident.js";

// 1. Create a New Incident (Citizen Reporting)
export const createIncident = async (req, res) => {
    try {
        const { type, description, location, mediaUrl } = req.body;

        if (!type || !location || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, message: "Type and Location are required" });
        }

        let calculatedSeverity = "Medium"; 

        if (["Fire", "Accident", "Medical"].includes(type)) {
            calculatedSeverity = "High";
        } else {
            calculatedSeverity = "Low"; 
        }

        const newIncident = new Incident({
            type,
            description,
            location,
            mediaUrl,
            reportedBy: req.user._id, 
            status: "Unverified",
            severity: calculatedSeverity 
        });

        await newIncident.save();

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
        const incidents = await Incident.find({ status: { $ne: 'Resolved' } })
            .sort({ createdAt: -1 }) // Newest first
            .populate("reportedBy", "username"); 

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