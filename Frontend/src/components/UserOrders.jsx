import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const UserOrders = () => {
    const backendUrl = 'http://localhost:9000';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`${backendUrl}/api/users/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('📥 Dữ liệu đơn hàng nhận về:', res.data);

                setOrders(res.data);
            } catch (err) {
                console.error('Lỗi khi lấy lịch sử đơn hàng:', err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Đang chuẩn bị':
                return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
            case 'Đang giao':
                return { text: 'text-blue-800', bg: 'bg-blue-100' };
            case 'Đã giao':
                return { text: 'text-green-800', bg: 'bg-green-100' };
            case 'Đã hủy':
                return { text: 'text-red-800', bg: 'bg-red-100' };
            case 'Đã nhận đơn':
                return { text: 'text-indigo-800', bg: 'bg-indigo-100' }; // 🟣 màu tím nhẹ
            case 'Đang chờ':
                return { text: 'text-orange-800', bg: 'bg-orange-100' }; // 🟠 màu cam
            default:
                return { text: 'text-gray-800', bg: 'bg-gray-100' };
        }
    };

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-4 md:px-12 py-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">📦 Lịch sử đặt hàng</h2>

            {loading ? (
                <p className="text-gray-600">Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
                <p className="text-gray-500 text-lg">Không có đơn hàng nào.</p>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="min-w-[900px] w-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        <thead className="bg-gradient-to-r from-primary to-pink-500 text-white text-sm uppercase">
                            <tr>
                                <th className="p-4 text-left">Mã đơn</th>
                                <th className="p-4 text-left">Ngày đặt</th>
                                <th className="p-4 text-left">Tổng tiền</th>
                                <th className="p-4 text-left">Trạng thái</th>
                                <th className="p-4 text-left">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order, idx) => {
                                const statusClass = getStatusClass(order.status);
                                return (
                                    <tr key={order._id || idx} className="border-t hover:bg-gray-50 transition-all">
                                        <td className="p-4 font-medium text-blue-600">{order.orderCode}</td>
                                        <td className="p-4 text-gray-700">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString('vi-VN')
                                                : 'Không rõ'}
                                        </td>
                                        <td className="p-4 text-primary font-semibold">
                                            {Number(order.total).toLocaleString('vi-VN')}₫
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusClass.bg} ${statusClass.text}`}
                                            >
                                                {order.status || 'Chờ xử lý'}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <button
                                                onClick={() => navigate(`/order/${order.orderCode}`)}
                                                className="px-4 py-1.5 rounded-md bg-primary text-white transition text-sm"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="inline-flex rounded-md shadow overflow-hidden bg-white border">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="py-2 px-4 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    ←
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`py-2 px-4 text-sm font-medium ${
                                            currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="py-2 px-4 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    →
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
