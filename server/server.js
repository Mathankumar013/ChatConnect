
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const user = require('./schema/userSchema');
const db = require('./config/db');

const userRoute = require('./route/userRoute');
const messageRoute = require('./route/messageRoute');
const middleware = require('./middleware/auth');

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'null',
    process.env.CORS_PORT
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

// Add this
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});
// API routes
app.use('/api', userRoute);
app.use('/api', messageRoute);

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'ChatConnect backend is running'
    });
});

// JWT authentication test
app.get('/auth', middleware, async (req, res) => {
    res.status(200).json({
        message: 'Authorization working'
    });
});

// HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Authenticate Socket.IO using JWT
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token required'));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_TOKEN
        );

        socket.userId = decoded.id;

        next();

    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
});

app.set('io', io);

const activeUsers = new Map();

// Socket.IO connection

io.on('connection', (socket) => {

    const userId = String(socket.userId);

    // Join private user room
    socket.join(userId);

    console.log('User connected:', userId);

    if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId).add(socket.id);

    io.emit('onlineUsers', Array.from(activeUsers.keys()));

    // ==================================
    // 1. USER A CALLS USER B
    // ==================================
    socket.on('call-user', ({ toUserId, callType }) => {

        if (!toUserId || !['video', 'audio'].includes(callType)) {
            return;
        }

        const receiverId = String(toUserId);

        if (!activeUsers.has(receiverId)) {
            socket.emit('call-unavailable', {
                message: 'User is offline'
            });
            return;
        }

        io.to(receiverId).emit('incoming-call', {
            fromUserId: userId,
            callType
        });

        console.log(`${userId} is calling ${receiverId}`);
    });

    // ==================================
    // 2. USER B ACCEPTS THE CALL
    // ==================================
    socket.on('accept-call', ({ toUserId }) => {

        if (!toUserId) return;

        io.to(String(toUserId)).emit('call-accepted', {
            fromUserId: userId
        });

        console.log(`${userId} accepted the call`);
    });

    // ==================================
    // 3. USER B REJECTS THE CALL
    // ==================================
    socket.on('reject-call', ({ toUserId }) => {

        if (!toUserId) return;

        io.to(String(toUserId)).emit('call-rejected', {
            fromUserId: userId
        });
    });

    // ==================================
    // 4. WEBRTC OFFER
    // ==================================
    socket.on('webrtc-offer', ({ toUserId, offer }) => {

        if (!toUserId || !offer) return;

        io.to(String(toUserId)).emit('webrtc-offer', {
            fromUserId: userId,
            offer
        });
    });

    // ==================================
    // 5. WEBRTC ANSWER
    // ==================================
    socket.on('webrtc-answer', ({ toUserId, answer }) => {

        if (!toUserId || !answer) return;

        io.to(String(toUserId)).emit('webrtc-answer', {
            fromUserId: userId,
            answer
        });
    });

    // ==================================
    // 6. ICE CANDIDATE
    // ==================================
    socket.on('ice-candidate', ({ toUserId, candidate }) => {

        if (!toUserId || !candidate) return;

        io.to(String(toUserId)).emit('ice-candidate', {
            fromUserId: userId,
            candidate
        });
    });

    // ==================================
    // 7. END CALL
    // ==================================
    socket.on('end-call', ({ toUserId }) => {

        if (!toUserId) return;

        io.to(String(toUserId)).emit('end-call', {
            fromUserId: userId
        });

        console.log(`${userId} ended the call`);
    });

    // ==================================
    // 8. USER DISCONNECT
    // ==================================
    socket.on('disconnect', async () => {

        const connections = activeUsers.get(userId);

        console.log('User disconnected:', userId);

        if (connections) {

            connections.delete(socket.id);

            if (connections.size === 0) {

                activeUsers.delete(userId);

                try {
                    await user.findByIdAndUpdate(userId, {
                        lastSeen: new Date()
                    });

                } catch (error) {
                    console.log('Last seen error:', error);
                }
            }
        }

        io.emit('onlineUsers', Array.from(activeUsers.keys()));
    });

});

// Render port
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
