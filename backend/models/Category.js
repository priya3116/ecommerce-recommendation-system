const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    category_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Category", categorySchema);