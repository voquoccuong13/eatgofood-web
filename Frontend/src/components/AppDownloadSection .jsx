import React, { useState } from 'react';
import { RiAppleFill, RiGooglePlayFill } from 'react-icons/ri';
import Appfood from '../assets/Appfood.jpg';

const AppDownloadSection = () => {
    return (
        <section className="py-12 bg-white text-black px-4 sm:px-6 lg:px-8">
            {/* Vùng tải app */}
            <div
                className="max-w-screen-xl mx-auto bg-primary text-white py-10 px-6 sm:px-10 rounded-xl shadow-lg"
                data-aos="fade-up"
                data-aos-duration="1000"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div data-aos="fade-right" data-aos-delay="200">
                        <h2 className="text-3xl font-bold mb-4">Tải App / Đặt hàng nhanh</h2>
                        <p className="mb-6 text-gray-100">
                            Sắp ra mắt ứng dụng đặt đồ ăn nhanh tiện lợi hơn, nhiều ưu đãi độc quyền!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center sm:items-start justify-center">
                            <button className="bg-black text-white py-3 px-6 rounded-lg flex items-center opacity-70 cursor-not-allowed w-fit">
                                <RiAppleFill size={24} className="mr-2" />
                                <div className="text-left">
                                    <div className="text-xs">App Store</div>
                                    <div className="font-medium text-sm">Coming Soon</div>
                                </div>
                            </button>
                            <button className="bg-green-600 text-white py-3 px-6 rounded-lg flex items-center opacity-70 cursor-not-allowed w-fit">
                                <RiGooglePlayFill size={24} className="mr-2" />
                                <div className="text-left">
                                    <div className="text-xs">Google Play</div>
                                    <div className="font-medium text-sm">Coming Soon</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center" data-aos="fade-left" data-aos-delay="300">
                        <img
                            src={Appfood}
                            alt="App screenshot"
                            className="w-full max-w-xs md:max-w-sm rounded-xl shadow-md"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppDownloadSection;
