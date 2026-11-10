
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

    socket.join(userId);

    console.log('User connected:', userId);

    if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId).add(socket.id);

    io.emit('onlineUsers', Array.from(activeUsers.keys()));

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
