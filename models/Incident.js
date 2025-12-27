import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
    // --- CITIZEN REPORTING DATA ---
    type: { 
        type: String, 
        required: true,
        enum: ['Fire', 'Accident', 'Medical', 'Public Safety'] 
    },
    description: { type: String },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    mediaUrl: { type: String, default: null },

    // --- ADMIN & LIFECYCLE DATA ---
    status: {
        type: String,
        enum: ['Unverified', 'Verified', 'Responding', 'On Scene', 'Resolved'],
        default: 'Unverified'
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    adminNotes: { type: String, default: "" },

    // --- VERIFICATION SYSTEM ---
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    voteCount: { type: Number, default: 0 },
    
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);