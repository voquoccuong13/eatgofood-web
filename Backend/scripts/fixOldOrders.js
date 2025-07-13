// scripts/fixOldOrders.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/order');

const MONGO_URI =
    'mongodb+srv://cuong130602:2002%40@foodcluster.2rnin8d.mongodb.net/Food-web?retryWrites=true&w=majority';

async function fixOrders() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(' Connected to DB');

        // Lấy user cần gán cho đơn hàng cũ
        const user = await User.findOne({ email: 'voquoccuong130602@gmail.com' });
        if (!user) throw new Error('Không tìm thấy user');

        // Cập nhật các đơn hàng chưa có trường user
        const result = await Order.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });

        console.log(` Đã cập nhật ${result.modifiedCount} đơn hàng.`);
        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Lỗi cập nhật:', error);
        mongoose.disconnect();
    }
}

fixOrders();
