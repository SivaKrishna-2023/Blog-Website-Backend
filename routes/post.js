const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comments');
const verifyToken = require('../verifyToken');

// Create a new post
router.post('/create', verifyToken, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Update a post by ID
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete a post by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        await Comment.deleteMany({ postId: req.params.id });
        res.status(200).json({ message: "Post and associated comments deleted" });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Get post details by ID
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post details' });
    }
});

// Get all posts or search by title
router.get("/", async (req, res) => {
    try {
        const searchFilter = req.query.search
            ? { title: { $regex: req.query.search, $options: "i" } }
            : {};
        const posts = await Post.find(searchFilter);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get posts by userId
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

module.exports = router;