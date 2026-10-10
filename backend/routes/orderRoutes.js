const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get one order
router.get("/:order_id", async (req, res) => {
    try {
        const order = await Order.findOne({
            order_id: req.params.order_id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Create a new order
router.post("/", async (req, res) => {
    try {
        const order = new Order(req.body);
        const savedOrder = await order.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Update an order
router.put("/:order_id", async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { order_id: req.params.order_id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// Delete an order
router.delete("/:order_id", async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({
            order_id: req.params.order_id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order deleted successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;