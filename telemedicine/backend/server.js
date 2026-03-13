require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const doctorRoutes = require('./routes/doctor');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  socket.on('join-room', (data) => {
    socket.join(data.room);
  });

  socket.on('leave-room', (data) => {
    socket.leave(data.room);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telemedicine';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
