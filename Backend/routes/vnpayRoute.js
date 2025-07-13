const express = require('express');
const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const router = express.Router();

const Order = require('../models/order');
const TempOrder = require('../models/TempOrder');
const Cart = require('../models/cart');
const { protect } = require('../middleware/authMiddleware');

const { VNP_TMNCODE, VNP_HASHSECRET, VNP_URL, VNP_RETURN_URL } = process.env;
// Bỏ dấu tiếng Việt để tránh lỗi VNPay
function removeAccents(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
        .replace(/[đĐ]/g, (d) => (d === 'đ' ? 'd' : 'D'));
}

// 🧾 Tạo yêu cầu thanh toán
router.post('/create_payment', protect, async (req, res) => {
    console.log('📤 [VNPay] Bắt đầu tạo yêu cầu thanh toán...');
    console.log('🌐 VNP_RETURN_URL:', VNP_RETURN_URL);

    try {
        const orderCode = nanoid(8).replace(/[^a-zA-Z0-9]/g, '');
        const createDate = moment().format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (ipAddr === '::1') ipAddr = '127.0.0.1';

        const {
            fullName,
            email,
            phone,
            address,
            distance,
            total,
            subtotal,
            shippingFee,
            discountAmount,
            needPlasticUtensils,
            cartItems,
        } = req.body;

        // Kiểm tra dữ liệu
        if (!total || !Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('❌ Thiếu hoặc sai dữ liệu đơn hàng');
            return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ' });
        }

        console.log('🧾 Dữ liệu đơn hàng:', {
            orderCode,
            fullName,
            email,
            phone,
            address,
            total,
            subtotal,
            shippingFee,
            discountAmount,
            distance,
            needPlasticUtensils,
            cartItems,
        });

        // Lưu đơn tạm
        await TempOrder.create({
            userId: req.user._id,
            orderCode,
            cartItems,
        });

        const extraDataObj = {
            userId: req.user._id.toString(),
            orderCode,
            fullName: removeAccents(fullName?.trim() || ''),
            email: email?.trim().toLowerCase() || '',
            phone: phone?.trim() || '',
            address: removeAccents(address?.trim() || ''),
            distance: Number(distance || 0),
            total: Number(total),
            subtotal: Number(subtotal),
            shippingFee: Number(shippingFee),
            discountAmount: Number(discountAmount),
            needPlasticUtensils: !!needPlasticUtensils,
        };

        const vnp_ExtraData = Buffer.from(JSON.stringify(extraDataObj)).toString('base64');

        console.log('📦 ExtraData:', extraDataObj);
        console.log('📦 Base64 ExtraData:', vnp_ExtraData);
        console.log('📦 Decoded lại:', JSON.parse(Buffer.from(vnp_ExtraData, 'base64').toString('utf-8')));

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNP_TMNCODE,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderCode,
            vnp_OrderInfo: removeAccents(`Thanh-toan-don-hang-${orderCode}`),
            vnp_OrderType: 'other',
            vnp_Amount: Math.round(Number(total) * 100),
            vnp_Returnurl: VNP_RETURN_URL,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: moment().add(15, 'minutes').format('YYYYMMDDHHmmss'),
            vnp_ExtraData,
        };

        console.log('📌 Các giá trị vnp_Params (trước ký):');
        Object.entries(vnp_Params).forEach(([key, val]) => {
            console.log(`   🔹 ${key} (${typeof val}): ${val}`);
        });

        // Tạo secure hash
        const sortedParams = Object.fromEntries(Object.entries(vnp_Params).sort());
        const signData = qs.stringify(sortedParams, { encode: false });
        const secureHash = crypto
            .createHmac('sha512', VNP_HASHSECRET)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');

        sortedParams.vnp_SecureHash = secureHash;

        const paymentUrl = `${VNP_URL}?${qs.stringify(sortedParams)}`;

        console.log('🔐 Raw signData:', signData);
        console.log('🔐 SecureHash:', secureHash);
        console.log('🔗 Payment URL:', decodeURIComponent(paymentUrl));

        res.status(200).json({ paymentUrl, orderId: orderCode });
    } catch (err) {
        console.error('❌ VNPAY Error:', err.message);
        res.status(500).json({ message: 'Lỗi tạo thanh toán VNPay', error: err.message });
    }
});

router.post('/confirm', async (req, res) => {
    console.log('📥 [VNPay] Nhận dữ liệu xác nhận từ frontend:', req.body);
    try {
        const vnp_Params = { ...req.body };

        const secureHash = vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const sortedParams = Object.fromEntries(Object.entries(vnp_Params).sort());
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', VNP_HASHSECRET);
        const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        console.log('🔐 [VNPay] Params dùng để kiểm tra chữ ký:', sortedParams);
        console.log('🔐 signData:', signData);
        console.log('🔐 secureHash (from VNPay):', secureHash);
        console.log('🔐 checkSum (calculated):', checkSum);
        if (secureHash !== checkSum) {
            console.warn('⚠️ [VNPay] Chữ ký không khớp!');
            return res.status(400).json({ message: '❌ Chữ ký không hợp lệ' });
        }

        const extraData = JSON.parse(Buffer.from(vnp_Params.vnp_ExtraData, 'base64').toString('utf-8'));
        console.log('📦 [VNPay] ExtraData giải mã:', extraData);
        const {
            userId,
            orderCode,
            fullName,
            email,
            phone,
            address,
            distance,
            total,
            subtotal,
            shippingFee,
            discountAmount,
            needPlasticUtensils,
        } = extraData;

        if (vnp_Params.vnp_ResponseCode !== '00') {
            console.warn('⚠️ [VNPay] Giao dịch bị hủy hoặc thất bại.');
            return res.status(200).json({ message: 'Thanh toán thất bại' });
        }

        const existing = await Order.findOne({ orderCode });
        if (existing) {
            console.log('ℹ️ [VNPay] Đơn hàng đã tồn tại:', orderCode);
            return res.status(200).json({ message: 'Đã có đơn hàng', order: existing });
        }

        const temp = await TempOrder.findOne({ orderCode });
        if (!temp || !temp.cartItems?.length) {
            console.error('❌ [VNPay] Không tìm thấy giỏ hàng tạm:', orderCode);
            return res.status(400).json({ message: 'Không tìm thấy giỏ hàng tạm' });
        }

        const newOrder = await Order.create({
            user: new mongoose.Types.ObjectId(userId),
            fullName,
            email,
            phone,
            address,
            distance,
            cartItems: temp.cartItems,
            subtotal,
            shippingFee,
            discountAmount,
            total,
            paymentMethod: 'vnpay',
            status: 'Đã nhận đơn',
            orderCode,
            vnpTransactionNo: vnp_Params.vnp_TransactionNo,
        });

        await TempOrder.deleteOne({ orderCode });
        await Cart.findOneAndDelete({ userId });
        console.log('✅ [VNPay] Đơn hàng đã được tạo thành công:', orderCode);
        res.json({ message: 'Đơn đã tạo thành công', order: newOrder });
    } catch (err) {
        console.error('❌ [VNPay] Lỗi xác nhận thanh toán:', err.message);
        res.status(500).json({ message: 'Lỗi xác nhận đơn VNPay', error: err.message });
    }
});

module.exports = router;
