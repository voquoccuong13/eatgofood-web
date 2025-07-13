// routes/momoRoute.js
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/order');
const Cart = require('../models/cart'); // Thêm model Cart (nếu sử dụng)
const { nanoid } = require('nanoid');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const User = require('../models/User'); // Thêm model User (nếu sử dụng)
const sendEmail = require('../utils/sendEmail');
const TempOrder = require('../models/TempOrder');
require('dotenv').config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
const MOMO_RETURN_URL = process.env.MOMO_RETURN_URL;
const MOMO_NOTIFY_URL = process.env.MOMO_NOTIFY_URL;
const MOMO_API_URL = process.env.MOMO_API_URL;
console.log('MOMO_ACCESS_KEY:', MOMO_ACCESS_KEY);
console.log('MOMO_SECRET_KEY:', MOMO_SECRET_KEY);
console.log('MOMO_PARTNER_CODE:', MOMO_PARTNER_CODE);
console.log('MOMO_RETURN_URL:', MOMO_RETURN_URL);
console.log('MOMO_NOTIFY_URL:', MOMO_NOTIFY_URL);
console.log('MOMO_API_URL:', MOMO_API_URL);
console.log('FRONTEND_URL:', FRONTEND_URL);
// Hàm tạo HTML email xác nhận đơn hàng
const createOrderConfirmationEmail = (order) => {
    const cartItemsHtml = order.cartItems
        .map(
            (item) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
                <img src="${item.image}" alt="${
                item.name
            }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString(
                'vi-VN',
            )}đ</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(
                item.price * item.quantity
            ).toLocaleString('vi-VN')}đ</td>
        </tr>
    `,
        )
        .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đơn hàng</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo_cid" alt="Logo" style="max-width: 150px; height: auto;">
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #28a745; text-align: center; margin: 0;">✅ Thanh toán thành công!</h1>
        </div>

        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Thông tin đơn hàng</h2>
        
        <table style="width: 100%; margin-bottom: 20px;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Mã đơn hàng:</td>
                <td style="padding: 8px 0;">#${order.orderCode}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Họ tên:</td>
                <td style="padding: 8px 0;">${order.fullName}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Số điện thoại:</td>
                <td style="padding: 8px 0;">${order.phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Địa chỉ giao hàng:</td>
                <td style="padding: 8px 0;">${order.address}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phương thức thanh toán:</td>
                <td style="padding: 8px 0;">MoMo</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Mã giao dịch:</td>
                <td style="padding: 8px 0;">${order.momoTransactionId || 'N/A'}</td>
            </tr>
        </table>

        <h3 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Chi tiết sản phẩm</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Hình ảnh</th>
                    <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                    <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                    <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                    <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${cartItemsHtml}
            </tbody>
        </table>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 5px 0;">Tạm tính:</td>
                    <td style="padding: 5px 0; text-align: right;">${order.subtotal.toLocaleString('vi-VN')}đ</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;">Phí giao hàng:</td>
                    <td style="padding: 5px 0; text-align: right;">${order.shippingFee.toLocaleString('vi-VN')}đ</td>
                </tr>
                ${
                    order.discountAmount > 0
                        ? `
     <tr>
    <td style="padding: 5px 0;">Giảm giá:</td>
    <td style="padding: 5px 0; text-align: right; color: #28a745;">
        -${order.discountAmount.toLocaleString('vi-VN')}đ
    </td>
</tr>

                `
                        : ''
                }
                <tr style="border-top: 2px solid #ddd; font-weight: bold; font-size: 18px;">
                    <td style="padding: 10px 0;">Tổng cộng:</td>
                    <td style="padding: 10px 0; text-align: right; color: #dc3545;">${order.total.toLocaleString(
                        'vi-VN',
                    )}đ</td>
                </tr>
            </table>
        </div>

        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h4 style="margin: 0 0 10px  auxiliar 0; color: #007bff;">📋 Lưu ý quan trọng:</h4>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Đơn hàng của bạn đang được chuẩn bị và sẽ được giao trong thời gian sớm nhất.</li>
                <li>Bạn sẽ nhận được thông báo khi đơn hàng được giao cho đơn vị vận chuyển.</li>
                <li>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666;">Cảm ơn bạn đã tin tưởng và mua hàng!</p>
            <p style="margin: 5px 0 0 0; color: #666;">© ${new Date().getFullYear()} - Tất cả quyền được bảo lưu</p>
        </div>
    </body>
    </html>
    `;
};

