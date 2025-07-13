import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useProduct } from './ProductContext';
const SendPromotionToPotential = () => {
    const [users, setUsers] = useState([]);
    const { url } = useProduct();
    useEffect(() => {
        const fetchUsers = async () => {
            if (!url) {
                console.warn('⚠️ url bị undefined, không gọi API');
                return;
            }
            try {
                const res = await axios.get(`${url}/api/promotion/potential-users-debug`);
                setUsers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error('Không thể tải danh sách người dùng triển vọng');
                setUsers([]);
            }
        };
        fetchUsers();
    }, [url]);

    return (
        <div className="">
            <h2 className="text-2xl font-bold text-primary mb-6 border-b-2 border-primary pb-2">
                Danh sách Khách hàng Triển Vọng
            </h2>

            <table className="w-full border border-gray-300">
                <thead className="bg-primary text-white">
                    <tr>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Tên</th>
                        <th className="p-2 border">Số đơn</th>
                        <th className="p-2 border">Tổng chi (VNĐ)</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) &&
                        users.map((user, i) => (
                            <tr key={i} className="even:bg-gray-100">
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border">{user.name}</td>
                                <td className="p-2 border text-center">{user.orderCount}</td>
                                <td className="p-2 border text-right">{user.totalSpent.toLocaleString('vi-VN')}</td>
                            </tr>
                        ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-gray-500 italic p-4">
                                Không có người dùng triển vọng trong tháng này.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SendPromotionToPotential;
