import React from 'react';

const PaymentMethods = () => {
    return (
        <div
            className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
        >
            <h2 className="text-3xl font-bold text-center mb-6">Phương thức thanh toán</h2>
            <p className="text-center font-semibold mb-10 text-lg text-primary">
                Đặt hàng ngay thôi – nhiều ưu đãi hấp dẫn đang chờ bạn!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ví điện tử */}
                <div
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary/10 rounded-full">
                        <i className="ri-wallet-3-line ri-xl text-primary"></i>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Ví điện tử</h3>
                    <p className="text-gray-600 text-sm">Thanh toán qua MoMo, VNPay</p>
                </div>

                {/* Tiền mặt */}
                <div
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary/10 rounded-full">
                        <i className="ri-hand-coin-line ri-xl text-primary"></i>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Tiền mặt</h3>
                    <p className="text-gray-600 text-sm">Thanh toán khi nhận hàng (COD)</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
