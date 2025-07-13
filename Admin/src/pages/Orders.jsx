import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const statusOptions = ['Đã nhận đơn', 'Đang giao', 'Đã giao'];

const getStatusColor = (status) => {
    switch (status) {
        case 'Đã nhận đơn':
            return 'text-blue-600';
        case 'Đang giao':
            return 'text-yellow-600';
        case 'Đã giao':
            return 'text-green-600';
        case 'Đã hủy':
            return 'text-red-600';
        default:
            return '';
    }
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const selectRefs = useRef({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.orderCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            order.fullName?.toLowerCase().includes(searchKeyword.toLowerCase()),
    );

    const handleStatusChange = async (index, e) => {
        const newStatus = e.target.value;
        const oldStatus = filteredOrders[index].status;

        if (newStatus === oldStatus) return;

        const result = await Swal.fire({
            title: `Bạn có chắc muốn đổi trạng thái đơn thành "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Huỷ',
        });

        if (!result.isConfirmed) {
            if (selectRefs.current[index]) {
                selectRefs.current[index].value = oldStatus || '';
            }
            return;
        }

        try {
            const orderId = filteredOrders[index]._id;

            const res = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            const updatedOrder = res.data;

            setOrders((prevOrders) =>
                prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)),
            );

            Swal.fire({
                icon: 'success',
                title: 'Cập nhật thành công!',
                text: `Trạng thái đơn hàng đã được đổi thành: ${newStatus}`,
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Cập nhật trạng thái đơn hàng thất bại!',
            });

            if (selectRefs.current[index]) {
                selectRefs.current[index].value = oldStatus || '';
            }
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium text-sm">Đang tải đơn hàng...</p>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Không có đơn hàng nào.</p>
            </div>
        );
    }

    if (!filteredOrders.length) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng nào phù hợp.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full min-h-screen p-6 bg-white rounded-lg shadow-md overflow-x-auto ml-72 p-4 pt-24 "
        >
            <h2 className="text-2xl font-extrabold mb-6 text-primary border-b-4 border-primary pb-2">
                Quản lý đơn hàng
            </h2>

            <div className="mb-4 flex justify-end">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng"
                    className="border p-2 rounded-md shadow-sm w-80 focus:ring-2 focus:ring-primary"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>

            <div className="min-w-[800px]">
                <table className="w-full table-auto border-collapse border border-gray-200 text-sm md:text-base">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="py-3 px-4 border border-primary text-left">Mã đơn</th>
                            <th className="py-3 px-4 border border-primary text-left">Khách hàng</th>
                            <th className="py-3 px-4 border border-primary text-left">Tổng tiền</th>
                            <th className="py-3 px-4 border border-primary text-left">Ngày tạo</th>
                            <th className="py-3 px-4 border border-primary text-left">Trạng thái</th>
                            <th className="py-3 px-4 border border-primary text-left">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order, index) => {
                            const statusValue = statusOptions.includes(order.status) ? order.status : '';

                            return (
                                <tr
                                    key={order._id}
                                    className="border border-gray-200 hover:bg-primary/10 transition-colors"
                                >
                                    <td className="py-2 px-4 border">{order.orderCode || order._id.slice(-6)}</td>
                                    <td className="py-2 px-4 border">{order.fullName}</td>
                                    <td className="py-2 px-4 border font-semibold text-primary">
                                        {order.total?.toLocaleString() ?? '0'} ₫
                                    </td>

                                    <td className="py-2 px-4 border">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-2 px-4 border">
                                        {order.status === 'Đã hủy' ? (
                                            <span className="text-red-600 font-semibold">Đã hủy</span>
                                        ) : (
                                            <select
                                                ref={(el) => (selectRefs.current[index] = el)}
                                                value={statusValue}
                                                onChange={(e) => handleStatusChange(index, e)}
                                                className={`w-full rounded-md border px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary ${getStatusColor(
                                                    statusValue,
                                                )}`}
                                            >
                                                <option value="" disabled hidden>
                                                    -- Chọn trạng thái --
                                                </option>
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border text-primary font-semibold">
                                        <Link to={`/admin/orders/${order.orderCode}`} className="hover:underline">
                                            Xem
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default Orders;
