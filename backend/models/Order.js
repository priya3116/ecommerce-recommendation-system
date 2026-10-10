const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema(
    {
        product_id: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const calculateLineTotal = (products = []) =>
    products.reduce((sum, item) => {
        const quantity = Number(item?.quantity || 0);
        const price = Number(item?.price || 0);
        return sum + quantity * price;
    }, 0);

const orderSchema = new mongoose.Schema(
    {
        order_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        user_id: {
            type: String,
            required: true,
            trim: true
        },
        order_date: {
            type: Date,
            required: true,
            default: Date.now
        },
        products: {
            type: [orderProductSchema],
            required: true,
            default: []
        },
        total_amount: {
            type: Number,
            required: true,
            min: 0
        },
        payment_method: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            required: true,
            default: "Pending",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

orderSchema.pre("validate", function () {
    if (!Array.isArray(this.products) || this.products.length === 0) {
        this.invalidate("products", "Order must contain at least one product");
        return;
    }

    const computedTotal = calculateLineTotal(this.products);

    if (this.total_amount == null) {
        this.total_amount = computedTotal;
    } else if (Number(this.total_amount) !== computedTotal) {
        this.invalidate(
            "total_amount",
            "total_amount must match the sum of product quantities and prices"
        );
    }

    if (!this.status) {
        this.status = "Pending";
    }
});

orderSchema.pre("save", function (next) {
    if (!Array.isArray(this.products) || this.products.length === 0) {
        return next(new Error("Order must contain at least one product"));
    }

    const computedTotal = calculateLineTotal(this.products);

    if (this.total_amount == null) {
        this.total_amount = computedTotal;
    } else if (Number(this.total_amount) !== computedTotal) {
        return next(new Error("total_amount must match the sum of product quantities and prices"));
    }

    if (!this.status) {
        this.status = "Pending";
    }

    next();
});

module.exports = mongoose.model("Order", orderSchema);