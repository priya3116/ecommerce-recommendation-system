const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single product
router.get("/:product_id", async (req, res) => {
    try {
        const product = await Product.findOne({
            product_id: req.params.product_id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Add a new product
router.post("/", async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Update a product
router.put("/:product_id", async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { product_id: req.params.product_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete a product
router.delete("/:product_id", async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            product_id: req.params.product_id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;