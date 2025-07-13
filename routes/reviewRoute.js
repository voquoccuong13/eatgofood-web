const express = require('express');
const router = express.Router();
const Review = require('../models/reviewModel');
const User = require('../models/User');
const Order = require('../models/order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/productModel');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../uploads/reviews');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Created upload directory:', uploadDir);
}

// Cấu hình multer để lưu ảnh đánh giá
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique với timestamp và tên file gốc
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `review-${uniqueSuffix}-${name}${ext}`);
    },
});

// File filter để kiểm tra loại file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPG, JPEG, PNG, GIF)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 3, // Tối đa 3 files
    },
});

// === POST /api/reviews === //
router.post('/', (req, res) => {
    // Sử dụng middleware upload với error handling
    upload.array('images', 3)(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File quá lớn. Tối đa 5MB mỗi file.' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Quá nhiều file. Tối đa 3 ảnh.' });
            }
            return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: err.message });
        }

        try {
            const { orderCode, rating, comment, productId, userId } = req.body;
            const files = req.files;

            console.log('📝 Received review data:', {
                orderCode,
                rating,
                comment: comment?.substring(0, 50) + '...',
                productId,
                userId,
                filesCount: files?.length || 0,
            });

            // Validation
            if (!orderCode || !rating || !comment || !productId) {
                return res.status(400).json({ message: 'Thiếu dữ liệu đánh giá bắt buộc' });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating phải từ 1 đến 5' });
            }

            if (comment.trim().length < 10) {
                return res.status(400).json({ message: 'Nhận xét phải có ít nhất 10 ký tự' });
            }

            // Kiểm tra đơn hàng hợp lệ
            const order = await Order.findOne({ orderCode }).populate('user');
            if (!order) {
                console.log('❌ Order not found:', orderCode);
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }

            // Kiểm tra xem đã đánh giá chưa
            const existingReview = await Review.findOne({ orderCode, productId });
            if (existingReview) {
                console.log('❌ Review already exists for:', orderCode, productId);
                return res.status(400).json({ message: 'Sản phẩm này đã được đánh giá trong đơn hàng' });
            }

            // Lưu đường dẫn hình ảnh
            const imagePaths =
                files?.map((file) => {
                    const relativePath = `/uploads/reviews/${file.filename}`;
                    console.log('📸 Saved image:', relativePath);
                    return relativePath;
                }) || [];

            // Tạo review mới
            const review = await Review.create({
                orderCode,
                productId,
                userId: userId || order.user._id,
                userName: order.fullName || order.user.fullName || 'Người dùng ẩn danh',
                userAvatar: order.user.avatar || '',
                foodName: order.items?.find((item) => item.productId === productId)?.name || 'Sản phẩm',
                rating: parseInt(rating),
                comment: comment.trim(),
                images: imagePaths,
            });

            console.log('✅ Review created:', review._id);

            // Cập nhật điểm rating trung bình và số lượng đánh giá cho sản phẩm
            if (productId) {
                const reviews = await Review.find({ productId });
                const numReviews = reviews.length;

                if (numReviews > 0) {
                    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
                    const avgRating = Math.round((totalRating / numReviews) * 10) / 10;

                    const updatedProduct = await Product.findByIdAndUpdate(
                        productId,
                        {
                            rating: avgRating,
                            numReviews,
                        },
                        { runValidators: true, new: true },
                    );

                    if (updatedProduct) {
                        console.log(
                            '✅ Updated product rating:',
                            updatedProduct.name,
                            '⭐',
                            updatedProduct.rating,
                            `(${numReviews} reviews)`,
                        );
                    } else {
                        console.log('❌ Could not update product rating');
                    }
                }
            }

            // Kiểm tra xem tất cả sản phẩm trong đơn hàng đã được đánh giá chưa
            const orderProductIds = Array.isArray(order.items) ? order.items.map((item) => item.productId) : [];

            const reviewedProductIds = await Review.find({
                orderCode,
                productId: { $in: orderProductIds },
            }).distinct('productId');

            // Nếu tất cả sản phẩm đã được đánh giá, mark đơn hàng là đã review
            if (reviewedProductIds.length === orderProductIds.length) {
                order.hasReview = true;
                await order.save();
                console.log('✅ Order marked as fully reviewed:', orderCode);
            }

            res.status(201).json({
                message: 'Đánh giá thành công',
                review: {
                    ...review.toObject(),
                    images: imagePaths,
                },
            });
        } catch (error) {
            console.error('❌ Error creating review:', error);

            // Cleanup uploaded files nếu có lỗi
            if (req.files) {
                req.files.forEach((file) => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }

            res.status(500).json({ message: 'Lỗi máy chủ khi tạo đánh giá' });
        }
    });
});

// === GET /api/reviews?productId=... === //
router.get('/', async (req, res) => {
    const { productId } = req.query;

    try {
        if (!productId) {
            return res.status(400).json({ message: 'Thiếu productId trong query' });
        }

        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error('Lỗi khi lấy đánh giá theo productId:', err);
        res.status(500).json({ message: 'Không thể lấy đánh giá theo sản phẩm' });
    }
});

// === GET /api/reviews/recent?limit=6 === //
router.get('/recent', async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(limit);
        res.json(reviews);
    } catch (err) {
        console.error('Error getting recent reviews:', err);
        res.status(500).json({ message: 'Không thể lấy đánh giá' });
    }
});

// === DELETE /api/reviews/:id (optional - để xóa review nếu cần) === //
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Xóa các file ảnh
        if (review.images && review.images.length > 0) {
            review.images.forEach((imagePath) => {
                const fullPath = path.join(__dirname, '..', imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) console.error('Error deleting image:', err);
                    else console.log('Deleted image:', fullPath);
                });
            });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa đánh giá thành công' });
    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ message: 'Lỗi khi xóa đánh giá' });
    }
});

module.exports = router;
