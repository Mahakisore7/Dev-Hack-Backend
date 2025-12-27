import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    
    role: { 
        type: String, 
        enum: ['citizen', 'admin', 'responder'], 
        default: 'citizen' 
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);