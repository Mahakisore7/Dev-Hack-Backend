import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());


const DB_URI = "mongodb+srv://devhack:devhack123@cluster0.iijghe6.mongodb.net/hackathon_db?retryWrites=true&w=majority";

mongoose.connect(DB_URI)
    .then(() => console.log(" MongoDB Connected Successfully"))
    .catch((err) => console.log(" Connection Error:", err));

app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Backend is Running!'));

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));