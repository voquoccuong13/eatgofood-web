import React from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlusCircle, List, ShoppingCart, Users, BarChart2, Percent } from 'lucide-react';
const Sidebar = () => {
    return (
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow z-40 pt-24">
            <div className="pt-[50px] ml-[20%] flex flex-col gap-[20px] ">
                <NavLink
                    to="/admin/add"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <PlusCircle size={20} />
                    <p className="hidden md:block tracking-wide">Thêm món</p>
                </NavLink>

                <NavLink
                    to="/admin/list"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <List size={20} />
                    <p className="hidden md:block">Danh sách món</p>
                </NavLink>
                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <ShoppingCart size={20} />
                    <p className="hidden md:block">Đơn hàng</p>
                </NavLink>
                <NavLink
                    to="/admin/subscribers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <Users size={20} />
                    <p className="hidden md:block">Người dùng</p>
                </NavLink>
                <NavLink
                    to="/admin/revenue"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <BarChart2 size={20} />
                    <p className="hidden md:block">Doanh thu</p>
                </NavLink>
                <NavLink
                    to="/admin/add-promotion"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200
        ${isActive ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`
                    }
                >
                    <Percent size={20} />
                    <p className="hidden md:block tracking-wide">Mã giảm giá</p>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
