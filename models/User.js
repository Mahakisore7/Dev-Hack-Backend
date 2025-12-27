const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },

    // HIDDEN ROLE FIELD (The "Brain" of RBAC)
    role: { 
        type: String, 
        enum: ['citizen', 'responder'], 
        default: 'citizen' // Everyone starts as a citizen
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);