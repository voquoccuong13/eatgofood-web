const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const Order = require('../models/order');
const bcrypt = require('bcryptjs');

// route post /api/users/register
// @access Public
router.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email người dùng đã tồn tại' });

        user = new User({ name, email, password, phone });
        await user.save();

        // ✅ Tạo token xác minh
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // ✅ Gửi email xác minh
        const verifyLink = `http://localhost:5173/verify-email?token=${token}`;
        const html = `
            <h2>Chào ${user.name}</h2>
            <p>Vui lòng nhấn vào nút bên dưới để xác minh email:</p>
            <a href="${verifyLink}" style="background: #007bff; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Xác minh ngay</a>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <img src="cid:logo_cid" style="width:100px;margin-top:10px" />
        `;
        await sendEmail(user.email, 'Xác minh tài khoản của bạn', html);

        // ✅ Trả lại token cho frontend (chỉ khi cần)
        res.status(201).json({
            message: 'Tạo tài khoản thành công. Vui lòng kiểm tra email để xác minh tài khoản.',
            token, // 👈 Trả token để frontend lưu
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi Server');
    }
});

// route post /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });

        // So sánh mật khẩu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });

        // ✅ Kiểm tra xác minh email
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác minh.',
            });
        }

        // Tạo payload và token
        const payload = {
            user: {
                id: user._id,
                role: user.role,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '40h' }, (err, token) => {
            if (err) throw err;

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).send('Lỗi Server');
    }
});

// route Get /api/users/profile
router.put('/profile', protect, async (req, res) => {
    const { name, email } = req.body;
    try {
        // Có thể validate email/name ở đây nếu cần

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true },
        );

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin' });
    }
});
//
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
    }
});

// POST /api/users/forgot-password
// Route gửi mail lấy lại mật khẩu
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    //  Hàm tạo HTML email nằm ngay trong route
    const resetPasswordEmailHTML = (user, resetUrl) => {
        return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <div style="text-align: center;">
          <img src="cid:logo_cid" alt="Logo" style="max-width: 120px;" />
          <h2 style="color: #d63b3b;">Yêu cầu đặt lại mật khẩu</h2>
        </div>

        <p>Xin chào <strong>${user.username || user.email}</strong>,</p>

        <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

        <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #d63b3b; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
            Đặt lại mật khẩu
          </a>
        </div>

        <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này. Liên kết sẽ hết hạn sau 1 giờ.</p>

        <p style="color: #555;">Trân trọng,<br />Đội ngũ hỗ trợ Eatgo Web</p>
      </div>
    `;
    };

    try {
        //  Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Email không tồn tại' });

        //  Tạo token reset, lưu vào user (giả sử bạn có hàm này trong schema)
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        //  Tạo URL đặt lại mật khẩu
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        //  Tạo nội dung HTML email
        const html = resetPasswordEmailHTML(user, resetUrl);

        //  Gửi email
        await sendEmail(user.email, 'Đặt lại mật khẩu của bạn', html);

        res.status(200).json({ message: 'Email đặt lại mật khẩu đã được gửi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi gửi email' });
    }
});
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đặt lại mật khẩu' });
    }
});
// Cấu hình multer lưu file avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, req.user.id + '-' + Date.now() + ext);
    },
});
const upload = multer({ storage });

// Route upload avatar (cập nhật avatarUrl)
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Không có file được tải lên' });

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        console.log('User id:', req.user.id);
        console.log('File saved:', req.file.path);
        console.log('Updating avatarUrl:', avatarUrl);

        const updatedUser = await User.findByIdAndUpdate(req.user.id, { avatarUrl }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        console.log('User updated:', updatedUser);

        res.json({ message: 'Upload avatar thành công', avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Lỗi server khi upload avatar' });
    }
});
// Lấy danh sách đơn hàng của người dùng đã đăng nhập
router.get('/my-orders', protect, async (req, res) => {
    // console.log('User id from token:', req.user.id);
    console.log('🧑‍🔐 [my-orders] req.user.id:', req.user.id);
    try {
        const orders = await Order.find({ user: new mongoose.Types.ObjectId(req.user.id) }).sort({ createdAt: -1 });

        console.log('📦 [my-orders] Số đơn tìm thấy:', orders.length);
        // console.log('Orders found:', orders);
        if (orders.length > 0) {
            console.log('📝 Một đơn ví dụ:', orders[0]);
        }
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
});
// route thay đổi mật khẩu
router.post('/change-password', protect, async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        console.log('Đang đổi mật khẩu cho:', user.email);
        user.password = newPassword; // sẽ được hash nhờ middleware
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
    }
});
router.get('/login-admin', protect, isAdmin, (req, res) => {
    res.json({ message: 'Chào admin!' });
});
router.post('/login-admin', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập trang admin.' });
        }
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
        );

        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } else {
        res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
});
// GET /api/users/all
router.get('/admin/all', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Không gửi mật khẩu
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
    }
});
// DELETE /api/users/:id
router.delete('/admin/:id', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json({ message: 'Đã xoá người dùng thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi xoá người dùng' });
    }
});
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác minh' });
        // ✅ Tạo token xác minh mới
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('✅ TOKEN:', token);

        const verifyLink = `http://localhost:5173/verify-email?token=${token}`;
        console.log('✅ Link xác minh:', verifyLink);

        const html = `
            <h2>Chào ${user.name}</h2>
            <p>Vui lòng nhấn vào nút bên dưới để xác minh email:</p>
            <a href="${verifyLink}" style="background: #007bff; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Xác minh ngay</a>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
            <img src="cid:logo_cid" style="width:100px;margin-top:10px" />
        `;

        await sendEmail(user.email, 'Xác minh tài khoản của bạn', html);

        res.json({ message: 'Đã gửi lại email xác minh' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi gửi email xác minh' });
    }
});
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        // ✅ Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // ✅ Đã xác minh rồi
        if (user.isVerified) {
            return res.status(400).json({ message: 'Tài khoản đã được xác minh trước đó' });
        }

        // ✅ Cập nhật trạng thái xác minh
        user.isVerified = true;
        await user.save();

        res.json({ message: 'Tài khoản đã được xác minh thành công' });
    } catch (error) {
        console.error('Lỗi xác minh email:', error);
        res.status(400).json({ message: 'Liên kết xác minh không hợp lệ hoặc đã hết hạn' });
    }
});
module.exports = router;
