import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Orders from './pages/Orders';
import List from './pages/List';
import Add from './pages/Add';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import { ProductProvider } from './pages/ProductContext';
import Subscribers from './pages/Subscribers';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRevenuePage from './pages/AdminRevenuePage';
import AddPromotion from './pages/AddPromotion';
import SendPromotionToPotential from './pages/SendPromotionToPotential';

const App = () => {
    const url = 'http://localhost:9000';

    return (
        <ProductProvider url={url}>
            <ToastContainer />

            <Routes>
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/" element={<Navigate to="/admin-login" />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/admin/list" element={<List url={url} />} />
                    <Route path="/admin/add" element={<Add url={url} />} />
                    <Route path="/admin/orders" element={<Orders url={url} />} />
                    <Route path="/admin/orders/:orderCode" element={<AdminOrderDetailPage />} />
                    <Route path="/admin/subscribers" element={<Subscribers url={url} />} />
                    <Route path="/admin/revenue" element={<AdminRevenuePage />} />
                    <Route path="/admin/add-promotion" element={<AddPromotion url={url} />} />
                    <Route path="/admin/send-promo-potential" element={<SendPromotionToPotential url={url} />} />

                    <Route
                        path="*"
                        element={<p className="p-4 text-center text-red-500">404 - Không tìm thấy trang</p>}
                    />
                </Route>
            </Routes>
        </ProductProvider>
    );
};

export default App;
