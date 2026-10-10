const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review_text: {
        type: String,
        required: true
    },
    review_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Review", reviewSchema);