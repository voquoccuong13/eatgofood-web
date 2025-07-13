import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken'); // ✅ Xóa token
        localStorage.removeItem('adminInfo'); // ✅ Xóa thông tin user nếu có
        toast.success('Đã đăng xuất');
        navigate('/admin-login'); // ✅ Chuyển về trang đăng nhập
    };

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[4%] py-2 bg-white shadow">
            {/* Logo + chữ Admin Panel nằm chung 1 cột dọc */}
            <div className="flex flex-col">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-3xl font-['Pacifico'] text-primary hover:text-orange-500 transition"
                >
                    Eatgo
                </button>
                <p className="text-black font-bold mt-1">Admin Panel</p>
            </div>

            {/* Avatar + menu logout */}
            <div className="relative">
                <img
                    className="w-[40px] h-[40px] object-cover rounded-full cursor-pointer"
                    src={assets.Avt}
                    alt="Profile"
                    onClick={() => setShowMenu(!showMenu)}
                />

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-50">
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
