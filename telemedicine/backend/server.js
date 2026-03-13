import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initializeSocket } from './services/socketService.js';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/patient', apiLimiter, consultationRoutes);
app.use('/api/doctor', apiLimiter, doctorRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/consultation', apiLimiter, consultationRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Initialize Socket.io
initializeSocket(io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telemedicine';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
