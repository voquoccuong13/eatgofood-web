const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { trim, matches } = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: false,
            unique: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        phone: {
            type: String,
            trim: true,
            required: false,
        },
        isVerified: {
            type: Boolean,
            default: false, // Mặc định: chưa xác minh
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        avatarUrl: { type: String, default: '' },
        // cart: [cartItemSchema], // dùng schema con cartItemSchema
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpire: {
            type: Date,
        },
    },
    { timestamps: true },
);

// password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// hàm kiểm tra đăng nhập, xem người dùng nhập đúng mật khẩu hay không.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hàm tạo reset password token, lưu token hashed và expire vào DB
userSchema.methods.generatePasswordResetToken = function () {
    // tạo token ngẫu nhiên (20 bytes, chuỗi hex)
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash token và lưu vào DB
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // đặt thời hạn token, 10 phút từ lúc tạo
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // trả token gốc (chưa mã hóa) để gửi email cho user
    return resetToken;
};
module.exports = mongoose.model('User', userSchema);
