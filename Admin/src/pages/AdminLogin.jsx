import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ✅ new
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                navigate('/admin/list');
            } catch (err) {
                localStorage.removeItem('adminToken');
            } finally {
                setIsCheckingAuth(false); // ✅ QUAN TRỌNG: cập nhật xong thì cho render
            }
        } else {
            setIsCheckingAuth(false); // ✅ Không có token thì cho render login
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post('/api/users/login-admin', {
                email,
                password,
            });

            if (data?.token && data?.user?.role === 'admin') {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminInfo', JSON.stringify(data.user));
                console.log('➡️ Chuyển đến /admin/list'); // ✅ Thêm dòng này kiểm tra
                toast.success('Đăng nhập thành công!');
                navigate('/admin/list');
            } else {
                toast.error('Bạn không có quyền truy cập!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Chỉ hiển thị giao diện khi đã kiểm tra xong token
    if (isCheckingAuth) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <motion.form
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                onSubmit={handleLogin}
                className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
            >
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Admin Panel</h1>
                    <p className="text-gray-500 text-sm sm:text-base">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-lg pr-10 focus:ring-2 focus:ring-primary outline-none text-sm sm:text-base"
                    required
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-lg pr-10 focus:ring-2 focus:ring-primary outline-none text-sm sm:text-base"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition ${
                        loading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang đăng nhập...
                        </div>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </motion.form>
        </div>
    );
};

export default AdminLogin;
