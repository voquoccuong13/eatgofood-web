import React, { useState, useEffect } from 'react';
import { UserCircle, History, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import UserOrders from './UserOrders';
import PasswordManagement from './PasswordManagement';
import axios from 'axios';

const SidebarProlife = () => {
    const backendUrl = 'http://localhost:9000';
    const [user, setUser] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('orders');

    // Lấy thông tin user
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const userRes = await axios.get(`${backendUrl}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userData = userRes.data;

                const fullUser = {
                    avatarUrl: userData.avatarUrl ? `${backendUrl}${userData.avatarUrl}` : '/default-avatar.png',
                    fullName: userData.name,
                    email: userData.email,
                };
                setUser(fullUser);
            } catch (error) {
                console.error('Fetch profile error:', error);
            }
        };

        fetchProfile();
    }, []);

    // Xử lý avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Bạn cần đăng nhập để cập nhật avatar');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const res = await axios.post(`${backendUrl}/api/users/upload-avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = res.data;

            const newAvatarUrl = `${backendUrl}${data.avatarUrl}`;
            setUser((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
            setAvatarFile(null);
            setAvatarPreview(null);
            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi tải ảnh lên.');
        }

        setLoading(false);
    };

    if (!user) return <p className="pt-24 text-center">Đang tải thông tin người dùng...</p>;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full lg:w-72 bg-white shadow-md p-4 pt-24"
            >
                <div className="flex flex-col items-center">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                        <img
                            src={avatarPreview || user.avatarUrl || '/default-avatar.png'}
                            alt="avatar"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border hover:opacity-80 transition"
                        />
                    </label>

                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />

                    {avatarFile && (
                        <button
                            onClick={handleAvatarUpload}
                            disabled={loading}
                            className="mt-2 px-3 py-1.5 text-sm sm:text-base bg-blue-600 text-white rounded"
                        >
                            {loading ? 'Đang tải...' : 'Cập nhật ảnh đại diện'}
                        </button>
                    )}

                    <p className="text-lg font-semibold mt-4 text-center">Tài khoản của bạn</p>
                </div>

                <nav className="mt-8 space-y-3">
                    <button
                        onClick={() => setSelectedTab('orders')}
                        className={`flex items-center gap-2 w-full text-left px-2 py-2 rounded text-sm ${
                            selectedTab === 'orders' ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                        }`}
                    >
                        <History size={18} />
                        <span>Lịch sử đơn hàng</span>
                    </button>

                    <button
                        onClick={() => setSelectedTab('password')}
                        className={`flex items-center gap-2 w-full text-left px-2 py-2 rounded text-sm ${
                            selectedTab === 'password' ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                        }`}
                    >
                        <Lock size={18} />
                        <span>Đổi mật khẩu</span>
                    </button>
                </nav>
            </motion.div>

            {/* Nội dung chính */}
            <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex-1 w-full pt-24 px-4 pb-12 overflow-x-hidden"
            >
                {selectedTab === 'orders' && <UserOrders />}
                {selectedTab === 'password' && <PasswordManagement />}
            </motion.div>
        </div>
    );
};

export default SidebarProlife;
