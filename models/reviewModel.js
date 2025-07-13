const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        orderCode: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        userAvatar: { type: String },
        foodName: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        images: [{ type: String }],
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Review', reviewSchema);
