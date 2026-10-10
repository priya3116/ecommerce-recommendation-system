const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get one user
router.get("/:user_id", async (req, res) => {
    try {
        const user = await User.findOne({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a new user
router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();

        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Update a user
router.put("/:user_id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { user_id: req.params.user_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete a user
router.delete("/:user_id", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            user_id: req.params.user_id
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;