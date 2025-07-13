import React from 'react';
import grabfood from '../assets/grabfood.jpg';
import Be from '../assets/Be.jpg';
import shopeefood from '../assets/shopeefood.jpg';

import DeliveryPartners from './DeliveryPartners';
import PaymentMethods from './PaymentMethods';

const partners = [
    {
        name: 'GrabFood',
        logo: grabfood,
        website: 'https://food.grab.com/vn/en/',
    },
    {
        name: 'Be',
        logo: Be,
        website: 'https://food.be.com.vn/',
    },
    {
        name: 'ShopeeFood',
        logo: shopeefood,
        website: 'https://shopeefood.vn/',
    },
];

const PthucThanhToan = () => {
    return (
        <section className="py-12 bg-gray-50 px-4 sm:px-6 md:px-10 lg:px-20">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* <DeliveryPartners partners={partners} /> */}
                <PaymentMethods />
            </div>
        </section>
    );
};

export default PthucThanhToan;
