require('dotenv').config()
const { verify } = require('argon2');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth')

const Post = require('../models/Post')

// @Route: GET api/post
// @description: get post
// @access: private
router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId }).populate('user', ['username'])
        res.json({ success: true, posts })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

// @Route: POST api/post
// @description: create post
// @access: private
router.post('/', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body
    //simple validation
    if (!title) {
        return res.status(400).json({ success: false, message: "Title is requied" })
    }
    try {
        const newPost = new Post({
            title,
            description,
            url: (url.startsWith('https://')) ? url : `https://${url}`,
            status: status || 'TO LEARN',
            user: req.userId
        })

        await newPost.save()
        res.json({ success: true, message: "Happy learning", post: newPost })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

// @Route: PUT api/post
// @description: update post
// @access: private
router.put('/:id', verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body
    //simple validation
    if (!title) {
        return res.status(400).json({ success: false, message: "Title is requied" })
    }
    try {
        let updatedPost = {
            title,
            description: description || "",
            url: (url.startsWith('https://') ? url : `https://${url}`) || "",
            status: status || 'TO LEARN',
        }

        const updateCondition = { _id: req.params.id, user: req.userId }
        updatedPost = await Post.findOneAndUpdate(updateCondition, updatedPost, {new: true})
        
        //if user not authorised to update post 
        if(!updatedPost){
            return res.status(401).json({success: false, message: "Post not found or user not authorised"})
        }
        res.json({ success: true, message: "Update succesfully", post: updatedPost })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

// @Route: DELETE api/post
// @description: delete post
// @access: private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const condition = { _id: req.params.id, user: req.userId }
        const deletePost = await Post.findOneAndDelete(condition)

        //if user not authorised to update post 
        if(!deletePost){
            return res.status(401).json({success: false, message: "Post not found or user not authorised"})
        }
        res.json({ success: true, message: "Delete succesfully", post: deletePost })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" })
    }
})

module.exports = router