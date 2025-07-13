//Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userId = decoded.id || (decoded.user && decoded.user.id); // ✅ xử lý cả 2 kiểu

            if (!userId) {
                return res.status(401).json({ message: 'Token không hợp lệ (không có ID)' });
            }

            req.user = await User.findById(userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Không tìm thấy người dùng' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    } else {
        return res.status(401).json({ message: 'Không có quyền truy cập, thiếu token' });
    }
};
const adminProtect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id, //  dùng trực tiếp
                role: decoded.role, //  dùng trực tiếp
            };

            return next();
        } catch (err) {
            console.error('❌ Token admin không hợp lệ:', err.message);
            return res.status(401).json({ message: 'Token admin không hợp lệ' });
        }
    }

    return res.status(401).json({ message: 'Thiếu token admin' });
};

const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Yêu cầu quyền admin' });
};

module.exports = {
    protect,
    adminProtect,
    isAdmin,
};
