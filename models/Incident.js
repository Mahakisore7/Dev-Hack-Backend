import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    // --- CITIZEN REPORTING DATA ---
    type: { 
        type: String, 
        required: true,
        // Categories must match the buttons in the mobile app
        enum: ['Fire', 'Accident', 'Medical', 'Public Safety'] 
    },
    description: { 
        type: String,
        required: true 
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    mediaUrl: { 
        type: String, 
        default: "" // Better to use empty string than null for React images
    },

    // --- ADMIN & LIFECYCLE DATA ---
    status: {
        type: String,
        // ⚠️ CRITICAL: Added 'Rejected' to match your Frontend Tabs
        enum: ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved', 'Rejected'],
        default: 'Unverified'
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium' // Default is Medium, but AI controller usually overrides this
    },
    adminNotes: { 
        type: String, 
        default: "" 
    },

    // --- VERIFICATION SYSTEM (For Merge & Upvotes) ---
    upvotes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], 
    
    voteCount: { 
        type: Number, 
        default: 0 
    },
    
    reportedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// 🌍 GEOSPATIAL INDEX
// This allows you to search "Find incidents within 5km of me" in the future
incidentSchema.index({ location: "2dsphere" });

export default mongoose.model('Incident', incidentSchema);