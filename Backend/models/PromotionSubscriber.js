// models/PromotionSubscriber.js
const mongoose = require('mongoose');

const promotionSubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PromotionSubscriber', promotionSubscriberSchema);
