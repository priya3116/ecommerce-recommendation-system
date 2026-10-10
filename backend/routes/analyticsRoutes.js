const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// Overall sales statistics
router.get("/summary", async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total_amount" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$total_amount" }
                }
            }
        ]);

        if (result.length === 0) {
            return res.json({
                totalSales: 0,
                totalOrders: 0,
                averageOrderValue: 0
            });
        }

        res.json({
            totalSales: result[0].totalSales,
            totalOrders: result[0].totalOrders,
            averageOrderValue: result[0].averageOrderValue
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Best-selling products
router.get("/best-selling", async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $unwind: "$products" },

            {
                $group: {
                    _id: "$products.product_id",
                    totalQuantity: {
                        $sum: "$products.quantity"
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                "$products.quantity",
                                "$products.price"
                            ]
                        }
                    }
                }
            },

            {
                $sort: {
                    totalQuantity: -1
                }
            },

            {
                $limit: 10
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Sales by category
router.get("/sales-by-category", async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $unwind: "$products" },

            {
                $lookup: {
                    from: "products",
                    localField: "products.product_id",
                    foreignField: "product_id",
                    as: "productDetails"
                }
            },

            { $unwind: "$productDetails" },

            {
                $group: {
                    _id: "$productDetails.category",
                    totalSales: {
                        $sum: {
                            $multiply: [
                                "$products.quantity",
                                "$products.price"
                            ]
                        }
                    },
                    totalQuantity: {
                        $sum: "$products.quantity"
                    }
                }
            },

            {
                $sort: {
                    totalSales: -1
                }
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Top customers
router.get("/top-customers", async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: "$user_id",
                    totalOrders: {
                        $sum: 1
                    },
                    totalSpent: {
                        $sum: "$total_amount"
                    }
                }
            },

            {
                $sort: {
                    totalSpent: -1
                }
            },

            {
                $limit: 10
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Sales by city
router.get("/sales-by-city", async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "user_id",
                    as: "userDetails"
                }
            },

            { $unwind: "$userDetails" },

            {
                $group: {
                    _id: "$userDetails.city",
                    totalOrders: {
                        $sum: 1
                    },
                    totalSales: {
                        $sum: "$total_amount"
                    }
                }
            },

            {
                $sort: {
                    totalSales: -1
                }
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Monthly sales
router.get("/monthly-sales", async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$order_date" },
                        month: { $month: "$order_date" }
                    },
                    totalSales: {
                        $sum: "$total_amount"
                    },
                    totalOrders: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Product ratings and reviews
router.get("/product-ratings", async (req, res) => {
    try {
        const result = await Order.db
            .collection("reviews")
            .aggregate([
                {
                    $group: {
                        _id: "$product_id",
                        averageRating: {
                            $avg: "$rating"
                        },
                        totalReviews: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        averageRating: -1
                    }
                }
            ])
            .toArray();

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Low stock products
router.get("/low-stock", async (req, res) => {
    try {
        const result = await Product.find({
            stock: { $lte: 10 }
        }).sort({
            stock: 1
        });

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Order status analytics
router.get("/order-status", async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    totalOrders: {
                        $sum: 1
                    },
                    totalSales: {
                        $sum: "$total_amount"
                    }
                }
            },

            {
                $sort: {
                    totalOrders: -1
                }
            }
        ]);

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;