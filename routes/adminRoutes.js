import express from 'express';
import Incident from '../models/Incident.js'; // Note the .js extension!

const router = express.Router();

// 1. GET FEED
router.get('/feed', async (req, res) => {
    try {
        const { status, type } = req.query;
        let filter = {};
        
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
            { $sort: { severityScore: -1, voteCount: -1, createdAt: -1 } }
        ]);

        res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. UPDATE STATUS
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid Status provided" });
        }

        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.json({ success: true, data: incident });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. ADD NOTES
router.patch('/:id/notes', async (req, res) => {
    try {
        const { adminNotes } = req.body;
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { adminNotes: adminNotes },
            { new: true }
        );
        res.json({ success: true, data: incident });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. SEED DATA (Temporary Test Route)
// CHANGED TO GET REQUEST SO YOU CAN RUN IT IN BROWSER
router.get('/seed', async (req, res) => {
    try {
        await Incident.create([
            { type: 'Fire', severity: 'High', location: { lat: 11.01, lng: 76.95, address: "Main Lab" }, description: "Lab fire" },
            { type: 'Accident', severity: 'Medium', location: { lat: 11.02, lng: 76.96, address: "Gate 1" }, description: "Bike crash" },
            { type: 'Public Safety', severity: 'Low', location: { lat: 11.03, lng: 76.97, address: "Hostel" }, description: "Street light broken" }
        ]);
        res.json({ success: true, message: "3 Test Incidents Created!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;