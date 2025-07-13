import React from 'react';
import { assets } from '../assets/assets';

const Aboutus = () => {
    return (
        <section className="py-12 pt-24 px-4 sm:px-6 md:px-12 lg:px-20 bg-white" data-aos="fade-up">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Hình ảnh */}
                    <div className="lg:w-1/2" data-aos="fade-right">
                        <img
                            src={assets.AboutUs}
                            alt="Về chúng tôi - EatGo"
                            className="w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                        />
                    </div>

                    {/* Nội dung */}
                    <div className="lg:w-1/2" data-aos="fade-left">
                        <h2 className="text-3xl font-bold mb-4 text-primary">Về EatGo</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Tại EatGo, chúng tôi tin rằng một bữa ăn ngon không chỉ dừng lại ở hương vị mà còn là trải
                            nghiệm dịch vụ hoàn hảo...
                        </p>

                        <div className="space-y-4 mb-6">
                            {[
                                {
                                    icon: 'ri-restaurant-2-line',
                                    title: '100% nguyên liệu tươi sạch',
                                    desc: 'Chúng tôi lựa chọn nguyên liệu tự nhiên và chế biến mỗi ngày.',
                                    delay: 100,
                                },
                                {
                                    icon: 'ri-truck-line',
                                    title: 'Giao hàng siêu tốc',
                                    desc: 'Thời gian giao hàng từ 20-30 phút, đảm bảo món ăn luôn nóng hổi.',
                                    delay: 200,
                                },
                                {
                                    icon: 'ri-heart-line',
                                    title: 'Khách hàng là trung tâm',
                                    desc: 'Chúng tôi luôn lắng nghe và cải thiện dịch vụ mỗi ngày để phục vụ bạn tốt hơn.',
                                    delay: 300,
                                },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start"
                                    data-aos="fade-up"
                                    data-aos-delay={item.delay}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mr-3 mt-1">
                                        <i className={`${item.icon} text-primary ri-xl`}></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary">{item.title}</h4>
                                        <p className="text-gray-600 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="#khuyenmai"
                            className="bg-primary text-white py-3 px-6 font-medium rounded-full hover:bg-primary/90 transition"
                        >
                            Xem ưu đãi
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Aboutus;
