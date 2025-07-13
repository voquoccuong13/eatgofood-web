// routes/promotion.js
const express = require('express');
const router = express.Router();
const PromotionSubscriber = require('../models/PromotionSubscriber');
const sendEmail = require('../utils/sendEmail');
const Order = require('../models/order');
const User = require('../models/User');
require('dotenv').config();
// route api lấy email đăng ký nhận khuyến mãi
router.post('/subscribe', async (req, res) => {
    try {
        const { email, name, phone } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email là bắt buộc' });
        }

        // Kiểm tra email đã đăng ký chưa
        const exists = await PromotionSubscriber.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: 'Email đã đăng ký nhận khuyến mãi' });
        }

        const subscriber = new PromotionSubscriber({ email, name, phone });
        await subscriber.save();

        res.status(201).json({ message: 'Đăng ký nhận khuyến mãi thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// route api admin
router.get('/subscribers', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const subscribers = await PromotionSubscriber.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });

        const total = await PromotionSubscriber.countDocuments();

        res.json({ subscribers, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// route api admin
router.post('/send-to-email', async (req, res) => {
    const { email, code, discount, expiry } = req.body;

    if (!email || !code || !discount || !expiry) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>🎁 Mã giảm giá dành riêng cho bạn</h2>
            <p>Xin chào <strong>${email}</strong>,</p>
            <p>Bạn nhận được một mã giảm giá đặc biệt từ chúng tôi:</p>
            <p style="font-size: 20px; color: #e91e63;">
                <strong>${code}</strong> - Giảm ${discount}
            </p>
            <p>Hạn sử dụng: <strong>${expiry}</strong></p>
            <a href="${process.env.FRONTEND_URL}" 
            style="display:inline-block;padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;margin-top:10px;">
            Dùng mã ngay
        </a>
            <hr/>
            <img src="cid:logo_cid" alt="Logo" style="width: 100px; margin-top: 20px;" />
        </div>
    `;

    try {
        await sendEmail(email, '🎉 Mã giảm giá dành cho bạn!', htmlContent);
        res.status(200).json({ message: 'Đã gửi mã thành công đến ' + email });
    } catch (error) {
        res.status(500).json({ message: 'Gửi email thất bại', error: error.message });
    }
});
// GET /api/promotion/potential-users
router.get('/potential-users', async (req, res) => {
    const { start, end } = getCurrentMonthRange();

    try {
        const potentialUsers = await Order.aggregate([
            {
                $match: {
                    status: 'Đã giao',
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$userId',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                },
            },
            {
                $match: {
                    $or: [{ orderCount: { $gte: 5 } }, { totalSpent: { $gte: 1000000 } }],
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    email: '$userInfo.email',
                    name: '$userInfo.name',
                    orderCount: 1,
                    totalSpent: 1,
                },
            },
        ]);

        res.json(potentialUsers); // Trả về array để frontend .map được
    } catch (error) {
        console.error('Lỗi khi lấy người dùng triển vọng:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Hàm lấy ngày đầu và cuối tháng hiện tại
function getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
}

router.post('/send-to-potential-users', async (req, res) => {
    const { promotionId } = req.body;

    if (!promotionId || !mongoose.Types.ObjectId.isValid(promotionId)) {
        return res.status(400).json({ message: 'ID mã giảm giá không hợp lệ' });
    }

    try {
        const promotion = await Promotion.findById(promotionId);
        if (!promotion) return res.status(404).json({ message: 'Không tìm thấy mã' });

        const { start, end } = getCurrentMonthRange();

        const potentialUsers = await Order.aggregate([
            {
                $match: {
                    status: 'Đã giao',
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$user', // ✅ đúng là 'user' chứ không phải 'userId'
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' }, // ✅ dùng đúng field
                },
            },
            {
                $match: {
                    $or: [{ orderCount: { $gte: 1 } }, { totalSpent: { $gte: 0 } }],
                },
            },

            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    email: '$userInfo.email',
                    name: '$userInfo.name',
                    orderCount: 1,
                },
            },
        ]);

        let sent = 0;
        const htmlContent = (email) => `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>🎁 Mã ưu đãi dành cho khách hàng thân thiết</h2>
                <p>Xin chào <strong>${email}</strong>,</p>
                <p>Với ${promotion.code} bạn sẽ được giảm <strong>${promotion.discount}%</strong></p>
                <p>Hạn sử dụng: <strong>${new Date(promotion.expiry).toLocaleDateString('vi-VN')}</strong></p>
                <a href="${process.env.FRONTEND_URL}/checkout?voucher=${promotion.code}"
                   style="display:inline-block;margin-top:10px;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
                   Dùng mã ngay
                </a>
                <hr/>
                <img src="cid:logo_cid" alt="Logo" style="width:100px;margin-top:20px;" />
            </div>
        `;

        for (const user of potentialUsers) {
            try {
                await sendEmail(user.email, '🎉 Mã ưu đãi đặc biệt dành cho bạn!', htmlContent(user.email));
                sent++;
                await new Promise((r) => setTimeout(r, 300)); // giãn 300ms giữa mỗi lần gửi
            } catch (err) {
                console.error(`Lỗi khi gửi đến ${user.email}:`, err.message);
            }
        }

        res.json({
            message: `Đã gửi thành công ${sent}/${potentialUsers.length} email đến người dùng triển vọng.`,
        });
    } catch (error) {
        console.error('Lỗi API:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});
router.get('/potential-users-debug', async (req, res) => {
    const { start, end } = getCurrentMonthRange();

    try {
        // console.log('📌 Start date:', start);
        // console.log('📌 End date:', end);

        // Bước 1: Tìm đơn đã giao trong tháng
        const orders = await Order.find({
            status: 'Đã giao',
            createdAt: { $gte: start, $lte: end },
        });
        // console.log(`📦 Số đơn đã giao trong tháng: ${orders.length}`);
        if (orders.length > 0) {
            // console.log('▶️ Mẫu đơn:', orders[0]);
        }

        // Bước 2: Thực hiện aggregate để lọc người dùng
        const potentialUsers = await Order.aggregate([
            {
                $match: {
                    status: 'Đã giao',
                    createdAt: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: '$user',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                },
            },
            {
                $match: {
                    $or: [{ orderCount: { $gte: 5 } }, { totalSpent: { $gte: 1000000 } }],
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    email: '$userInfo.email',
                    name: '$userInfo.name',
                    orderCount: 1,
                    totalSpent: 1,
                },
            },
        ]);

        // console.log(`🧑‍💻 Số người dùng triển vọng tìm được: ${potentialUsers.length}`);
        if (potentialUsers.length > 0) {
            // console.log('▶️ Mẫu user:', potentialUsers[0]);
        }

        res.json(potentialUsers);
    } catch (error) {
        console.error('❌ Lỗi khi lấy người dùng triển vọng:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;
