const express = require('express');
const router = express.Router();

const Message = require('../schema/messageSchema');
const User = require('../schema/userSchema');
const authMiddleware = require('../middleware/auth');

// GET: Load all conversations for the logged-in user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const myId = String(req.user.id);

        const messages = await Message.find({
            $or: [
                { sender: myId },
                { receiver: myId }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        // Keep only the latest message for each other user
        const latestMessages = new Map();

        messages.forEach((msg) => {
            const otherUserId =
                String(msg.sender) === myId
                    ? String(msg.receiver)
                    : String(msg.sender);

            if (!latestMessages.has(otherUserId)) {
                latestMessages.set(otherUserId, msg);
            }
        });

        const userIds = Array.from(latestMessages.keys());

        const users = await User.find({
            _id: { $in: userIds }
        }).select('-password').lean();

        const conversations = users.map((person) => {
            const lastMessage = latestMessages.get(String(person._id));

            return {
                ...person,
                lastMessage: lastMessage.message,
                lastMessageAt: lastMessage.createdAt
            };
        });

        conversations.sort(
            (a, b) =>
                new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

        res.status(200).json(conversations);

    } catch (error) {
        console.log('Get conversations error:', error);
        res.status(500).json({
            message: 'Failed to load conversations'
        });
    }
});


// GET: Load messages between logged-in user and selected user
router.get('/messages/:userId', authMiddleware, async (req, res) => {
    try {
        const myId = String(req.user.id);
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId }
            ]
        })
            .sort({ createdAt: 1 })
            .lean();

        const formattedMessages = messages.map((msg) => ({
            ...msg,
            isMine: String(msg.sender) === myId
        }));

        res.status(200).json(formattedMessages);

    } catch (error) {
        console.log('Get messages error:', error);
        res.status(500).json({
            message: 'Failed to load messages'
        });
    }
});


// POST: Send a new message
router.post('/messages', authMiddleware, async (req, res) => {
    try {
        const senderId = String(req.user.id);
        const { receiver, message } = req.body;

        if (!receiver || !message || !message.trim()) {
            return res.status(400).json({
                message: 'Receiver and message are required'
            });
        }

        if (senderId === String(receiver)) {
            return res.status(400).json({
                message: 'You cannot send a message to yourself'
            });
        }

        const receiverExists = await User.findById(receiver);

        if (!receiverExists) {
            return res.status(404).json({
                message: 'Receiver not found'
            });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver,
            message: message.trim()
        });

        // Send Socket.IO event only to the receiver.
        // The sender gets the saved message from the POST response.
        const io = req.app.get('io');

        if (io) {
            io.to(String(receiver)).emit('newMessage', newMessage);
        }

        res.status(201).json({
            message: 'Message sent successfully',
            data: newMessage
        });

    } catch (error) {
        console.log('Send message error:', error);
        res.status(500).json({
            message: 'Failed to send message'
        });
    }
});

module.exports = router;