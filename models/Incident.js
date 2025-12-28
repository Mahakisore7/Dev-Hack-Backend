import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    // --- CITIZEN REPORTING DATA ---
    type: { 
        type: String, 
        required: true,
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
        default: "" 
    },

    // --- ADMIN & LIFECYCLE DATA ---
    status: {
        type: String,
        enum: ['Unverified', 'Verified', 'Resolved', 'Rejected'],
        default: 'Unverified'
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    adminNotes: { 
        type: String, 
        default: "" 
    },

    // --- VERIFICATION SYSTEM ---
    upvotes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: [] // 🟢 Ensure it starts as an empty array
    }], 
    
    // 🟢 ADDED: Downvotes array to track users who rejected the report
    downvotes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: [] 
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
incidentSchema.index({ location: "2dsphere" });

export default mongoose.model('Incident', incidentSchema);