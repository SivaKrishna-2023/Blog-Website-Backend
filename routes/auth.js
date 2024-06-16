const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();


//Register 

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword // Save hashed password to the database
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Return response without the hashed password
        res.status(200).json({
            _id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email
        });
    } catch (err) {
        console.error("Error in user registration:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Login

router.post("/login", async(req,res)=>{
    try{

        const user = await User.findOne({email: req.body.email})

        if(!user){
            return res.status(404).json("User not found")
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match){
            return res.status(401).json("Wrong Password")
        }

        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: '3d' }
        );
        const {password, ...info} = user._doc 
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }).status(200).json(info)

    }
    catch(err){
        res.status(500).json(err)
    }
})

//Logout 

router.get("/logout", async(req, res)=>{
    try{
        res.clearCookie("token", {sameSite:'none', secure:true}).status(200).send("user logged out successfully")

    }
    catch(err){
        res.status(500).json(err)
    }
})

//Refetch 

router.get("/refetch", (req,res) =>{
    const token = req.cookies.token
    jwt.verify(token,process.env.SECRET, {}, async(err, data) =>{
        if(err){
            return res.status(400).json(err)
        }
        res.status(200).json(data)
    })
})

module.exports = router