import Incident from "../models/Incident.js";

// 1. ADMIN FEED (Smart Priority Sorting)
// Logic: Sorts by Severity (High first) -> then by Vote Count -> then by Newest
export const getAdminFeed = async (req, res) => {
    try {
        const { status, type } = req.query;
        let filter = {};

        // Allow Admin to filter by status or type if they want
        if (status) filter.status = status;
        if (type) filter.type = type;

        const incidents = await Incident.aggregate([
            { $match: filter },
            {
                $addFields: {
                    severityScore: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$severity", "High"] }, then: 3 },
                                { case: { $eq: ["$severity", "Medium"] }, then: 2 },
                                { case: { $eq: ["$severity", "Low"] }, then: 1 }
                            ],
                            default: 0
                        }
                    }
                }
            },
            // Sort: Highest Priority -> Most Verified -> Most Recent
            { $sort: { severityScore: -1, voteCount: -1, createdAt: -1 } }
        ]);

        res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
        console.error("Admin Feed Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 2. UPDATE INCIDENT (Unified Status & Notes)
// Handles "Mark as Resolved", "Reject", and "Add Note" all in one.
export const updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        // Construct update object dynamically (only update what is sent)
        const updates = {};
        
        // Validate Status if provided
        if (status) {
            const validStatuses = ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved', 'Rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid Status provided" });
            }
            updates.status = status;
        }

        // Add Notes if provided
        if (adminNotes !== undefined) {
            updates.adminNotes = adminNotes;
        }

        const updatedIncident = await Incident.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true } // Return the updated document
        );

        if (!updatedIncident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        // ⚡ Real-time update: Tell everyone (Dashboards & Mobile Apps)
        const io = req.app.get("socketio");
        io.emit("incident-updated", updatedIncident);

        res.status(200).json({ success: true, message: "Incident Updated", data: updatedIncident });

    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 3. SEED DATA (Utility for Testing)
export const seedIncidents = async (req, res) => {
    try {
        // Only run if we are the admin reporting
        await Incident.create([
            { type: 'Fire', severity: 'High', location: { lat: 11.01, lng: 76.95, address: "Main Lab" }, description: "Lab fire", reportedBy: req.user._id, status: "Unverified" },
            { type: 'Accident', severity: 'Medium', location: { lat: 11.02, lng: 76.96, address: "Gate 1" }, description: "Bike crash", reportedBy: req.user._id, status: "Unverified" },
            { type: 'Public Safety', severity: 'Low', location: { lat: 11.03, lng: 76.97, address: "Hostel" }, description: "Street light broken", reportedBy: req.user._id, status: "Unverified" }
        ]);
        res.status(201).json({ success: true, message: "Test Incidents Created!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. MERGE DUPLICATES (The "Winning Feature")
export const mergeIncidents = async (req, res) => {
    try {
        const { primaryId, duplicateId } = req.body;

        if (!primaryId || !duplicateId) {
            return res.status(400).json({ success: false, message: "Both IDs required" });
        }

        // 1. Get duplicate data
        const duplicate = await Incident.findById(duplicateId);
        if (!duplicate) {
            return res.status(404).json({ success: false, message: "Duplicate incident not found" });
        }

        // 2. Update Primary (Transfer votes & reporter)
        const primary = await Incident.findByIdAndUpdate(primaryId, {
            $inc: { voteCount: 1 }, 
            $addToSet: { upvotes: duplicate.reportedBy } 
        }, { new: true });

        if (!primary) {
            return res.status(404).json({ success: false, message: "Primary incident not found" });
        }

        // 3. Delete Duplicate
        await Incident.findByIdAndDelete(duplicateId);

        // 4. Notify Frontend
        const io = req.app.get("socketio");
        io.emit("incident-merged", { primaryId, duplicateId });

        res.status(200).json({ success: true, message: "Incidents Merged Successfully", data: primary });

    } catch (error) {
        console.error("Merge Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};