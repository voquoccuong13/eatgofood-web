const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const userRoute = require('./routes/userRoute');
const cartRoute = require('./routes/cartRoute');
const oderRoute = require('./routes/oderRoute');
const momoRoute = require('./routes/momoRoute');
const reportRoute = require('./routes/reportRoute');
const promotionRoute = require('./routes/promotionRoute');
const reviewRoute = require('./routes/reviewRoute');
const promotionDisRoute = require('./routes/promotionDisRoute'); // Đường dẫn mới cho mã giảm giá
const chatbotRoute = require('./routes/chatbotRoute');
const vnpayRoute = require('./routes/vnpayRoute');
const { connectDB } = require('./config/db');

dotenv.config();
const app = express();

// const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
// Middleware toàn cục
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Debug middleware - ĐẶT TRƯỚC CÁC ROUTES
// app.use((req, res, next) => {
//     console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
//     console.log('🔑 Headers:', req.headers.authorization ? 'Has token' : 'No token');
//     next();
// });

// Serve thư mục 'uploads' để truy cập hình ảnh tĩnh qua URL
// app.use((req, res, next) => {
//     console.log(`📡 ${req.method} ${req.originalUrl}`);
//     console.log('🔍 Body:', req.body);
//     next();
// });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const productRoutes = require('./routes/productRoute');

// API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoute);
app.use('/api/users', cartRoute); // route giỏ hàng
console.log('✅ Gắn route [cartRoute] tại /api/users');
app.use('/api/orders', oderRoute);

app.use('/api/momo', momoRoute);
app.use('/api/vnpay', vnpayRoute);
// Route thanh toán VNPay
// app.post('/api/vnpay', async (req, res) => {
//     const vnpay = new VNPay({
//         vnp_TmnCode: process.env.VNP_TMNCODE,
//         vnp_HashSecret: process.env.VNP_HASHSECRET,
//         vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
//         // vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
//         vnp_Locale: VnpLocale.VN, // Ngôn ngữ hiển thị
//         vnp_CurrCode: 'VND', // Mã tiền tệ
//         // vnp_ProductCode: ProductCode.MOMO, // Mã sản phẩm
//         testMode: true, // Chế độ test
//         loggerFn: ignoreLogger, // Bỏ qua log
//     });
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const vnpayResponse = await vnpay.buildPaymentUrl({
//         vnp_Amount: 50000,
//         vnp_IpAddr: '127.0.0.1',
//         vnp_TxnRef: '1234567890',
//         vnp_OrderInfo: '1234567890',
//         vnp_OrderType: ProductCode.Other,
//         vnp_ReturnUrl: 'http://localhost:9000/api/vnpay/return', // URL trả về sau khi thanh toán
//         vnp_Locale: VnpLocale.VN, // Ngôn ngữ hiển thị
//         vnp_CreateDate: dateFormat(new Date()), // Ngày tạo giao dịch
//         vnp_ExpireDate: dateFormat(tomorrow), // Ngày hết hạn giao dịch
//     });
//     return res.status(201).json(vnpayResponse);
// });
app.use('/api/promotion', promotionRoute);
//api doanh thu
app.use('/api/admin', reportRoute);
//api đánh giá
app.use('/api/reviews', reviewRoute);
// API mã giảm giá
app.use('/api/promotion-discounts', promotionDisRoute);
// Route trang chính
app.get('/', (req, res) => {
    res.send('API is running...');
});
// ROU CHO CHATBOT
app.use('/api/chatbot', chatbotRoute);
// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
});

// Log routes mounted
// console.log('🛣️ Routes mounted:');
// console.log('   /api/admin/* -> reportRoute');
// console.log('   /api/users/* -> userRoute');
// console.log('   /api/orders/* -> orderRoute');
// console.log('   /api/products/* -> productRoutes');

// Kết nối DB rồi mới listen server
connectDB()
    .then(() => {
        console.log('✅ Đã kết nối MongoDB');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy trên cổng http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Lỗi kết nối MongoDB', err);
    });
