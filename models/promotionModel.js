const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discount: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        expiry: {
            type: Date,
            required: true,
        },
        usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // NEW
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Promotion', promotionSchema);