const verifySignature = (body, signature) => {
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const expectedSignature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');

    console.log('✅ Raw signature:', rawSignature);
    console.log('🔒 Expected signature:', expectedSignature);
    console.log('🧾 Received signature:', signature);
    console.log('✅ Is valid signature:', expectedSignature === signature);

    return expectedSignature === signature;
};
// POST /api/momo/create - Tạo yêu cầu thanh toán MoMo, không lưu đơn hàng

// POST /api/momo/create - Tạo yêu cầu thanh toán MoMo
router.post('/create', protect, async (req, res) => {
    try {
        const orderCode = nanoid(8);
        const requestId = nanoid(10);
        const amount = req.body.total;
        const redirectUrl = `${MOMO_RETURN_URL}/${orderCode}`;
        const ipnUrl = MOMO_NOTIFY_URL;
        const requestType = 'payWithATM';
        const { cartItems, ...restData } = req.body;

        // ✅ Lưu giỏ hàng tạm
        await TempOrder.create({
            userId: req.user._id,
            orderCode,
            cartItems,
        });
        // ✅ Gửi thông tin người dùng từ frontend vào extraData
        const extraData = Buffer.from(
            JSON.stringify({
                userId: req.user._id.toString(),
                orderCode,
                fullName: req.body.fullName || req.user.name || '',
                email: req.user.email || '',
                phone: req.body.phone || '',
                address: req.body.address || '',
                distance: req.body.distance ?? 0,
                total: req.body.total,
                subtotal: req.body.subtotal,
                shippingFee: req.body.shippingFee,
                discountAmount: req.body.discountAmount,
                needPlasticUtensils: req.body.needPlasticUtensils || false,
            }),
        ).toString('base64');

        const orderInfo = 'Thanh toán đơn hàng';

        const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');

        const body = {
            partnerCode: MOMO_PARTNER_CODE,
            accessKey: MOMO_ACCESS_KEY,
            requestId,
            amount: String(amount),
            orderId: orderCode,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi',
            bankCode: 'SML',
        };

        const momoResponse = await axios.post(MOMO_API_URL, body, {
            headers: { 'Content-Type': 'application/json' },
        });

        res.json({
            ...momoResponse.data,
            orderId: orderCode,
        });
    } catch (error) {
        console.error('❌ Lỗi tạo thanh toán MoMo:', error.message);
        res.status(500).json({ message: 'Lỗi tạo thanh toán MoMo', error: error.message });
    }
});

