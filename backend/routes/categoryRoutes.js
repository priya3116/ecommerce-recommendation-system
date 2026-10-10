const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get one category
router.get("/:category_id", async (req, res) => {
    try {
        const category = await Category.findOne({
            category_id: req.params.category_id
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a category
router.post("/", async (req, res) => {
    try {
        const category = new Category(req.body);
        const savedCategory = await category.save();

        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Update a category
router.put("/:category_id", async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { category_id: req.params.category_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(category);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete a category
router.delete("/:category_id", async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
            category_id: req.params.category_id
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully",
            category
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;