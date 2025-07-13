// components/AdminLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <>
            <Navbar />
            <hr className="border-0 h-px bg-[#a9a9a9]" />
            <div className="flex">
                <Sidebar />
                <Outlet /> {/* nơi hiển thị các trang admin con */}
            </div>
        </>
    );
};

export default AdminLayout;
