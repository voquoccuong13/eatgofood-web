import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const OfferItem = ({
    id,
    deal,
    name,
    description,
    image,
    priceOld,
    price,
    onOpenDetail,
    rating = 0,
    numReviews = 0,
}) => {
    const { addToCart } = useContext(StoreContext);
    const renderStars = (value) => {
        const fullStars = Math.floor(value);
        const hasHalfStar = value % 1 !== 0;
        const emptyStars = 5 - Math.ceil(value);

        return (
            <div className="flex gap-0.5 text-yellow-400 text-sm">
                {[...Array(fullStars)].map((_, i) => (
                    <i key={`full-${i}`} className="ri-star-fill"></i>
                ))}
                {hasHalfStar && <i className="ri-star-half-fill"></i>}
                {[...Array(emptyStars)].map((_, i) => (
                    <i key={`empty-${i}`} className="ri-star-line"></i>
                ))}
            </div>
        );
    };
    return (
        <section>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Ảnh */}
                    <div className="md:w-2/5 h-64 md:h-auto">
                        <img src={image} alt={name} className="w-full h-full object-cover object-top" />
                    </div>

                    {/* Nội dung */}
                    <div className="md:w-3/5 flex flex-col justify-between p-6 h-full">
                        <div>
                            <span className="inline-block bg-primary text-white text-sm font-medium px-3 py-1 rounded-full mb-3">
                                {deal}
                            </span>
                            <div onClick={() => onOpenDetail(_id)} className="cursor-pointer">
                                <p className="font-semibold text-lg mb-1">{name}</p>
                                {renderStars(rating)}
                                <p className="text-xs text-gray-500 mb-2">{numReviews} đánh giá</p>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
                            </div>
                        </div>

                        {/* Phần giá + nút đặt */}
                        <div>
                            <div className="flex items-center mb-4">
                                {priceOld && (
                                    <span className="text-gray-400 line-through mr-2">
                                        {priceOld.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </span>
                                )}
                                <span className="font-bold text-xl text-primary">
                                    {price.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </span>
                            </div>
                            <button
                                className="bg-primary text-white py-2 px-4 font-medium rounded-button whitespace-nowrap hover:bg-primary/90 transition"
                                onClick={() => addToCart({ _id: id, name, image, price })}
                            >
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OfferItem;
