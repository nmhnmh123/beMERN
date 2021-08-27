require('dotenv').config()
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User')

// @Route: POST api/auth/register
// @description: register user
// @access: public
router.post('/register', async (req, res) => {
    const { username, password } = req.body

    //simple validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing username and/or password" })
    }
    try {
        //check for existing user
        const user = await User.findOne({ username })
        if (user) {
            return res.status(400).json({ success: false, message: "Username has been registered" })
        }
        //everything ok
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({
            username,
            password: hashedPassword
        })
        await newUser.save()

        //return token
        const acccessToken = jwt.sign({userId: newUser._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({ success: true, message: "User created successfully", acccessToken })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" })
    }
})

// @Route: POST api/auth/login
// @description: login user
// @access: public
router.post('/login', async (req, res) => {
    const{username,password} = req.body

    //simple validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing username and/or password" })
    }

    try {
        //check existing user
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({ success: false, message: "Incorrect username or password" })
        }
        //Usernaem found
        const passwordValid = await argon2.verify(user.password, password)
        if(!passwordValid){
            return res.status(400).json({ success: false, message: "Incorrect username or password" })
        }
        //all good
        const acccessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET)
        res.json({ success: true, message: "Logged in successfully", acccessToken })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" })
    }
})

module.exports = router