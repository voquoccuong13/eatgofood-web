import React, { useState, useContext, useRef, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { getSubtotal, getDiscountAmount, calculateShippingFee, getTotal } from '../components/MapUtil';
import Swal from 'sweetalert2';

// Hàm tính khoảng cách Haversine (km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái đất km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

//Biến môi trường – API Key OpenCage
const OPEN_CAGE_API_KEY = '64b83e0e37de4bb7b4144b4c3c74d6ce';

//Khởi tạo State và Context
export default function PlaceOrder() {
    const { cartItem, clearCart, orderInfo, note } = useContext(StoreContext);
    const navigate = useNavigate();
    // Thông tin địa chỉ
    const [address, setAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [canOrder, setCanOrder] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [addressDetail, setAddressDetail] = useState('');
    //load tiến hành đặt hàng
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Ref
    const addressInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const SHIPPING_FEE = 15000;
    // Toạ độ cửa hàng (cố định)
    const storeLocation = { lat: 10.874761775915596, lng: 106.73154771746418 };

    //Tính toán phí & tổng đơn
    const subtotal = getSubtotal(cartItem);
    const shippingFee = calculateShippingFee(distance);
    const discountRate = orderInfo?.discountRate || 0;
    const discountAmount = getDiscountAmount(subtotal, discountRate);
    const total = getTotal(subtotal, discountAmount, shippingFee);

    // Thông tin đặt hàng
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [needPlasticUtensils, setNeedPlasticUtensils] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    // Kiểm tra tính hợp lệ của email và số điện thoại
    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const isValidPhone = (phone) => {
        const regex = /^(0|\+84)[3-9][0-9]{8}$/; // Hợp lệ cho số VN
        return regex.test(phone);
    };

    // Hook debounce địa chỉ
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    };

    const debouncedAddress = useDebounce(address, 500);

    // Hàm lấy gợi ý địa chỉ từ OpenCage API
    const fetchAddressSuggestions = async (query) => {
        if (!query.trim() || query.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: `${query}, Vietnam`,
                    key: OPEN_CAGE_API_KEY,
                    limit: 5,
                    countrycode: 'vn',
                    language: 'vi',
                },
            });

            const data = response.data;

            if (data.results && data.results.length > 0) {
                const suggestions = data.results.map((result, index) => ({
                    id: index,
                    formatted: result.formatted,
                    components: result.components,
                    geometry: result.geometry,
                }));
                setAddressSuggestions(suggestions);
                setShowSuggestions(true);
            } else {
                setAddressSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (err) {
            console.error('Lỗi khi lấy gợi ý địa chỉ:', err);
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
        setIsLoadingSuggestions(false);
    };

    // Effect lấy gợi ý khi địa chỉ thay đổi
    useEffect(() => {
        if (debouncedAddress) {
            fetchAddressSuggestions(debouncedAddress);
        }
    }, [debouncedAddress]);

    // Đóng gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                !addressInputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Xử lý chọn địa chỉ từ gợi ý
    const handleSuggestionClick = (suggestion) => {
        setAddress(suggestion.formatted);
        setShowSuggestions(false);
        setCanOrder(false);
        setDistance(null);
        setError('');
        // Tự động kiểm tra khoảng cách sau khi chọn gợi ý
        setTimeout(() => {
            checkDistanceWithCoordinates(suggestion.geometry.lat, suggestion.geometry.lng);
        }, 100);
    };

    // Hàm kiểm tra khoảng cách với tọa độ có sẵn
    const checkDistanceWithCoordinates = (lat, lng) => {
        const dist = getDistanceFromLatLonInKm(storeLocation.lat, storeLocation.lng, lat, lng);
        const formattedDistance = Number(dist.toFixed(2));
        setDistance(formattedDistance);

        if (dist > 5) {
            setError('Chúng tôi chỉ giao hàng trong phạm vi 5km.');
            setCanOrder(false);
        } else {
            setError('');
            setCanOrder(true);
        }
    };

    // Hàm gọi API OpenCage lấy tọa độ và tính khoảng cách
    const checkDistance = async () => {
        if (!address.trim()) {
            setError('Vui lòng nhập địa chỉ.');
            setDistance(null);
            setCanOrder(false);
            return;
        }

        setError('');
        setIsChecking(true);

        try {
            const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                params: {
                    q: address,
                    key: OPEN_CAGE_API_KEY,
                },
            });

            const data = response.data;

            if (!data.results || data.results.length === 0) {
                setError('Không tìm thấy địa chỉ hợp lệ.');
                setDistance(null);
                setCanOrder(false);
            } else {
                const { lat, lng } = data.results[0].geometry;
                checkDistanceWithCoordinates(lat, lng);
            }
        } catch (err) {
            console.error('Lỗi khi gọi API:', err);
            setError('Lỗi khi gọi API.');
            setDistance(null);
            setCanOrder(false);
        }
        setIsChecking(false);
    };

    // Xử lý đặt hàng
    const handlePlaceOrder = async () => {
        if (!canOrder) {
            alert('Bạn chưa thể đặt hàng vì địa chỉ không hợp lệ hoặc vượt quá phạm vi giao hàng.');
            return;
        }

        if (!fullName.trim()) {
            setError('Vui lòng nhập họ và tên.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Email không hợp lệ. Vui lòng nhập đúng định dạng.');
            return;
        }

        if (!isValidPhone(phone)) {
            setError('Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ.');
            return;
        }

        setError('');
        setIsPlacingOrder(true);
        const fullAddress = `${addressDetail.trim()}, ${address.trim()}`;

        const orderData = {
            fullName,
            email,
            phone,
            address: fullAddress,
            distance,
            needPlasticUtensils,
            paymentMethod,
            cartItems: Object.entries(cartItem).map(([id, item]) => ({
                productId: id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
            })),
            subtotal,
            shippingFee,
            discountAmount,
            total,
            note: note.trim(),
        };
        console.log(' orderData gửi lên backend:', orderData);
        try {
            const token = localStorage.getItem('token');

            if (paymentMethod === 'momo') {
                const response = await axios.post(
                    '/api/momo/create',
                    {
                        total,
                        fullName,
                        phone,
                        address: `${addressDetail.trim()}, ${address.trim()}`,
                        distance,
                        subtotal,
                        shippingFee,
                        discountAmount,
                        needPlasticUtensils,
                        cartItems: Object.entries(cartItem).map(([id, item]) => ({
                            productId: id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image,
                            selectedOptions: item.selectedOptions || {},
                            variantKey: item.variantKey || '',
                        })),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    },
                );

                const data = response.data;

                if (data.payUrl) {
                    // Lưu orderCode để xác định đơn đang xử lý
                    localStorage.setItem('pendingOrderCode', data.orderId);

                    // Lưu lại extraData (dạng base64) để dùng sau khi redirect về
                    if (data.extraData) {
                        localStorage.setItem(`momo_extra_${data.orderId}`, data.extraData);
                    }
                    console.log('🔗 MoMo redirect URL:', data.payUrl);

                    window.location.href = data.payUrl;
                } else {
                    setError(data.message || 'Lỗi tạo đơn thanh toán MoMo');
                }
            } else if (paymentMethod === 'vnpay') {
                const response = await axios.post(
                    '/api/vnpay/create_payment',
                    {
                        total,
                        fullName,
                        email,
                        phone,
                        address: `${addressDetail.trim()}, ${address.trim()}`,
                        distance,
                        subtotal,
                        shippingFee,
                        discountAmount,
                        needPlasticUtensils,
                        cartItems: Object.entries(cartItem).map(([id, item]) => ({
                            productId: id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image,
                            selectedOptions: item.selectedOptions || {},
                            variantKey: item.variantKey || '',
                        })),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    },
                );

                const data = response.data;

                if (data.paymentUrl) {
                    // Lưu orderCode để đối chiếu
                    localStorage.setItem('pendingOrderCode', data.orderId);
                    console.log('🔗 VNPay redirect URL:', data.paymentUrl);
                    window.location.href = data.paymentUrl;
                } else {
                    setError(data.message || 'Lỗi tạo đơn thanh toán VNPay');
                }
            } else {
                // Xử lý thanh toán tiền mặt
                const response = await axios.post('/api/orders', orderData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;

                if (!data.orderCode) {
                    setError('Không nhận được mã đơn hàng từ server');
                    return;
                }

                clearCart();
                //  Đánh dấu mã giảm giá đã dùng (nếu có)
                if (orderInfo?.coupon) {
                    try {
                        console.log('📤 Gửi request đánh dấu mã:', orderInfo.coupon);
                        await axios.post(
                            'api/promotion-discounts/mark-used',
                            { code: orderInfo.coupon },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        );
                        console.log('✅ Mã giảm giá đã được đánh dấu là đã dùng');
                    } catch (err) {
                        console.error('Không thể đánh dấu mã giảm giá:', err);
                    }
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Đặt hàng thành công!',
                    text: 'Cảm ơn bạn đã mua hàng 🎉',
                    confirmButtonText: 'Xem đơn hàng',
                    confirmButtonColor: '#FF4C29',
                    width: 360,
                    padding: '1.5em',
                    heightAuto: false,
                    showClass: { popup: 'swal2-show animate__animated animate__fadeInDown' },
                    hideClass: { popup: 'swal2-hide animate__animated animate__fadeOutUp' },
                }).then(() => {
                    navigate(`/order/${data.orderCode}`);
                });
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);

            // Xử lý lỗi dựa trên response từ server
            if (error.response) {
                // Server trả về response với status code lỗi
                const errorMessage = error.response.data?.message || 'Lỗi đặt hàng.';
                setError(errorMessage);
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                setError('Lỗi kết nối server.');
            } else {
                // Lỗi khác
                setError('Đã xảy ra lỗi không mong muốn.');
            }
        } finally {
            setIsPlacingOrder(false); // Kết thúc loading
        }
    };

    return (
        <form className="p-6 pt-28 max-w-5xl mx-auto flex flex-col">
            {/* Dòng tiêu đề */}
            <p className="text-2xl font-bold text-center mb-6 text-primary">Xác nhận đơn hàng</p>

            {/* 2 cột dưới đây */}
            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>

                    {/* Thông tin cơ bản */}
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        className="p-2 border rounded w-full mb-2"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className={`p-2 border rounded w-full mb-4 ${
                            !isValidEmail(email) && email ? 'border-red-500' : ''
                        }`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        className={`p-2 border rounded w-full mb-4 ${
                            !isValidPhone(phone) && phone ? 'border-red-500' : ''
                        }`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    {/* Input số nhà / căn hộ */}
                    <div className="relative mb-2">
                        <input
                            type="text"
                            placeholder="Nhập số nhà, căn hộ, tên tòa nhà..."
                            className="p-2 border rounded w-full"
                            value={addressDetail}
                            onChange={(e) => setAddressDetail(e.target.value)}
                        />
                    </div>

                    {/* Input địa chỉ gợi ý từ OpenCage */}
                    <div className="relative mb-2">
                        <input
                            ref={addressInputRef}
                            type="text"
                            placeholder="Nhập tên đường, phường, quận..."
                            className="p-2 border rounded w-full"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setCanOrder(false);
                                setDistance(null);
                                setError('');
                            }}
                            onFocus={() => {
                                if (addressSuggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                        />

                        {/* Loading indicator */}
                        {isLoadingSuggestions && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Dropdown gợi ý */}
                        {showSuggestions && addressSuggestions.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
                            >
                                {addressSuggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.id}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <div className="font-medium text-sm text-gray-900">{suggestion.formatted}</div>
                                        {suggestion.components.road && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {suggestion.components.road}
                                                {suggestion.components.suburb && `, ${suggestion.components.suburb}`}
                                                {suggestion.components.city && `, ${suggestion.components.city}`}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={checkDistance}
                        disabled={isChecking}
                        className="mb-2 px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
                    >
                        {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra khoảng cách'}
                    </button>

                    {distance !== null && (
                        <p className="mb-2">
                            Khoảng cách đến cửa hàng: <strong>{distance} km</strong>
                        </p>
                    )}

                    {canOrder && !error && <p className="text-green-600 mb-4">Địa chỉ hợp lệ. Bạn có thể đặt hàng!</p>}

                    {error && <p className="text-red-600 mb-4">{error}</p>}

                    {/* Lựa chọn lấy dụng cụ ăn uống nhựa */}
                    <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-800">
                            <i
                                className={`ri-check-line text-green-600 text-lg ${
                                    needPlasticUtensils ? '' : 'invisible'
                                }`}
                            ></i>
                            <span>Lấy dụng cụ ăn uống nhựa</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={needPlasticUtensils}
                                onChange={() => setNeedPlasticUtensils(!needPlasticUtensils)}
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer-checked:bg-primary transition-colors"></div>
                            <span className="sr-only">Toggle Plastic Utensils</span>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md flex items-center justify-center text-primary transition-transform peer-checked:translate-x-5">
                                {needPlasticUtensils && <i className="ri-check-line text-green-600 text-sm"></i>}
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>

                    <div className="space-y-2 text-sm md:text-base border rounded p-4 bg-gray-50 mb-4">
                        {/* Danh sách sản phẩm đã chọn - chỉ ảnh, số lượng và giá */}
                        <div className="mb-6">
                            <p className="font-semibold mb-2">Chi tiết đơn hàng</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(cartItem).map(([itemId, item]) => (
                                    <div key={itemId} className="flex items-center gap-4 p-2 border rounded bg-white">
                                        <div className="relative">
                                            <img
                                                src={item.image}
                                                alt="item"
                                                className="w-16 h-16 object-cover rounded"
                                            />

                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <div className="ml-auto text-right text-sm">
                                            <p className="font-semibold">
                                                {(item.price * item.quantity).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>

                                            {/* Các tùy chọn đã chọn */}
                                            {item.selectedOptions &&
                                                Object.entries(item.selectedOptions).map(([optionName, choices]) => (
                                                    <p key={optionName} className="text-gray-500 text-xs italic">
                                                        {optionName}: {choices.map((c) => c.label).join(', ')}
                                                    </p>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p>
                            Tổng sản phẩm:{' '}
                            <span className="font-semibold">
                                {subtotal.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                            </span>
                        </p>
                        {discountRate > 0 && (
                            <p>
                                Giảm giá ({(discountRate * 100).toFixed(0)}%):{' '}
                                <span className="font-semibold text-green-600">
                                    -
                                    {discountAmount.toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </span>
                            </p>
                        )}
                        <p>
                            Phí vận chuyển:{' '}
                            <span className="font-semibold">
                                {shippingFee.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                            </span>
                        </p>
                        <p className="text-lg font-bold">
                            Tổng thanh toán:{' '}
                            <span className="text-red-600">
                                {total.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                            </span>
                        </p>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="mt-6 space-y-2">
                        <p className="font-semibold">Phương thức thanh toán:</p>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="payment"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={() => setPaymentMethod('cash')}
                            />
                            Thanh toán khi nhận hàng
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="payment"
                                value="momo"
                                checked={paymentMethod === 'momo'}
                                onChange={() => setPaymentMethod('momo')}
                            />
                            Thanh toán qua MoMo
                        </label>
                        {paymentMethod === 'momo' && (
                            <div className="ml-6 mt-1 p-3 rounded bg-blue-100 border border-blue-400 text-blue-700 text-sm">
                                💳 Bạn sẽ được chuyển đến cổng thanh toán MoMo để hoàn tất giao dịch.
                            </div>
                        )}
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="payment"
                                value="vnpay"
                                checked={paymentMethod === 'vnpay'}
                                onChange={() => setPaymentMethod('vnpay')}
                            />
                            Thanh toán qua VNPay
                        </label>

                        {paymentMethod === 'vnpay' && (
                            <div className="ml-6 mt-1 p-3 rounded bg-blue-100 border border-blue-400 text-blue-700 text-sm">
                                💳 Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.
                            </div>
                        )}
                    </div>

                    <div className="text-right mt-6">
                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                            className="bg-primary text-white px-6 py-3 rounded text-sm md:text-base hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                        >
                            {isPlacingOrder && (
                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                            )}
                            {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
            {isPlacingOrder && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-white ml-4 text-lg">Đang xử lý đơn hàng...</div>
                </div>
            )}
        </form>
    );
}
