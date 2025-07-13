import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingBag } from 'lucide-react';

const TopSellingProducts = ({ onDataLoaded }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await axios.get('/api/admin/top-products', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProducts(res.data.data);
                onDataLoaded?.(res.data.data); // Truyền data về RevenueChart
            } catch (err) {
                console.error('Lỗi khi lấy top sản phẩm:', err);
            }
        };

        fetchTopProducts();
    }, []);

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                🥇 Top 5 món ăn được đặt nhiều nhất
            </h2>
            <ul className="divide-y divide-gray-100">
                {products.slice(0, 3).map((item, index) => (
                    <li
                        key={item._id}
                        className={`flex items-center justify-between py-3 px-3 rounded-lg transition ${
                            index === 0 ? 'bg-[#f9cdc1] border-l-4 border-[#FF4C29]' : ''
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span
                                className={`text-lg font-bold w-5 ${index === 0 ? 'text-[#FF4C29]' : 'text-gray-500'}`}
                            >
                                {index + 1}.
                            </span>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                    <ShoppingBag className="w-4 h-4 text-primary" />
                                    {item.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Đã bán: <strong>{item.totalQuantity}</strong> phần
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopSellingProducts;
