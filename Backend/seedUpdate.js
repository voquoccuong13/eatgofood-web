const mongoose = require('mongoose');
const Product = require('./models/productModel');
require('dotenv').config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        const res = await Product.updateMany(
            { mainCategory: { $in: ['Burger', 'Pizza', 'Chicken', 'Thức uống', 'Tráng miệng'] } },
            { $set: { isBestSeller: true, sales: 200 } },
        );

        console.log('✅ Đã cập nhật', res.modifiedCount, 'sản phẩm');
        mongoose.disconnect();
    })
    .catch((err) => console.error(err));
