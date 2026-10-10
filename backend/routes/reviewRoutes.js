const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

// Get all reviews
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get one review
router.get("/:review_id", async (req, res) => {
    try {
        const review = await Review.findOne({
            review_id: req.params.review_id
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a new review
router.post("/", async (req, res) => {
    try {
        const review = new Review(req.body);
        const savedReview = await review.save();

        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Update a review
router.put("/:review_id", async (req, res) => {
    try {
        const review = await Review.findOneAndUpdate(
            { review_id: req.params.review_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json(review);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete a review
router.delete("/:review_id", async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({
            review_id: req.params.review_id
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.json({
            message: "Review deleted successfully",
            review
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;