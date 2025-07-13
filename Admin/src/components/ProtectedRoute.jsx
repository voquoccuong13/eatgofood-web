import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const admin = localStorage.getItem('adminToken'); // ✅ sửa đúng key
    return admin ? children : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
