import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { exportToExcelWithExcelJS } from '../Utils/exportExcel';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import TopSellingProducts from './TopSellingProducts ';
import RevenueRangeFilter from './RevenueRangeFilter ';
const RevenueChart = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        bestMonth: null,
        worstMonth: null,
        growthRate: 0,
    });

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Lấy token từ localStorage
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
                    return;
                }

                console.log('🚀 Đang gọi API revenue...');

                // Gọi API chính xác như trong backend
                const res = await axios.get('/api/admin/revenue-by-month', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('📥 Nhận response:', res.data);

                if (res.data.success) {
                    const data = res.data.data || [];
                    setMonthlyData(data);
                    calculateStatistics(data);

                    if (res.data.summary) {
                        console.log('📊 Summary từ backend:', res.data.summary);
                    }
                } else {
                    setError('API trả về lỗi: ' + (res.data.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('❌ Lỗi khi gọi API:', err);

                if (err.response) {
                    // Server responded with error status
                    console.error('Response data:', err.response.data);
                    console.error('Response status:', err.response.status);

                    if (err.response.status === 401) {
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    } else if (err.response.status === 403) {
                        setError('Bạn không có quyền truy cập báo cáo này.');
                    } else {
                        setError(err.response.data?.message || 'Lỗi server không xác định');
                    }
                } else if (err.request) {
                    // Request was made but no response received
                    console.error('Request error:', err.request);
                    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                } else {
                    // Something else happened
                    console.error('Error:', err.message);
                    setError('Lỗi không xác định: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    const calculateStatistics = (data) => {
        if (!data || data.length === 0) {
            console.log('⚠️ Không có dữ liệu để tính toán statistics');
            return;
        }

        console.log('🧮 Tính toán statistics từ data:', data);

        const totalRevenue = data.reduce((sum, item) => sum + (item.total || 0), 0);
        const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Tìm tháng có doanh thu cao nhất (loại bỏ tháng có doanh thu = 0)
        const monthsWithRevenue = data.filter((item) => item.total > 0);
        const bestMonth =
            monthsWithRevenue.length > 0
                ? monthsWithRevenue.reduce((max, item) => (item.total > max.total ? item : max))
                : null;

        const worstMonth =
            monthsWithRevenue.length > 0
                ? monthsWithRevenue.reduce((min, item) => (item.total < min.total ? item : min))
                : null;

        // Tính tăng trưởng (so sánh tháng cuối vs tháng đầu có doanh thu)
        let growthRate = 0;
        if (monthsWithRevenue.length >= 2) {
            const firstMonth = monthsWithRevenue[0];
            const lastMonth = monthsWithRevenue[monthsWithRevenue.length - 1];
            if (firstMonth.total > 0) {
                growthRate = ((lastMonth.total - firstMonth.total) / firstMonth.total) * 100;
            }
        }

        const newStats = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            bestMonth,
            worstMonth,
            growthRate,
        };

        console.log('📊 Statistics calculated:', newStats);
        setStatistics(newStats);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatMonth = (monthStr) => {
        if (!monthStr) return 'N/A';
        const [year, month] = monthStr.split('-');
        const monthNames = [
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12',
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    // Data for pie chart (quarterly breakdown) - chỉ tính các tháng có doanh thu
    const quarterlyData = monthlyData
        .filter((item) => item.total > 0)
        .reduce((acc, item) => {
            const month = parseInt(item.month.split('-')[1]);
            const quarter = Math.ceil(month / 3);
            const quarterName = `Quý ${quarter}`;

            const existing = acc.find((q) => q.name === quarterName);
            if (existing) {
                existing.value += item.total;
            } else {
                acc.push({ name: quarterName, value: item.total });
            }
            return acc;
        }, []);

    const COLORS = ['#00b894', '#0984e3', '#fdcb6e', '#e17055'];

    // Hàm xuất dữ liệu ra file Excel

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải báo cáo doanh thu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Kiểm tra nếu không có dữ liệu
    if (monthlyData.length === 0 || monthlyData.every((item) => item.total === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 ml-72 p-8 pt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <h2 className="text-xl font-bold text-yellow-600 mb-2">Chưa có dữ liệu</h2>
                        <p className="text-yellow-700">
                            Hiện tại chưa có đơn hàng nào với trạng thái "Đã giao" để tạo báo cáo doanh thu.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 ml-72 p-1 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">📊 Báo cáo thống kê doanh thu</h1>
                    <p className="text-gray-600">Báo cáo dựa trên các đơn hàng đã giao thành công</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(statistics.totalRevenue)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {statistics.totalOrders.toLocaleString()}
                                </p>
                            </div>
                            <ShoppingBag className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng TB</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {formatCurrency(statistics.averageOrderValue)}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tăng trưởng</p>
                                <p
                                    className={`text-2xl font-bold ${
                                        statistics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {statistics.growthRate.toFixed(1)}%
                                </p>
                            </div>
                            <TrendingUp
                                className={`h-8 w-8 ${statistics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Revenue Bar Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Doanh thu theo tháng</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={formatMonth}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                    labelFormatter={formatMonth}
                                />
                                <Bar dataKey="total" fill="#00b894" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Quarterly Revenue Pie Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">🥧 Doanh thu theo quý</h3>
                        {quarterlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={quarterlyData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {quarterlyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                Chưa có dữ liệu theo quý
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Trend Line Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Xu hướng doanh thu</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={formatMonth}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                    labelFormatter={formatMonth}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#00b894"
                                    strokeWidth={3}
                                    dot={{ fill: '#00b894', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders Count Bar Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📦 Số lượng đơn hàng</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={formatMonth}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [value, 'Đơn hàng']} labelFormatter={formatMonth} />
                                <Bar dataKey="orders" fill="#0984e3" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Bảng tổng kết chi tiết</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tháng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doanh thu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giá trị TB/đơn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        So với tháng trước
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyData.map((item, index) => {
                                    const prevMonth = index > 0 ? monthlyData[index - 1] : null;
                                    const growthRate =
                                        prevMonth && prevMonth.total > 0
                                            ? ((item.total - prevMonth.total) / prevMonth.total) * 100
                                            : 0;

                                    return (
                                        <tr key={item.month} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatMonth(item.month)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(item.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.orders?.toLocaleString() || '0'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.orders && item.orders > 0
                                                    ? formatCurrency(item.total / item.orders)
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {index === 0 || !prevMonth || prevMonth.total === 0 ? (
                                                    <span className="text-gray-500">-</span>
                                                ) : (
                                                    <span
                                                        className={`font-medium ${
                                                            growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                    >
                                                        {growthRate >= 0 ? '+' : ''}
                                                        {growthRate.toFixed(1)}%
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <RevenueRangeFilter />
                {/* Key Insights */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Thông tin chi tiết</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">🏆 Tháng có doanh thu cao nhất</h4>
                            <p className="text-green-700">
                                {statistics.bestMonth ? formatMonth(statistics.bestMonth.month) : 'N/A'}:{' '}
                                {statistics.bestMonth ? formatCurrency(statistics.bestMonth.total) : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">📉 Tháng có doanh thu thấp nhất</h4>
                            <p className="text-yellow-700">
                                {statistics.worstMonth ? formatMonth(statistics.worstMonth.month) : 'N/A'}:{' '}
                                {statistics.worstMonth ? formatCurrency(statistics.worstMonth.total) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                <TopSellingProducts onDataLoaded={setTopSellingProducts} />
            </div>
            <button
                onClick={() => exportToExcelWithExcelJS(monthlyData, topSellingProducts)}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                📥 Xuất báo cáo Excel
            </button>
        </div>
    );
};

export default RevenueChart;
