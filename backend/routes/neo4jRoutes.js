const express = require("express");
const driver = require("../config/neo4j");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");

const router = express.Router();

async function resolveUserByNameOrId(session, rawIdentifier) {
    const identifier = String(rawIdentifier || "").trim();

    if (!identifier) {
        throw new Error("User identifier is required");
    }

    const result = await session.run(
        `
        MATCH (u:User)
        WHERE toLower(u.user_id) = toLower($identifier)
           OR toLower(u.name) = toLower($identifier)
        RETURN u.user_id AS user_id, u.name AS name
        LIMIT 1
        `,
        { identifier }
    );

    if (result.records.length === 0) {
        throw new Error(`User not found: ${identifier}`);
    }

    const record = result.records[0];

    return {
        user_id: record.get("user_id"),
        name: record.get("name")
    };
}

// TEST NEO4J CONNECTION
router.get("/test", async (req, res) => {
    const session = driver.session();

    try {
        const result = await session.run(
            "RETURN 1 AS result"
        );

        res.json({
            message: "Neo4j connected successfully",
            result: result.records[0].get("result").toNumber()
        });

    } catch (error) {
        console.error("Neo4j connection error:", error.message);

        res.status(500).json({
            message: "Neo4j connection failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});


// SYNC PRODUCTS FROM MONGODB TO NEO4J
router.post("/sync-products", async (req, res) => {
    const session = driver.session();

    try {
        const products = await Product.find();

        for (const product of products) {

            await session.run(
                `
                MERGE (p:Product {product_id: $product_id})
                SET
                    p.name = $name,
                    p.category_id = $category_id,
                    p.category = $category,
                    p.brand = $brand,
                    p.price = $price,
                    p.stock = $stock,
                    p.rating = $rating,
                    p.num_reviews = $num_reviews,
                    p.description = $description
                `,
                {
                    product_id: product.product_id,
                    name: product.name,
                    category_id: product.category_id,
                    category: product.category,
                    brand: product.brand,
                    price: product.price,
                    stock: product.stock,
                    rating: product.rating,
                    num_reviews: product.num_reviews,
                    description: product.description || ""
                }
            );
        }

        res.json({
            message: "Products synchronized successfully",
            count: products.length
        });

    } catch (error) {
        console.error("Product sync error:", error.message);

        res.status(500).json({
            message: "Product synchronization failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// SYNC CATEGORIES FROM MONGODB TO NEO4J AND CREATE BELONGS_TO RELATIONSHIPS
router.post("/sync-categories", async (req, res) => {
    const session = driver.session();

    try {

        // Read directly from MongoDB collection
        // This avoids any Mongoose schema field mismatch.
        const categories = await Category.collection
            .find({})
            .toArray();


        for (const category of categories) {

            await session.run(
                `
                MERGE (c:Category {
                    category_id: $category_id
                })

                SET
                    c.name = $category_name,
                    c.description = $description

                WITH c

                MATCH (p:Product {
                    category_id: $category_id
                })

                MERGE (p)-[:BELONGS_TO]->(c)
                `,
                {
                    category_id: category.category_id,
                    category_name: category.category_name || "",
                    description: category.description || ""
                }
            );
        }


        res.json({
            message: "Categories synchronized successfully",
            count: categories.length
        });

    } catch (error) {

        console.error(
            "Category sync error:",
            error.message
        );

        res.status(500).json({
            message: "Category synchronization failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// =====================================================
// SYNC USERS FROM MONGODB TO NEO4J
// POST /api/neo4j/sync-users
// =====================================================

router.post("/sync-users", async (req, res) => {
    const session = driver.session();

    try {
        // Read directly from MongoDB collection
        const users = await User.collection
            .find({})
            .toArray();

        for (const user of users) {

            await session.run(
                `
                MERGE (u:User {
                    user_id: $user_id
                })

                SET
                    u.name = $name,
                    u.email = $email,
                    u.phone = $phone,
                    u.city = $city,
                    u.age = $age,
                    u.registration_date = $registration_date
                `,
                {
                    user_id: user.user_id,
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    city: user.city || "",
                    age: user.age || 0,
                    registration_date: user.registration_date
                        ? user.registration_date.toISOString()
                        : ""
                }
            );
        }

        res.json({
            message: "Users synchronized successfully",
            count: users.length
        });

    } catch (error) {

        console.error(
            "User sync error:",
            error.message
        );

        res.status(500).json({
            message: "User synchronization failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// SYNC PURCHASED RELATIONSHIPS FROM MONGODB ORDERS

router.post("/sync-purchases", async (req, res) => {
    const session = driver.session();

    try {
        const orders = await Order.collection
            .find({})
            .toArray();

        let relationshipCount = 0;

        for (const order of orders) {

            for (const item of order.products) {

                await session.run(
                    `
                    MATCH (u:User {
                        user_id: $user_id
                    })

                    MATCH (p:Product {
                        product_id: $product_id
                    })

                    MERGE (u)-[r:PURCHASED]->(p)

                    SET
                        r.quantity = $quantity,
                        r.price = $price,
                        r.order_id = $order_id,
                        r.order_date = $order_date
                    `,
                    {
                        user_id: order.user_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price: item.price,
                        order_id: order.order_id,
                        order_date: order.order_date
                            ? new Date(order.order_date).toISOString()
                            : ""
                    }
                );

                relationshipCount++;
            }
        }

        res.json({
            message: "Purchase relationships synchronized successfully",
            count: relationshipCount
        });

    } catch (error) {

        console.error(
            "Purchase sync error:",
            error.message
        );

        res.status(500).json({
            message: "Purchase synchronization failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// SYNC RATED RELATIONSHIPS FROM MONGODB REVIEWS

router.post("/sync-reviews", async (req, res) => {
    const session = driver.session();

    try {
        const reviews = await Review.collection
            .find({})
            .toArray();

        let relationshipCount = 0;

        for (const review of reviews) {

            await session.run(
                `
                MATCH (u:User {
                    user_id: $user_id
                })

                MATCH (p:Product {
                    product_id: $product_id
                })

                MERGE (u)-[r:RATED]->(p)

                SET
                    r.rating = $rating,
                    r.review_id = $review_id,
                    r.review_text = $review_text,
                    r.review_date = $review_date
                `,
                {
                    user_id: review.user_id,
                    product_id: review.product_id,
                    rating: review.rating,
                    review_id: review.review_id,
                    review_text: review.review_text || "",
                    review_date: review.review_date
                        ? new Date(review.review_date).toISOString()
                        : ""
                }
            );

            relationshipCount++;
        }

        res.json({
            message: "Review relationships synchronized successfully",
            count: relationshipCount
        });

    } catch (error) {

        console.error(
            "Review sync error:",
            error.message
        );

        res.status(500).json({
            message: "Review synchronization failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// PRODUCT RECOMMENDATIONS

router.get("/recommendations/:user_id", async (req, res) => {
    const session = driver.session();

    const rawIdentifier = req.params.user_id;

    try {
        const user = await resolveUserByNameOrId(session, rawIdentifier);
        const user_id = user.user_id;

        const result = await session.run(
            `
            MATCH (u:User {user_id: $user_id})
                  -[:PURCHASED]->(p:Product)

            MATCH (otherUser:User)
                  -[:PURCHASED]->(p)

            MATCH (otherUser)
                  -[:PURCHASED]->(recommended:Product)

            WHERE otherUser.user_id <> $user_id
              AND NOT (u)-[:PURCHASED]->(recommended)

            RETURN
                recommended.product_id AS product_id,
                recommended.name AS product_name,
                recommended.category AS category,
                recommended.brand AS brand,
                recommended.price AS price,
                count(*) AS recommendation_score

            ORDER BY recommendation_score DESC

            LIMIT 10
            `,
            {
                user_id: user_id
            }
        );

        const recommendations = result.records.map(record => ({
            product_id: record.get("product_id"),
            product_name: record.get("product_name"),
            category: record.get("category"),
            brand: record.get("brand"),
            price: record.get("price"),
            recommendation_score: record
                .get("recommendation_score")
                .toNumber()
        }));

        res.json({
            user_id: user_id,
            recommendations: recommendations
        });

    } catch (error) {

        console.error(
            "Recommendation error:",
            error.message
        );

        const statusCode = error.message.startsWith("User not found") ? 404 : 500;

        res.status(statusCode).json({
            message: statusCode === 404 ? `User not found: ${rawIdentifier}` : "Recommendation generation failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// SIMILAR PRODUCT RECOMMENDATIONS

router.get("/similar-products/:product_id", async (req, res) => {
    const session = driver.session();

    const { product_id } = req.params;

    try {
        const result = await session.run(
            `
            MATCH (p:Product {product_id: $product_id})
                  <-[:PURCHASED]-(u:User)
                  -[:PURCHASED]->(similar:Product)

            WHERE similar.product_id <> $product_id

            RETURN
                similar.product_id AS product_id,
                similar.name AS product_name,
                similar.category AS category,
                similar.brand AS brand,
                similar.price AS price,
                count(DISTINCT u) AS common_buyers

            ORDER BY common_buyers DESC

            LIMIT 10
            `,
            {
                product_id: product_id
            }
        );

        const recommendations = result.records.map(record => ({
            product_id: record.get("product_id"),
            product_name: record.get("product_name"),
            category: record.get("category"),
            brand: record.get("brand"),
            price: record.get("price"),
            common_buyers: record
                .get("common_buyers")
                .toNumber()
        }));

        res.json({
            product_id: product_id,
            similar_products: recommendations
        });

    } catch (error) {

        console.error(
            "Similar product error:",
            error.message
        );

        res.status(500).json({
            message: "Similar product recommendation failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

// RATING-AWARE PRODUCT RECOMMENDATIONS

router.get("/top-rated-recommendations/:user_id", async (req, res) => {
    const session = driver.session();

    const rawIdentifier = req.params.user_id;

    try {
        const user = await resolveUserByNameOrId(session, rawIdentifier);
        const user_id = user.user_id;

        const result = await session.run(
            `
            MATCH (u:User {user_id: $user_id})
                  -[:PURCHASED]->(p:Product)

            MATCH (otherUser:User)
                  -[:PURCHASED]->(p)

            MATCH (otherUser)
                  -[:PURCHASED]->(recommended:Product)

            WHERE otherUser.user_id <> $user_id
              AND NOT (u)-[:PURCHASED]->(recommended)

            WITH recommended, count(DISTINCT otherUser) AS common_buyers

            RETURN
                recommended.product_id AS product_id,
                recommended.name AS product_name,
                recommended.category AS category,
                recommended.brand AS brand,
                recommended.price AS price,
                recommended.rating AS rating,
                common_buyers,
                (common_buyers * 2 + recommended.rating) AS recommendation_score

            ORDER BY recommendation_score DESC

            LIMIT 10
            `,
            {
                user_id: user_id
            }
        );

        const recommendations = result.records.map(record => ({
            product_id: record.get("product_id"),
            product_name: record.get("product_name"),
            category: record.get("category"),
            brand: record.get("brand"),
            price: record.get("price"),
            rating: record.get("rating"),
            common_buyers: record.get("common_buyers").toNumber(),
            recommendation_score: record
                .get("recommendation_score")
                .toNumber()
        }));

        res.json({
            user_id: user_id,
            recommendations: recommendations
        });

    } catch (error) {
        console.error(
            "Rating recommendation error:",
            error.message
        );

        const statusCode = error.message.startsWith("User not found") ? 404 : 500;

        res.status(statusCode).json({
            message: statusCode === 404 ? `User not found: ${rawIdentifier}` : "Rating-aware recommendation failed",
            error: error.message
        });

    } finally {
        await session.close();
    }
});

module.exports = router;