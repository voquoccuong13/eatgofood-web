const mongoose = require('mongoose');

const tempOrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderCode: { type: String, required: true, unique: true },
    cartItems: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TempOrder', tempOrderSchema);
