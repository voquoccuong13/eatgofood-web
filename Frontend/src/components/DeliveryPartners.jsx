import React from 'react';

const DeliveryPartners = ({ partners }) => {
    return (
        <div
            className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-12 px-6 sm:px-10 md:px-16 rounded-lg shadow-xl max-w-6xl mx-auto"
            data-aos="zoom-in"
            data-aos-duration="1000"
        >
            <h2 className="text-3xl font-bold mb-6 text-center">Đối tác giao hàng</h2>
            <p className="mb-8 text-center text-white max-w-xl mx-auto text-sm sm:text-base">
                Chúng tôi hợp tác với các đối tác giao hàng hàng đầu để đảm bảo món ăn của bạn được vận chuyển nhanh
                chóng, an toàn và giữ trọn hương vị.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
                {partners.map((partner, index) => (
                    <a
                        key={partner.name}
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                        data-aos="fade-up"
                        data-aos-delay={index * 150}
                        data-aos-duration="800"
                    >
                        <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                        />
                        <span className="font-semibold text-base sm:text-lg">{partner.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default DeliveryPartners;
