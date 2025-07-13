// promotionDisRoute.js
const express = require('express');
const router = express.Router();
const Promotion = require('../models/promotionModel');
const { protect } = require('../middleware/authMiddleware');

// [GET] Lấy danh sách mã Admin
router.get('/', async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 });
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// [POST] Tạo mã giảm giá Admin
router.post('/', async (req, res) => {
    const { code, discount, expiry } = req.body;

    if (!code || !discount || !expiry) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    try {
        const exist = await Promotion.findOne({ code });
        if (exist) {
            return res.status(409).json({ message: 'Mã đã tồn tại' });
        }

        const newPromo = await Promotion.create({
            code,
            discount,
            expiry,
        });

        res.status(201).json(newPromo);
    } catch (err) {
        res.status(500).json({ message: 'Tạo mã thất bại' });
    }
});

// [POST] Kiểm tra mã giảm giá
router.post('/validate', protect, async (req, res) => {
    const { code } = req.body;
    const userId = req.user._id;

    try {
        const promo = await Promotion.findOne({ code: code.toUpperCase() });
        console.log(' Kiểm tra mã:', code);
        console.log(' Người dùng:', userId);
        console.log(
            ' Mã đã dùng bởi:',
            promo.usedBy.map((id) => id.toString()),
        );
        if (!promo) {
            console.log(' Mã không tồn tại');
            return res.status(404).json({ message: 'Mã không tồn tại' });
        }

        if (new Date(promo.expiry) < new Date()) {
            console.log(' Mã đã hết hạn');
            return res.status(400).json({ message: 'Mã đã hết hạn' });
        }

        if (promo.usedBy.some((id) => id.toString() === userId.toString())) {
            console.log(' Mã đã được dùng bởi user này');
            return res.status(400).json({ message: 'Bạn đã dùng mã này rồi' });
        }
        console.log(' Mã hợp lệ, gửi discount:', promo.discount);
        res.json({ discount: promo.discount });
    } catch (err) {
        console.error(' Lỗi validate mã:', err);
        res.status(500).json({ message: 'Lỗi kiểm tra mã' });
    }
});

// [POST] Đánh dấu mã đã dùng
router.post('/mark-used', protect, async (req, res) => {
    const { code } = req.body;
    const userId = req.user._id;

    try {
        const promo = await Promotion.findOne({ code: code.toUpperCase() });
        console.log(' Đánh dấu mã:', code);
        console.log(' Người dùng:', userId);
        if (!promo) {
            console.log(' Không tìm thấy mã');
            return res.status(404).json({ message: 'Không tìm thấy mã' });
        }

        if (promo.usedBy?.includes(userId)) {
            console.log(' User đã từng dùng mã');
            return res.status(400).json({ message: 'Bạn đã sử dụng mã này rồi' });
        }

        promo.usedBy.push(userId);
        await promo.save();
        console.log(' Đã đánh dấu user dùng mã:', userId.toString());
        res.json({ message: 'Đã đánh dấu mã là đã dùng cho người dùng này' });
    } catch (err) {
        console.error(' Lỗi đánh dấu mã:', err);
        res.status(500).json({ message: 'Lỗi đánh dấu mã' });
    }
});

module.exports = router;
