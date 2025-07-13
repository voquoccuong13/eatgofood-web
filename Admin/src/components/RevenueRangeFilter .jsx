import React, { useState } from 'react';
import axios from 'axios';

const RevenueRangeFilter = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [revenue, setRevenue] = useState(null);
    const [orderCount, setOrderCount] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError('Vui lòng chọn đầy đủ ngày');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`/api/admin/revenue-by-range`, {
                params: { startDate, endDate },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRevenue(res.data.revenue);
            setOrderCount(res.data.totalOrders);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Không thể lấy dữ liệu');
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm mt-6">
            <h3 className="text-lg font-semibold mb-4">📅 Xem doanh thu theo khoảng thời gian</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90">
                    Xem doanh thu
                </button>
            </form>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {revenue !== null && (
                <div className="mt-4 text-green-700 font-medium">
                    Doanh thu: {revenue.toLocaleString()} ₫ — Số đơn: {orderCount}
                </div>
            )}
        </div>
    );
};

export default RevenueRangeFilter;
