const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const post = require('../models/Post')
const Comment = require('../models/Comments')
const verifyToken = require('../verifyToken')



//update 
router.put("/:id", verifyToken, async(req, res) =>{
    try{
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hashSync(req.body.password, salt);
            
        }

        const updateUser = await User.findByIDAndUpadate(req.params.id,
            {$set: req.body},
            {new: true}
        );
        res.status(200).json(updateUser)
    }
    catch(err){
        res.status(500).json(err)
    }
});

//Delete

router.delete("/:id", verifyToken, async(req,res) =>{
    try{
        await User.findByIDAndDelete(req.params.id)
        await post.deletMany({userId: req.params.id})
        await Comment.deletMany({userId: req.params.id})
        res.status(200).json("user deleted successfully")
    }
    catch(err){
        res.status(500).json(err)
    }
})

//Get User 
router.get("/:id", async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        const {password, ...info} = user._doc
        res.status(200).json(info)

    }
    catch(err){
        res.status(500).json(err)
    }
})

module.exports = router