const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { protect, isAdmin, adminProtect } = require('../middleware/authMiddleware');

// Main revenue route - WITH authentication
router.get('/revenue-by-month', adminProtect, isAdmin, async (req, res) => {
    try {
        console.log('Đã xác thực user:', {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role,
        });

        // Step 1: check tổng đơn hàng ở database
        const totalOrders = await Order.countDocuments();
        // console.log('Tổng đơn hàng trong Database:', totalOrders);

        if (totalOrders === 0) {
            console.log('Không tìm thấy đơn hàng trong database');
            return res.json({
                success: true,
                data: [],
                message: 'Không có đơn hàng nào trong hệ thống',
            });
        }

        // Step 2: Check trạng thái đơn hàng
        const statusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // console.log('Phân tích trạng thái đơn hàng:', statusCounts);

        // Step 3: Tìm các đơn hàng đã giao kèm thông tin chi tiết
        const deliveredOrders = await Order.find({ status: 'Đã giao' })
            .select('total createdAt status')
            .sort({ createdAt: 1 });

        // console.log(' Số đơn hàng đã giao:', deliveredOrders.length);

        if (deliveredOrders.length > 0) {
            console.log(' Một vài đơn hàng đã giao:');
            deliveredOrders.slice(0, 3).forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.createdAt.toISOString()} - ${order.total.toLocaleString()} ₫`);
            });
        }

        // Step 4: Xử lý doanh thu theo tháng
        const revenueByMonth = {};
        const orderCountByMonth = {};

        deliveredOrders.forEach((order) => {
            const createdAt = new Date(order.createdAt);
            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

            // Doanh thu
            if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = 0;
            }
            revenueByMonth[monthKey] += order.total;

            // Số đơn hàng
            if (!orderCountByMonth[monthKey]) {
                orderCountByMonth[monthKey] = 0;
            }
            orderCountByMonth[monthKey] += 1;
        });

        // Step 5: Đảm bảo đủ dữ liệu 12 tháng trong năm hiện tại
        const now = new Date();
        const year = now.getFullYear();

        for (let i = 1; i <= 12; i++) {
            const month = `${year}-${String(i).padStart(2, '0')}`;
            if (!revenueByMonth[month]) {
                revenueByMonth[month] = 0;
                orderCountByMonth[month] = 0;
            }
        }

        // Step 6: Định dạng kết quả trả về
        const result = Object.entries(revenueByMonth)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([month, total]) => ({
                month,
                total: Math.round(total), // Làm tròn doanh thu
                orders: orderCountByMonth[month] || 0,
            }));

        // Step 7: Tính toán tổng doanh thu và tổng đơn hàng đã giao
        const totalRevenue = result.reduce((sum, item) => sum + item.total, 0);
        const totalDeliveredOrders = result.reduce((sum, item) => sum + item.orders, 0);

        // console.log('Trả dữ liệu về frontend:');
        // console.log('   - Số tháng có doanh thu:', result.filter((r) => r.total > 0).length);
        // console.log('   - Tổng doanh thu:', totalRevenue.toLocaleString(), '₫');
        // console.log('   - Tổng đơn hàng đã giao:', totalDeliveredOrders);

        res.json({
            success: true,
            data: result,
            summary: {
                totalRevenue,
                totalOrders: totalDeliveredOrders,
                averageOrderValue: totalDeliveredOrders > 0 ? Math.round(totalRevenue / totalDeliveredOrders) : 0,
                monthsWithData: result.filter((r) => r.total > 0).length,
            },
        });
    } catch (error) {
        console.error('Lỗi API khi xử lý doanh thu:', error);
        console.error('Chi tiết lỗi:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy dữ liệu doanh thu',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi nội bộ máy chủ',
        });
    }
});
// [GET] /api/admin/top-products
router.get('/top-products', adminProtect, isAdmin, async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { status: 'Đã giao' } },
            { $unwind: '$cartItems' },
            {
                $group: {
                    _id: '$cartItems.productId',
                    totalQuantity: { $sum: '$cartItems.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products', // Tên collection trong MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo',
                },
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$productInfo.name',
                    image: '$productInfo.image',
                    price: '$productInfo.price',
                    totalQuantity: 1,
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]);

        res.json({
            success: true,
            data: topProducts,
        });
    } catch (err) {
        console.error('Lỗi khi lấy top sản phẩm:', err);
        res.status(500).json({ success: false, message: 'Lỗi server khi thống kê món ăn' });
    }
});
// [GET] Doanh thu theo khoảng thời gian
router.get('/revenue-by-range', adminProtect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Thiếu ngày bắt đầu hoặc kết thúc' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Bao trùm cả ngày kết thúc

        const orders = await Order.find({
            status: 'Đã giao',
            createdAt: { $gte: start, $lte: end },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        res.json({
            success: true,
            revenue: totalRevenue,
            totalOrders: orders.length,
        });
    } catch (err) {
        console.error('Lỗi khi lấy doanh thu theo khoảng thời gian:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
