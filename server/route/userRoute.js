const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../schema/userSchema');
const auth = require('../middleware/auth');

const route = express.Router();

route.post('/register', async (req, res) => {
    const { userName, email, password } = req.body;
    const user = await userSchema.findOne({ email: email });
    if (user) {
        return res.status(409).send({
            message: "Email is already used. Please use Different Email"
        })
    }
    if (password.length < 8) {
        return res.status(400).send({
            message: "Password must be at least 8 characters."
        })
    }
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        await userSchema.create({
            userName: userName,
            email: email,
            password: passwordHash
        })
        res.status(201).send({
            message: "Register Successfully"
        })
    } catch (err) {
        res.status(400).send({
            message: "Register Failed"
        })
    }
})

route.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email: email });
    if (!user) {
        return res.status(400).send({
            message: "Email is not found.plese Enter your Correct Email"
        })
    }
    const pashCompare = await bcrypt.compare(password, user.password);
    if (!pashCompare) {
        return res.status(409).send({
            message: "password is invalid. please Enter your valid Password"
        })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "30d" });
    res.status(200).send({
        message: "Login Successfully",
        token: token,
        userId: user._id
    })

})

route.get('/search', auth, async (req, res) => {
    const { username = '' } = req.query;

    try {
        const users = await userSchema.find({
            userName: {
                $regex: username.trim(),
                $options: 'i'
            },
            _id: {
                $ne: req.user.id
            }
        }).select('userName email profileImage lastSeen');

        return res.status(200).json(users);

    } catch (err) {
        console.log("Search error:", err);

        return res.status(500).json({
            message: "Username search failed"
        });
    }
});

module.exports = route;