// POST /api/orders/momo-confirm
// POST /api/momo/momo-confirm
router.post('/momo-confirm', async (req, res) => {
    try {
        console.log('📥 Nhận xác nhận từ MoMo:', req.body);

        const { rawExtraData, momoTransactionId, resultCode } = req.body;
        if (!rawExtraData) {
            return res.status(400).json({ message: 'Thiếu rawExtraData từ MoMo' });
        }

        const decodedExtra = JSON.parse(Buffer.from(rawExtraData, 'base64').toString('utf-8'));
        console.log('🔓 extraData đã giải mã:', decodedExtra);

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
        } = decodedExtra;

        console.log('👤 [momo-confirm] userId từ extraData:', userId);
        console.log('📦 [momo-confirm] Tạo đơn với orderCode:', orderCode);

        if (parseInt(resultCode) !== 0) {
            return res.status(200).json({ message: 'Thanh toán thất bại', resultCode });
        }

        // ✅ Kiểm tra nếu đơn hàng đã tồn tại
        const existingOrder = await Order.findOne({ orderCode });
        if (existingOrder) {
            console.log('ℹ️ Đơn hàng đã tồn tại, trả lại luôn');
            return res.status(200).json({ message: 'Đơn hàng đã tồn tại', order: existingOrder });
        }

        // ✅ Lấy lại cartItems từ TempOrder
        const temp = await TempOrder.findOne({ orderCode });
        if (!temp || !temp.cartItems || temp.cartItems.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy giỏ hàng tạm' });
        }

        // ✅ Tạo đơn chính thức
        const newOrder = await Order.create({
            user: new mongoose.Types.ObjectId(userId),
            fullName,
            email,
            phone,
            address,
            distance,
            needPlasticUtensils,
            cartItems: temp.cartItems,
            subtotal: subtotal || total,
            shippingFee: shippingFee || 0,
            discountAmount: discountAmount || 0,
            total,
            paymentMethod: 'momo',
            status: 'Đã nhận đơn',
            orderCode,
            momoTransactionId,
        });

        console.log('✅ [momo-confirm] Đã tạo đơn:', newOrder);

        // 🧹 Xóa TempOrder
        await TempOrder.deleteOne({ orderCode });

        // 👉 Xoá cart nếu còn tồn tại
        await Cart.findOneAndDelete({ userId });

        res.json({ message: 'Đơn hàng đã được lưu', order: newOrder });
    } catch (err) {
        console.error('❌ Lỗi khi xác nhận MoMo:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

router.get('/status/:orderCode', async (req, res) => {
    try {
        const { orderCode } = req.params;

        // Kiểm tra trong DB
        const order = await Order.findOne({ orderCode });
        if (order) {
            return res.json({
                exists: true,
                status: order.status,
                order: order,
            });
        }

        return res.status(404).json({
            exists: false,
            message: 'Không tìm thấy đơn hàng',
        });
    } catch (error) {
        console.error('Lỗi kiểm tra trạng thái đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// POST /api/momo/notify - Lưu đơn hàng và xóa giỏ hàng khi thanh toán thành công
// router.post('/notify', async (req, res) => {
//     try {
//         console.log('=== MoMo Notify Called ===');
//         console.log('Notify data:', req.body);

//         if (!req.body || Object.keys(req.body).length === 0) {
//             console.error('Body rỗng hoặc sai định dạng');
//             return res.status(400).json({ error: 'Body rỗng hoặc sai định dạng' });
//         }

//         const { signature, orderId, resultCode, message, transId, extraData } = req.body;
//         if (!signature) {
//             console.error('Thiếu chữ ký (signature)');
//             return res.status(400).json({ error: 'Thiếu chữ ký (signature)' });
//         }

//         const isValidSignature = verifySignature(req.body, signature);
//         if (!isValidSignature) {
//             console.error('Chữ ký không hợp lệ');
//             return res.status(400).json({ error: 'Chữ ký không hợp lệ' });
//         }

//         console.log(`Processing payment result: orderCode=${orderId}, resultCode=${resultCode}`);

//         // Kiểm tra xem đơn hàng đã tồn tại chưa
//         let order = await Order.findOne({ orderCode: orderId });
//         if (order) {
//             console.log(`Đơn hàng ${orderId} đã tồn tại, bỏ qua lưu trùng lặp`);
//             return res.redirect(`${process.env.FRONTEND_URL}/order/${orderId}`);
//         }

//         if (resultCode === 0) {
//             // Giải mã extraData
//             let orderData;
//             try {
//                 orderData = JSON.parse(Buffer.from(extraData, 'base64').toString());
//                 console.log('Parsed extraData:', orderData);
//             } catch (parseError) {
//                 console.error('Lỗi giải mã extraData:', parseError);
//                 return res.status(400).json({ error: 'Lỗi giải mã extraData', details: parseError.message });
//             }

//             // Lưu đơn hàng
//             try {
//                 const newOrder = await Order.create({
//                     user: orderData.userId,
//                     fullName: orderData.fullName,
//                     email: orderData.email,
//                     phone: orderData.phone,
//                     address: orderData.address,
//                     distance: orderData.distance,
//                     needPlasticUtensils: orderData.needPlasticUtensils,
//                     cartItems: orderData.cartItems,
//                     subtotal: orderData.subtotal,
//                     shippingFee: orderData.shippingFee,
//                     discountAmount: orderData.discountAmount,
//                     total: orderData.total,
//                     paymentMethod: orderData.paymentMethod,
//                     orderCode: orderData.orderCode,
//                     status: 'Đã nhận đơn',
//                     momoTransactionId: transId,
//                     momoMessage: message,
//                     createdAt: Date.now(),
//                 });
//                 console.log('Order saved:', newOrder);

//                 // Xóa giỏ hàng
//                 try {
//                     await Cart.deleteOne({ user: orderData.userId });
//                     console.log(`🗑️ Đã xóa giỏ hàng của người dùng: ${orderData.userId}`);
//                 } catch (cartError) {
//                     console.error('❌ Lỗi khi xóa giỏ hàng:', cartError);
//                 }

//                 // Gửi email xác nhận
//                 try {
//                     const emailHtml = createOrderConfirmationEmail(newOrder);
//                     await sendEmail(
//                         newOrder.email,
//                         `Xác nhận đơn hàng #${newOrder.orderCode} - Thanh toán thành công`,
//                         emailHtml,
//                     );
//                     console.log(`✅ Đã gửi email xác nhận đến: ${newOrder.email}`);
//                 } catch (emailError) {
//                     console.error('❌ Lỗi gửi email xác nhận:', emailError);
//                 }

//                 return res.status(200).json({ message: 'Xác nhận thanh toán thành công' });
//             } catch (saveError) {
//                 console.error('Lỗi khi lưu đơn hàng:', saveError);
//                 return res.status(500).json({ error: 'Lỗi khi lưu đơn hàng', details: saveError.message });
//             }
//         } else {
//             console.log(`❌ Thanh toán thất bại cho đơn hàng ${orderId}, resultCode: ${resultCode}`);
//             return res.status(400).json({ error: 'Thanh toán thất bại hoặc bị hủy' });
//         }
//     } catch (error) {
//         console.error('Lỗi xử lý notify MoMo:', error.message, error.stack);
//         return res.status(500).json({ error: 'Lỗi server khi xử lý notify', details: error.message });
//     }
// });

// GET /api/momo/return - Xử lý khi người dùng quay lại từ MoMo
// Endpoint /return
// router.get('/return', async (req, res) => {
//     try {
//         console.log('=== MoMo Return Called ===');
//         console.log('Return params:', req.query);
//         console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

//         if (!process.env.FRONTEND_URL) {
//             console.error('FRONTEND_URL không được định nghĩa trong .env');
//             return res.status(500).json({ error: 'Cấu hình server lỗi: Thiếu FRONTEND_URL' });
//         }

//         const { resultCode, orderId, signature, transId, message, extraData } = req.query;

//         console.log('Parsed query params:', {
//             resultCode,
//             orderId,
//             transId,
//             message,
//             hasExtraData: !!extraData,
//             hasSignature: !!signature,
//         });

//         // Kiểm tra các tham số bắt buộc
//         if (!orderId || !resultCode) {
//             console.error('Thiếu tham số bắt buộc: orderId hoặc resultCode');
//             return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=missing_params`);
//         }

//         // Kiểm tra chữ ký
//         const isValidSignature = verifySignature(req.query, signature);
//         if (!isValidSignature) {
//             console.error('Chữ ký không hợp lệ trong /return');
//             return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=invalid_signature`);
//         }

//         // Xử lý thanh toán thành công
//         if (resultCode === '0') {
//             console.log(`✅ Thanh toán thành công cho đơn hàng ${orderId}`);

//             // Kiểm tra xem đơn hàng đã tồn tại chưa
//             let order = await Order.findOne({ orderCode: orderId });

//             if (order && order.status === 'Đã nhận đơn') {
//                 console.log(`Đơn hàng ${orderId} đã được xử lý trước đó, chuyển hướng về frontend`);
//                 console.log(`Redirecting to: ${process.env.FRONTEND_URL}/order/${orderId}`);
//                 return res.redirect(`${process.env.FRONTEND_URL}/order/${orderId}?status=success`);
//             }

//             // Nếu đơn hàng chưa tồn tại, tạo từ extraData
//             if (!order && extraData) {
//                 console.log('Đơn hàng chưa tồn tại, tạo từ extraData...');

//                 let orderData;
//                 try {
//                     orderData = JSON.parse(Buffer.from(extraData, 'base64').toString());
//                     console.log('Parsed extraData:', orderData);
//                 } catch (parseError) {
//                     console.error('Lỗi giải mã extraData:', parseError);
//                     return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=invalid_extradata`);
//                 }

//                 try {
//                     const newOrder = await Order.create({
//                         user: orderData.userId,
//                         fullName: orderData.fullName,
//                         email: orderData.email,
//                         phone: orderData.phone,
//                         address: orderData.address,
//                         distance: orderData.distance,
//                         needPlasticUtensils: orderData.needPlasticUtensils,
//                         cartItems: orderData.cartItems,
//                         subtotal: orderData.subtotal,
//                         shippingFee: orderData.shippingFee,
//                         discountAmount: orderData.discountAmount,
//                         total: orderData.total,
//                         paymentMethod: 'MoMo',
//                         orderCode: orderId,
//                         status: 'Đã nhận đơn',
//                         momoTransactionId: transId,
//                         momoMessage: message,
//                         createdAt: new Date(),
//                         updatedAt: new Date(),
//                     });

//                     console.log('✅ Đã tạo đơn hàng mới:', newOrder._id);

//                     // Xóa giỏ hàng (async, không cần chờ)
//                     Cart.deleteOne({ user: orderData.userId })
//                         .then(() => console.log(`🗑️ Đã xóa giỏ hàng của người dùng: ${orderData.userId}`))
//                         .catch((err) => console.error('❌ Lỗi khi xóa giỏ hàng:', err));

//                     // Gửi email xác nhận (async, không cần chờ)
//                     (async () => {
//                         try {
//                             const emailHtml = createOrderConfirmationEmail(newOrder);
//                             await sendEmail(
//                                 newOrder.email,
//                                 `Xác nhận đơn hàng #${newOrder.orderCode} - Thanh toán thành công`,
//                                 emailHtml,
//                             );
//                             console.log(`✅ Đã gửi email xác nhận đến: ${newOrder.email}`);
//                         } catch (emailError) {
//                             console.error('❌ Lỗi gửi email:', emailError);
//                         }
//                     })();
//                 } catch (saveError) {
//                     console.error('❌ Lỗi khi lưu đơn hàng:', saveError);
//                     return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=save_failed`);
//                 }
//             }

//             // Redirect thành công
//             console.log(`🎉 Redirect thành công: ${process.env.FRONTEND_URL}/order/${orderId}`);
//             return res.redirect(`${process.env.FRONTEND_URL}/order/${orderId}?status=success&payment=momo`);
//         } else {
//             // Thanh toán thất bại
//             console.log(`❌ Thanh toán thất bại cho đơn hàng ${orderId}, resultCode: ${resultCode}`);
//             return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=payment_failed&code=${resultCode}`);
//         }
//     } catch (error) {
//         console.error('❌ Lỗi trong /return:', error.message);
//         console.error('Stack trace:', error.stack);
//         return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=server_error`);
//     }
// });

// Route phụ để xử lý /return/order/:orderId - Đã được cải tiến
// router.get('/return/order/:orderId', async (req, res) => {
//     try {
//         console.log('=== MoMo Return (orderId route) Called ===');
//         console.log('Return params:', req.query);
//         console.log('orderId from params:', req.params.orderId);

//         if (!process.env.FRONTEND_URL) {
//             console.error('FRONTEND_URL không được định nghĩa trong .env');
//             return res.status(500).json({ error: 'Cấu hình server lỗi: Thiếu FRONTEND_URL' });
//         }

//         const { resultCode, signature } = req.query;
//         const orderId = req.params.orderId;

//         // Kiểm tra chữ ký
//         const isValidSignature = verifySignature(req.query, signature);
//         if (!isValidSignature) {
//             console.error('Chữ ký không hợp lệ trong /return/order/:orderId');
//             return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=invalid_signature`);
//         }

//         // Xử lý thanh toán thành công
//         if (resultCode === '0') {
//             console.log(`✅ Thanh toán thành công cho đơn hàng ${orderId}`);

//             // Kiểm tra đơn hàng có tồn tại không
//             const order = await Order.findOne({ orderCode: orderId });

//             if (order) {
//                 console.log(`Đơn hàng ${orderId} tồn tại, chuyển hướng về frontend`);
//                 console.log(`Redirecting to: ${process.env.FRONTEND_URL}/order/${orderId}`);
//                 return res.redirect(`${process.env.FRONTEND_URL}/order/${orderId}?status=success&payment=momo`);
//             } else {
//                 console.log(`⚠️ Đơn hàng ${orderId} không tồn tại trong database`);
//                 // Có thể redirect về trang thành công chung hoặc trang lỗi tùy theo logic business
//                 return res.redirect(`${process.env.FRONTEND_URL}/order-success?orderCode=${orderId}&payment=momo`);
//             }
//         } else {
//             console.log(`❌ Thanh toán thất bại cho đơn hàng ${orderId}, resultCode: ${resultCode}`);
//             return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=payment_failed&code=${resultCode}`);
//         }
//     } catch (error) {
//         console.error('❌ Lỗi /return/order/:orderId:', error.message);
//         console.error('Stack trace:', error.stack);
//         return res.redirect(`${process.env.FRONTEND_URL}/order-fail?error=server_error`);
//     }
// });

// POST /api/momo/callback - Callback endpoint (backup cho notify)
// router.post('/callback', async (req, res) => {
//     try {
//         const { resultCode, orderId, transId, extraData } = req.body;

//         console.log('=== MoMo Callback Called ===');
//         console.log('Callback data:', { resultCode, orderId, transId });

//         // Kiểm tra xem đơn hàng đã tồn tại chưa
//         let order = await Order.findOne({ orderCode: orderId });
//         if (order) {
//             console.log(`Đơn hàng ${orderId} đã tồn tại, bỏ qua lưu trùng lặp`);
//             return res.status(200).json({ message: 'Đơn hàng đã được xử lý' });
//         }

//         if (resultCode === 0) {
//             // Giải mã extraData để lấy thông tin đơn hàng
//             const orderData = JSON.parse(Buffer.from(extraData, 'base64').toString());

//             // Lưu đơn hàng vào DB
//             const newOrder = await Order.create({
//                 user: orderData.userId,
//                 fullName: orderData.fullName,
//                 email: orderData.email,
//                 phone: orderData.phone,
//                 address: orderData.address,
//                 distance: orderData.distance,
//                 needPlasticUtensils: orderData.needPlasticUtensils,
//                 cartItems: orderData.cartItems,
//                 subtotal: orderData.subtotal,
//                 shippingFee: orderData.shippingFee,
//                 discountAmount: orderData.discountAmount,
//                 total: orderData.total,
//                 paymentMethod: orderData.paymentMethod,
//                 orderCode: orderData.orderCode,
//                 status: 'Đã nhận đơn',
//                 momoTransactionId: transId,
//                 momoMessage: req.body.message,
//                 createdAt: Date.now(),
//             });

//             console.log(`✅ Đã lưu đơn hàng ${orderId} từ callback`);

//             // Xóa giỏ hàng của người dùng
//             try {
//                 await Cart.deleteOne({ user: orderData.userId });
//                 console.log(`🗑️ Đã xóa giỏ hàng của người dùng: ${orderData.userId}`);
//             } catch (cartError) {
//                 console.error('❌ Lỗi khi xóa giỏ hàng:', cartError);
//             }

//             // Gửi email xác nhận
//             try {
//                 const emailHtml = createOrderConfirmationEmail(newOrder);
//                 await sendEmail(
//                     newOrder.email,
//                     `Xác nhận đơn hàng #${newOrder.orderCode} - Thanh toán thành công`,
//                     emailHtml,
//                 );
//                 console.log(`✅ Đã gửi email xác nhận từ callback đến: ${newOrder.email}`);
//             } catch (emailError) {
//                 console.error('❌ Lỗi gửi email từ callback:', emailError);
//             }

//             return res.status(200).json({
//                 message: 'Cập nhật đơn hàng thành công',
//                 orderCode: orderId,
//                 status: 'Đã nhận đơn',
//             });
//         } else {
//             console.log(`❌ Thanh toán thất bại cho đơn hàng ${orderId}`);
//             return res.status(400).json({ message: 'Thanh toán thất bại hoặc bị hủy' });
//         }
//     } catch (error) {
//         console.error('Lỗi callback MoMo:', error);
//         return res.status(500).json({ message: 'Lỗi server khi xử lý callback' });
//     }
// });

// GET /api/momo/status/:orderCode - Kiểm tra trạng thái đơn hàng

module.exports = router;
