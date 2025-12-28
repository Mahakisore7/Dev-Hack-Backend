import Incident from "../models/Incident.js";

// --- HELPER: AI Heuristic for Severity ---
const determineSeverity = (type, description) => {
    const text = (type + " " + description).toLowerCase();

    // 🔴 HIGH PRIORITY KEYWORDS
    const highKeywords = ["fire", "explosion", "blood", "crash", "accident", "weapon", "gun", "knife", "collapse", "trapped", "unconscious"];
    // 🟡 MEDIUM PRIORITY KEYWORDS
    const mediumKeywords = ["smoke", "spark", "fight", "argument", "blocked", "leak", "suspicious"];

    if (highKeywords.some(word => text.includes(word))) return "High";
    if (mediumKeywords.some(word => text.includes(word))) return "Medium";
    return "Low"; // Default
};

// 1. Create a New Incident (Citizen Reporting)
export const createIncident = async (req, res) => {
    try {
        const { type, description, location, image } = req.body;

        // Validation
        if (!type || !location || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, message: "Type and Location are required" });
        }
        let mediaUrl=null;
        if(image)
        {
            const uploadResponse = await cloudinary.uploader.upload(image);
            mediaUrl = uploadResponse.secure_url;
        }
        // AI LOGIC: Calculate Severity automatically
        const calculatedSeverity = determineSeverity(type, description);

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

// 2. GET INCIDENTS (For Citizen Feed)
export const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({ status: { $ne: 'Resolved' } })
            .sort({ createdAt: -1 })
            .populate("reportedBy", "username");

        res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 3. UPVOTE INCIDENT
export const upvoteIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const incident = await Incident.findById(id);
        if (!incident) return res.status(404).json({ message: "Not found" });

        // 1. Remove from Downvotes if exists (User changed mind)
        if (incident.downvotes.includes(userId)) {
            incident.downvotes.pull(userId);
        }

        // 2. Prevent double upvoting
        if (incident.upvotes.includes(userId)) {
            return res.status(400).json({ message: "Already upvoted" });
        }

        // 3. Add Upvote
        incident.upvotes.push(userId);

        // 4. Update Net Score
        incident.voteCount = incident.upvotes.length - incident.downvotes.length;

        // 5. Auto-Verify Threshold
        if (incident.voteCount >= 3 && incident.status === "Unverified") {
            incident.status = "Verified";
        }

        await incident.save();
        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DOWNVOTE INCIDENT
export const downvoteIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const incident = await Incident.findById(id);
        if (!incident) return res.status(404).json({ message: "Not found" });

        // 1. Remove from Upvotes if exists (User changed mind)
        if (incident.upvotes.includes(userId)) {
            incident.upvotes.pull(userId);
        }

        // 2. Prevent double downvoting
        if (incident.downvotes.includes(userId)) {
            return res.status(400).json({ message: "Already downvoted" });
        }

        // 3. Add Downvote
        incident.downvotes.push(userId);

        // 4. Update Net Score
        incident.voteCount = incident.upvotes.length - incident.downvotes.length;

        // 5. Auto-Reject Logic (Optional: If score is -5, mark as Rejected)
        if (incident.voteCount <= -5 && incident.status === "Unverified") {
            incident.status = "Rejected";
        }

        await incident.save();
        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};