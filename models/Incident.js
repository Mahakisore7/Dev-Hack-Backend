const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { 
        type: String, 
        enum: ['unverified', 'verified', 'resolved'], 
        default: 'unverified' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    },
    // Compulsory Upvote System for Verification
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);