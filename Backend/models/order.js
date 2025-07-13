const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    note: { type: String, default: '' },
    orderCode: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: Number, required: true },
    needPlasticUtensils: { type: Boolean, default: false },
    paymentMethod: {
        type: String,
        enum: ['cash', 'momo'],
        default: 'cash',
    },
    cartItems: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            price: Number,
            quantity: Number,
            image: String,
        },
    ],
    subtotal: Number,
    shippingFee: Number,
    discountAmount: Number,
    total: Number,
    status: {
        type: String,
        enum: ['Đang chờ', 'Đã nhận đơn', 'Đang giao', 'Đã giao', 'Đã hủy'],
        default: 'Đang chờ',
    },
    canceledAt: Date,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
