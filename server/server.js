const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const user = require('./schema/userSchema');
const db = require('./config/db');

app.use(cors({
    origin: process.env.CORS_PORT
}));

app.use(express.json());

const userRoute = require('./route/userRoute');
const messageRoute = require('./route/messageRoute');

app.use('/api', userRoute);
app.use('/api', messageRoute);

const middleware = require('./middleware/auth');

app.get('/auth', middleware, async (req, res) => {
    res.status(200).json({
        message: 'Authorization working'
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_PORT,
        methods: ['GET', 'POST']
    }
});

// Authenticate Socket.IO connection with JWT
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);

        socket.userId = decoded.id;

        next();

    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
});

app.set('io', io);

const activeUsers = new Map();

io.on('connection', (socket) => {
    const userId = String(socket.userId);

    socket.join(userId);

    console.log("User connected:", userId);
    console.log("Joined room:", userId);

    if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
    }

    activeUsers.get(userId).add(socket.id);

    io.emit('onlineUsers', Array.from(activeUsers.keys()));

    socket.on('disconnect', async () => {
        const connections = activeUsers.get(userId);

        console.log("User disconnected:", userId);
        
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

server.listen(process.env.PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT}`);
});