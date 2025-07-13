// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: String,
        image: String,
        price: Number,
        priceOld: Number,
        deal: String,
        description: String,
        category: String, // bò, gà, hải sản, chay, v.v.
        mainCategory: {
            type: String,
            enum: ['Burger', 'Pizza', 'Chicken', 'Thức uống', 'Tráng miệng', 'Combo'], // Danh mục chính
            required: true,
        },
        options: [
            {
                name: String,
                type: { type: String, enum: ['single', 'multiple'] },
                choices: [
                    {
                        label: String,
                        price: Number,
                    },
                ],
            },
        ],
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isBestSeller: {
            type: Boolean,
            default: false,
        },
        sales: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
