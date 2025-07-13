import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import Banner98k from '../assets/Banner98k.webp'; // bạn thêm ảnh tương ứng
import Banner1 from '../assets/Banner1.png'; // bạn thêm ảnh tương ứng
import Banner2 from '../assets/Banner2.png'; // bạn thêm ảnh tương ứng
import { assets } from '../assets/assets';
const Hero = ({ onOrderNowClick }) => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
        });
    }, []);

    const slides = [
        {
            bg: Banner1,
            // title: 'Đồ ăn ngon, giao hàng nhanh',
            // desc: 'Thưởng thức món ăn yêu thích với dịch vụ giao hàng siêu tốc.',
        },
        {
            bg: Banner2,
            // title: 'Combo tiết kiệm mỗi ngày',
            // desc: 'Tiết kiệm đến 30% với các combo đặc biệt hôm nay.',
        },
        {
            // bg: Hero_3,
            // title: 'Ưu đãi hấp dẫn đang chờ bạn',
            // desc: 'Nhận ngay mã giảm giá cho lần đặt hàng đầu tiên!',
        },
    ];

    return (
        <section className="relative w-full h-[550px]">
            <Swiper
                modules={[Autoplay, EffectFade]}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                effect="fade"
                loop
                className="w-full h-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="w-full h-full relative"
                            // style={{ backgroundImage: `url(${slide.bg})` }}
                        >
                            <img
                                src={slide.bg}
                                alt={`Slide ${index + 1}`}
                                width={2048}
                                height={665}
                                className="block max-w-full h-auto"
                                style={{ imageRendering: 'auto' }}
                            />
                            <div className="absolute inset-0  opacity-30 z-0" />
                            <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-6 md:px-20 relative z-10">
                                <div className="w-full md:w-1/2 text-center md:text-left py-8 md:py-0 text-white">
                                    <h1 className="text-4xl md:text-5xl font-bold mb-4" data-aos="fade-up">
                                        {slide.title}
                                    </h1>
                                    <p
                                        className="text-lg text-gray-200 mb-8 max-w-xl mx-auto md:mx-0"
                                        data-aos="fade-up"
                                        data-aos-delay="200"
                                    >
                                        {slide.desc}
                                    </p>
                                    {/* <div data-aos="fade-up" data-aos-delay="400">
                                        <a
                                            href="#foodhot"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (typeof onOrderNowClick === 'function') {
                                                    onOrderNowClick();
                                                }
                                            }}
                                            className="inline-flex items-center bg-white text-black py-2 px-4 font-medium rounded-md transition duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 active:scale-95"
                                        >
                                            <span
                                                role="img"
                                                aria-label="fire"
                                                className="animate-pulse text-red-500 text-xl"
                                            >
                                                🔥
                                            </span>
                                            Đặt hàng ngay
                                        </a>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
