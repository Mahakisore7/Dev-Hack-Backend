import Incident from "../models/Incident.js";

// ==========================================
// 1. GET ADMIN FEED (Handles Home & Tabs)
// ==========================================
// export const getAdminFeed = async (req, res) => {
//     try {
//         const { status, type } = req.query;
//         let filter = {};

//         // 🟢 LOGIC: 
//         // If status is "All", we want everything (empty filter).
//         // If status is "Unverified", "Resolved", etc., we filter by that specific status.
//         if (status && status !== "All") {
//             filter.status = status;
//         }

//         // Optional: Filter by Type (Fire, Medical) if needed later
//         if (type) filter.type = type;

//         const incidents = await Incident.aggregate([
//             { $match: filter }, // Apply the filter (All vs Specific Status)
//             {
//                 $addFields: {
//                     severityScore: {
//                         $switch: {
//                             branches: [
//                                 { case: { $eq: ["$severity", "High"] }, then: 3 },
//                                 { case: { $eq: ["$severity", "Medium"] }, then: 2 },
//                                 { case: { $eq: ["$severity", "Low"] }, then: 1 }
//                             ],
//                             default: 0
//                         }
//                     }
//                 }
//             },
//             // 🟢 SORTING ORDER:
//             // 1. High Severity First
//             // 2. High Vote Count Second
//             // 3. Most Recently Created Third (Newest on top)
//             { $sort: { severityScore: -1, voteCount: -1, createdAt: -1 } }
//         ]);

//         res.status(200).json({ success: true, count: incidents.length, data: incidents });

//     } catch (error) {
//         console.error("Admin Feed Error:", error.message);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };
export const getAdminFeed = async (req, res) => {
    try {
        const { status, type } = req.query;
        let filter = {};

        if (status && status !== "All") {
            filter.status = status;
        }

        if (type) filter.type = type;

        const incidents = await Incident.aggregate([
            { $match: filter },
            {
                $addFields: {
                    // 🟢 Calculate counts for frontend safety
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                    downvoteCount: { $size: { $ifNull: ["$downvotes", []] } },
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
            { $sort: { severityScore: -1, voteCount: -1, createdAt: -1 } }
        ]);

        res.status(200).json({ success: true, count: incidents.length, data: incidents });

    } catch (error) {
        console.error("Admin Feed Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. UPDATE STATUS (Admin Edit Feature)
// ==========================================
export const updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Allowed status updates
        const validStatuses = ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved','Rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid Status provided" });
        }

        // Find and update the incident
        const incident = await Incident.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Return the updated version immediately
        );

        if (!incident) {
            return res.status(404).json({ success: false, message: "Incident not found" });
        }

        // ⚡ REAL-TIME UPDATE: Tell Frontend to move this card to the new tab
        const io = req.app.get("socketio");
        if (io) {
            io.emit("incident-updated", incident);
        }

        res.status(200).json({ success: true, message: `Status updated to ${status}`, data: incident });

    } catch (error) {
        console.error("Update Status Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 3. ADD ADMIN NOTE (Internal Comments)
// ==========================================
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

// ==========================================
// 4. MERGE DUPLICATES (Clean up Feed)
// ==========================================
export const mergeIncidents = async (req, res) => {
    try {
        const { primaryId, duplicateId } = req.body;

        // Check if duplicate exists
        const duplicate = await Incident.findById(duplicateId);
        if (!duplicate) {
            return res.status(404).json({ success: false, message: "Duplicate incident not found" });
        }

        // Update Primary: Add votes + Add reporter to upvoters
        const primary = await Incident.findByIdAndUpdate(primaryId, {
            $inc: { voteCount: 1 }, 
            $addToSet: { upvotes: duplicate.reportedBy } 
        }, { new: true });

        if (!primary) {
            return res.status(404).json({ success: false, message: "Primary incident not found" });
        }

        // Delete the Duplicate
        await Incident.findByIdAndDelete(duplicateId);

        // Notify Frontend to remove the duplicate dot
        const io = req.app.get("socketio");
        if (io) {
            io.emit("incident-merged", { primaryId, duplicateId });
        }

        res.status(200).json({ success: true, message: "Incidents Merged Successfully", data: primary });

    } catch (error) {
        console.error("Merge Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// // ==========================================
// // 5. SEED DATA (For Testing)
// // ==========================================
// export const seedIncidents = async (req, res) => {
//     try {
//         // Create 3 test incidents with different statuses to test your tabs
//         await Incident.create([
//             { type: 'Fire', severity: 'High', location: { lat: 11.01, lng: 76.95, address: "Main Lab" }, description: "Lab fire", reportedBy: req.user._id, status: 'Unverified' },
//             { type: 'Accident', severity: 'Medium', location: { lat: 11.02, lng: 76.96, address: "Gate 1" }, description: "Bike crash", reportedBy: req.user._id, status: 'Unverified' },
//             { type: 'Public Safety', severity: 'Low', location: { lat: 11.03, lng: 76.97, address: "Hostel" }, description: "Street light broken", reportedBy: req.user._id, status: 'Resolved' }
//         ]);
//         res.status(201).json({ success: true, message: "Test Incidents Created!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };