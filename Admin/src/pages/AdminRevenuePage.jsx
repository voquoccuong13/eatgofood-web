// pages/AdminRevenuePage.jsx
import React from 'react';
import RevenueChart from '../components/RevenueChart';
// import RevenueStatisticsReport from '../components/RevenueStatisticsReport';
const AdminRevenuePage = () => {
    return (
        <div className="p-6">
            <RevenueChart />
            {/* <RevenueStatisticsReport /> */}
        </div>
    );
};

export default AdminRevenuePage;
