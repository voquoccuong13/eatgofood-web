import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { StoreContext } from '../context/StoreContext';

const FoodItem = ({ id, name, description, price, image, isNew, isHot }) => {
    const { addToCart } = useContext(StoreContext);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        setIsPressed(true);
        addToCart({ id, name, description, price, image });
        setTimeout(() => setIsPressed(false), 150); // 150ms hiệu ứng nhấn
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="h-48 overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover object-top" />
                {isNew && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow">
                        🆕 Mới
                    </div>
                )}

                {isHot && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        🔥 Bán chạy
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-lg">{name}</p>
                    {/* Nếu muốn thêm rating có thể mở comment */}
                    {/* <img src={assets.rating_starts} alt="rating" className="w-6 h-6" /> */}
                </div>
                <p className="text-gray-600 text-sm mb-3">{description}</p>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-primary">
                        {price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        })}
                    </span>

                    <button
                        onClick={handleClick}
                        className={`add-to-cart w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full !rounded-button transition-transform ${
                            isPressed ? 'scale-90 opacity-80' : 'scale-100 opacity-100'
                        }`}
                        aria-label="Đặt hàng món"
                    >
                        <i className="ri-add-line ri-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodItem;
