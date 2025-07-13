require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Kết nối MongoDB thành công');

        const exists = await User.findOne({ username: 'admin' });
        if (exists) {
            console.log('⚠️ Admin đã tồn tại');
            process.exit();
        }

        const adminUser = new User({
            name: 'Quản trị viên',
            email: 'admin@example.com',
            username: 'admin',
            password: '123456',
            role: 'admin',
        });

        await adminUser.save();
        console.log('✅ Admin đã được tạo');
        process.exit();
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });
