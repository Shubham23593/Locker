import jwt from 'jsonwebtoken';

let _io = null;

// Map of userId -> Set of socketIds for targeted messaging
const userSocketMap = new Map();

const verifySocketToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return null;
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

export const initializeSocket = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client sends their auth token on connect to register for targeted events
    socket.on('register', ({ token, role, doctorId }) => {
      const decoded = verifySocketToken(token);
      if (!decoded) {
        socket.emit('error', { message: 'Unauthorized: invalid token' });
        return;
      }
      const userId = String(decoded.id);

      socket.join(`user:${userId}`);
      if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
      userSocketMap.get(userId).add(socket.id);

      // Doctors join their own room for queue updates
      if (role === 'doctor' && doctorId) {
        socket.join(`doctor:${doctorId}`);
      }

      // Admins join admin room
      if (role === 'admin') {
        socket.join('admin');
      }
    });

    socket.on('join:doctor-room', ({ token, doctorId }) => {
      const decoded = verifySocketToken(token);
      if (decoded && doctorId) socket.join(`doctor:${doctorId}`);
    });

    socket.on('join:admin-room', ({ token }) => {
      const decoded = verifySocketToken(token);
      if (decoded) socket.join('admin');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const [userId, sockets] of userSocketMap.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSocketMap.delete(userId);
      }
    });
  });
};

/**
 * Emit a queue:updated event to a specific doctor's room.
 */
export const emitQueueUpdate = (doctorId) => {
  if (!_io || !doctorId) return;
  _io.to(`doctor:${doctorId}`).emit('queue:updated', { doctorId, timestamp: Date.now() });
  // Also broadcast to admin room
  _io.to('admin').emit('queue:updated', { doctorId, timestamp: Date.now() });
};

/**
 * Emit a notification to a specific user.
 */
export const emitNotification = (userId, message) => {
  if (!_io || !userId) return;
  _io.to(`user:${userId}`).emit('notification', { ...message, timestamp: Date.now() });
};

/**
 * Emit an alert to all admins.
 */
export const emitAdminAlert = (message) => {
  if (!_io) return;
  _io.to('admin').emit('admin:alert', { ...message, timestamp: Date.now() });
};
