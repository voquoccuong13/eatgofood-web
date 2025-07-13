// admin/pages/AdminOrderDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const AdminOrderDetailPage = () => {
    const { orderCode } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/orders/code/${orderCode}`);
                setOrder(res.data);
            } catch (err) {
                const message = err.response?.data?.message || 'Không tìm thấy đơn hàng';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderCode]);

    if (loading) return <div>Đang tải đơn hàng...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 pt-20 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-extrabold text-red-600 mb-6 border-b-4 border-red-600 pb-2">
                Chi tiết đơn hàng #{order.orderCode}
            </h2>
            {/* Trạng thái đơn hàng */}
            <div className="mb-4">
                <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        order.status === 'Đã hủy'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'Đã giao'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Đang giao'
                            ? 'bg-yellow-100 text-yellow-700'
                            : order.status === 'Đã nhận đơn'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    Trạng thái: {order.status}
                </span>
            </div>

            {/* Thông tin người nhận */}
            <div className="space-y-2 text-gray-700">
                <p>
                    <strong>👤 Họ tên:</strong> {order.fullName}
                </p>
                <p>
                    <strong>🏠 Địa chỉ:</strong> {order.address}
                </p>
                <p>
                    <strong>📞 SĐT:</strong> {order.phone}
                </p>
                <p>
                    <strong>⌛ Thời gian đặt:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                    <strong>📝 Ghi chú:</strong> {order.note ? order.note : 'Không có ghi chú'}
                </p>
                <p>
                    <strong>💳 Thanh toán:</strong> {order.paymentMethod}
                </p>

                <p>
                    <strong>Tổng số món:</strong> {order.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p>
                    <strong>🥢 Dụng cụ nhựa:</strong> {order.needPlasticUtensils ? 'Có' : 'Không'}
                </p>
            </div>

            {/* Danh sách sản phẩm */}
            <h4 className="mt-6 mb-3 font-semibold text-lg border-b pb-1">🛒 Sản phẩm:</h4>
            <ul className="space-y-2 text-gray-800">
                {order.cartItems.map((item, i) => (
                    <li key={i} className="flex items-center px-4 py-2 bg-gray-50 border rounded space-x-4">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                        <div className="flex-1">
                            <p className="font-medium">
                                {item.quantity} x {item.name}
                            </p>
                        </div>
                        <span className="text-right font-medium text-gray-700">{item.price.toLocaleString()}₫</span>
                    </li>
                ))}
            </ul>

            {/* Tổng tiền */}
            <div className="mt-6 border-t pt-4 text-gray-800 space-y-2 text-right">
                <p>
                    <strong>Tạm tính:</strong> {order.subtotal.toLocaleString()}₫
                </p>
                <p>
                    <strong>Phí vận chuyển:</strong> {order.shippingFee.toLocaleString()}₫
                </p>
                <p>
                    <strong>Giảm giá:</strong> -{order.discountAmount.toLocaleString()}₫
                </p>
                <p className="text-2xl font-bold text-red-600">Tổng cộng: {order.total.toLocaleString()}₫</p>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;
