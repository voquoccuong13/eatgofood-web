import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
    return (
        <div className="overflow-x-hidden">
            <footer className="bg-gray-900 text-white pt-12 pb-6">
                <div className="container mx-auto px-4">
                    {/* Grid chia cột có responsive rõ ràng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Logo và mô tả */}
                        <div>
                            <a href="#" className="text-3xl font-['Pacifico'] text-white mb-4 inline-block">
                                EatGo
                            </a>
                            <p className="text-gray-400 mb-4">
                                Chúng tôi cung cấp đồ ăn nhanh chất lượng cao với dịch vụ giao hàng nhanh chóng và thanh
                                toán dễ dàng.
                            </p>
                            <div className="flex space-x-4">
                                <a
                                    href="https://www.facebook.com/Jayte2002.tls.edu.vn"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary transition"
                                >
                                    <i className="ri-facebook-fill"></i>
                                </a>
                                <a
                                    href="https://www.instagram.com/_cwnth_k2/?hl=en"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary transition"
                                >
                                    <i className="ri-instagram-fill"></i>
                                </a>
                                <a
                                    href="https://short.com.vn/KWFi"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary transition"
                                >
                                    <i className="ri-tiktok-fill"></i>
                                </a>
                                <a
                                    href="https://www.youtube.com/@voquoccuong642"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary transition"
                                >
                                    <i className="ri-youtube-fill"></i>
                                </a>
                            </div>
                        </div>

                        {/* Liên kết nhanh */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Trang chủ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Thực đơn
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Về chúng tôi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Hỗ trợ */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Trung tâm hỗ trợ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Câu hỏi thường gặp
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Chính sách bảo mật
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Điều khoản sử dụng
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        Chính sách hoàn tiền
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Liên hệ */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <div className="w-5 h-5 flex items-center justify-center text-primary mt-1 mr-3">
                                        <i className="ri-map-pin-line"></i>
                                    </div>
                                    <span className="text-gray-400">
                                        9 Ngô Chí Quốc, Khu Phố 5, Phường Tam Bình, TP. Thủ Đức
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-5 h-5 flex items-center justify-center text-primary mt-1 mr-3">
                                        <i className="ri-phone-line"></i>
                                    </div>
                                    <span className="text-gray-400">+84 377 513 651</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-5 h-5 flex items-center justify-center text-primary mt-1 mr-3">
                                        <i className="ri-mail-line"></i>
                                    </div>
                                    <span className="text-gray-400">infor@eatgo.vn</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-5 h-5 flex items-center justify-center text-primary mt-1 mr-3">
                                        <i className="ri-time-line"></i>
                                    </div>
                                    <span className="text-gray-400">Mở cửa: 10:00 - 22:00 hàng ngày</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Phần bản quyền */}
                    <div className="border-t border-gray-800 pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm mb-4 md:mb-0">
                                © 2025 EatGo. Tất cả quyền được bảo lưu.
                            </p>
                            <div className="flex space-x-4">
                                <img
                                    src={assets.visafooter}
                                    alt="Payment methods"
                                    className="h-8 max-w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
