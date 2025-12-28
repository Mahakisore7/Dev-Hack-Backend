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

// 2. UPDATE STATUS (Command Center Action)
export const updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid Status provided" });
        }

        const incident = await Incident.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Return updated doc
        );

        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        // Notify Everyone (Real-time update)
        const io = req.app.get("socketio");
        io.emit("incident-updated", incident);

        res.status(200).json({ success: true, message: "Status Updated", data: incident });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 3. ADD ADMIN NOTES (Internal Communication)
export const addAdminNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const incident = await Incident.findByIdAndUpdate(
            id,
            { adminNotes: adminNotes },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        res.status(200).json({ success: true, message: "Note Added", data: incident });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 4. SEED DATA (Utility for Testing)
export const seedIncidents = async (req, res) => {
    try {
        // Only run if we are the admin reporting
        await Incident.create([
            { type: 'Fire', severity: 'High', location: { lat: 11.01, lng: 76.95, address: "Main Lab" }, description: "Lab fire", reportedBy: req.user._id },
            { type: 'Accident', severity: 'Medium', location: { lat: 11.02, lng: 76.96, address: "Gate 1" }, description: "Bike crash", reportedBy: req.user._id },
            { type: 'Public Safety', severity: 'Low', location: { lat: 11.03, lng: 76.97, address: "Hostel" }, description: "Street light broken", reportedBy: req.user._id }
        ]);
        res.status(201).json({ success: true, message: "Test Incidents Created!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};