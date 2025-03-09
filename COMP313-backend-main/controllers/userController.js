const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.registerUser = async (req, res) => {
    try{
        console.log(req.body); // Log the incoming data

        const {name, email, password, type} = req.body;
        const existingUser = await User.findOne({ email })
        if(existingUser) return res.status(400).json({ message: "User already exists"});
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = new User({
            name,
            email,
            password: hashedPassword,
            type
        })
        await user.save()
        res.status(200).json({message: "User registered successfully!"})
    } catch(err) {
        res.status(500).json({err: err.message})
    }
}

exports.loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email })
        if(!user) return res.status(400).json({ message: "Invalid Credential!"});
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({ message: "Invalid Credential!"});
        const token = jwt.sign({id: user._id, type: user.type}, process.env.JWT_SECRET, {expiresIn: "1h"})
        res.cookie('token', token, { httpOnly: true, secure: false})
        res.status(200).json({message: "Login Successful", id: user._id, type: user.type})
    } catch(err) {
        res.status(500).json({err: err.message})
    }
}