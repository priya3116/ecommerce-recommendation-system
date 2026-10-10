const express = require("express");
const { create } = require("xmlbuilder2");
const Product = require("../models/Product");

const router = express.Router();

// EXPORT PRODUCTS TO XML

router.get("/products", async (req, res) => {
    try {
        const products = await Product.find();

        const root = create({ version: "1.0" })
            .ele("products");

        for (const product of products) {
            const productElement = root.ele("product");

            productElement.ele("product_id")
                .txt(product.product_id);

            productElement.ele("name")
                .txt(product.name);

            productElement.ele("category_id")
                .txt(product.category_id);

            productElement.ele("category")
                .txt(product.category);

            productElement.ele("brand")
                .txt(product.brand);

            productElement.ele("price")
                .txt(String(product.price));

            productElement.ele("stock")
                .txt(String(product.stock));

            productElement.ele("rating")
                .txt(String(product.rating));

            productElement.ele("num_reviews")
                .txt(String(product.num_reviews));

            productElement.ele("description")
                .txt(product.description || "");

            productElement.up();
        }

        const xml = root.end({
            prettyPrint: true
        });

        res.set("Content-Type", "application/xml");
        res.send(xml);

    } catch (error) {

        console.error(
            "XML export error:",
            error.message
        );

        res.status(500).json({
            message: "XML export failed",
            error: error.message
        });
    }
});


module.exports = router;