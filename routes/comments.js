const express = require('express');
const router = express.Router();
const Comment = require('../models/Comments');
const verifyToken = require('../verifyToken');

// Create Comment
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { comment, author, postId } = req.body;
        const userId = req.userId; // Retrieved from token

        if (!comment || !author || !postId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newComment = new Comment({ comment, author, postId, userId });
        const savedComment = await newComment.save();
        res.status(200).json(savedComment);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Comment
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Comment
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json("Comment deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Comments by Post ID
router.get("/post/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;