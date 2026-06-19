require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => res.json({ status: 'HomeCare API running', version: '1.0.0' }));

// Socket.io for real-time chat/notifications
const onlineUsers = new Map();
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
  });
  socket.on('send_notification', ({ to, notification }) => {
    io.to(to).emit('notification', notification);
  });
  socket.on('send_message', ({ to, message }) => {
    io.to(to).emit('new_message', message);
  });
  socket.on('typing', ({ to, from, name }) => {
    io.to(to).emit('user_typing', { from, name });
  });
  socket.on('stop_typing', ({ to, from }) => {
    io.to(to).emit('user_stop_typing', { from });
  });
  socket.on('disconnect', () => {
    onlineUsers.forEach((sid, uid) => { if (sid === socket.id) onlineUsers.delete(uid); });
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`HomeCare Server running on port ${PORT}`));
