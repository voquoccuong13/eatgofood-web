import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';
import { StoreContext } from '../context/StoreContext';
import OptionModal from './Models/OptionModal';

const ProductDetail = ({ onClose, productId, onRatingSubmitted }) => {
    const params = useParams();
    const id = productId || params.id;
    const modalRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [hasReviewed, setHasReviewed] = useState(false);
    const { addToCart } = useContext(StoreContext);
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [canReview, setCanReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm loading state
    const userId = localStorage.getItem('userId');
    const [filterRating, setFilterRating] = useState(0); // 0 nghĩa là "Tất cả"

    const backendBaseURL = 'http://localhost:9000'; // Định nghĩa base URL

    useEffect(() => {
        axios
            .get(`${backendBaseURL}/api/products/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => console.error('Lỗi khi lấy chi tiết sản phẩm:', err));
    }, [id]);

    useEffect(() => {
        axios
            .get(`${backendBaseURL}/api/reviews?productId=${id}`)
            .then((res) => {
                setReviews(res.data);
                if (userId) {
                    const already = res.data.some((r) => r.userId === userId);
                    setHasReviewed(already);
                }
            })
            .catch((err) => console.error('Lỗi khi lấy đánh giá:', err));
    }, [id, userId]);

    useEffect(() => {
        if (!userId) return;
        axios
            .get(`${backendBaseURL}/api/orders/user/${userId}`)
            .then((res) => {
                const hasPurchased = res.data.some((order) => order.items.some((item) => item.productId === id));
                setCanReview(hasPurchased);
            })
            .catch((err) => console.error('Lỗi kiểm tra đơn hàng:', err));
    }, [id, userId]);

    const handleSubmit = async () => {
        if (!rating || !comment.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (isSubmitting) return; // Prevent double submission

        try {
            setIsSubmitting(true);

            const response = await axios.post(`${backendBaseURL}/api/reviews`, {
                productId: id,
                userId,
                rating,
                comment: comment.trim(),
            });

            console.log('Review submitted successfully:', response.data);
            alert('Đánh giá thành công!');

            // Reset form
            setRating(0);
            setComment('');
            setHasReviewed(true);

            // Fetch updated reviews
            const reviewsRes = await axios.get(`${backendBaseURL}/api/reviews?productId=${id}`);
            setReviews(reviewsRes.data);

            // Fetch updated product data
            const productRes = await axios.get(`${backendBaseURL}/api/products/${id}`);
            setProduct(productRes.data);

            // Notify parent component với productId
            if (onRatingSubmitted && typeof onRatingSubmitted === 'function') {
                onRatingSubmitted(id); // Pass productId to parent
            }
        } catch (err) {
            console.error('Lỗi khi gửi đánh giá:', err);
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (value, onSelect) => (
        <div className="flex gap-1 cursor-pointer">
            {[1, 2, 3, 4, 5].map((num) => (
                <Star
                    key={num}
                    fill={value >= num ? 'orange' : 'none'}
                    stroke="orange"
                    size={20}
                    onClick={() => onSelect && onSelect(num)}
                />
            ))}
        </div>
    );

    if (!product) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-md w-full max-w-md mx-auto p-4 relative overflow-y-auto max-h-[90vh] hide-scrollbar "
                onClick={(e) => e.stopPropagation()}
            >
                <button className="absolute text-5xl top-2 right-2 text-gray-500 hover:text-primary" onClick={onClose}>
                    &times;
                </button>

                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <div className="h-60 w-full overflow-hidden rounded mb-4">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
                    />
                </div>

                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="text-sm text-gray-500 mb-1">
                    {product.numReviews || 0} đánh giá - ⭐ {(product.rating || 0).toFixed(1)}
                </p>

                <div className="flex justify-between items-center mt-4 mb-4">
                    <span className="font-bold text-lg text-primary">
                        {product.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        })}
                    </span>
                    <button
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        onMouseLeave={() => setIsPressed(false)}
                        onClick={() => {
                            console.log('Clicked product:', product);
                            if (product.options?.length > 0) {
                                setShowModal(true);
                            } else {
                                addToCart(product);
                            }
                        }}
                        className={`add-to-cart w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full !rounded-button ${
                            isPressed ? 'pressed' : ''
                        }`}
                        aria-label="Đặt hàng món"
                        style={{
                            transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                            transition: 'transform 0.1s ease',
                            boxShadow: isPressed ? 'none' : '',
                        }}
                    >
                        <i className="ri-add-line ri-lg"></i>
                    </button>
                </div>

                <hr className="my-6" />
                <div className="mb-4 flex gap-2 items-center">
                    <label className="text-sm font-medium">Lọc theo số sao:</label>
                    {[0, 5, 4, 3, 2, 1].map((r) => (
                        <button
                            key={r}
                            onClick={() => setFilterRating(r)}
                            className={`px-2 py-1 rounded border text-sm ${
                                filterRating === r
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-gray-700 border-gray-300'
                            }`}
                        >
                            {r === 0 ? 'Tất cả' : `${r} ★`}
                        </button>
                    ))}
                </div>

                <div className="mt-6 border-t pt-6 ">
                    <h2 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h2>

                    {canReview && !hasReviewed ? (
                        <div className="mb-6">
                            <label className="block mb-1 font-medium">Chọn số sao</label>
                            {renderStars(rating, setRating)}
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="w-full border rounded mt-3 p-2"
                                placeholder="Nhận xét của bạn"
                                disabled={isSubmitting}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !rating || !comment.trim()}
                                className="mt-3 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    ) : canReview && hasReviewed ? (
                        <p className="text-sm text-green-600 italic mb-6">Bạn đã đánh giá sản phẩm này.</p>
                    ) : (
                        <p className="text-sm text-gray-500 italic mb-6">
                            Bạn cần đặt hàng trước khi đánh giá sản phẩm.
                        </p>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews
                            .filter((r) => (filterRating === 0 ? true : r.rating === filterRating))
                            .map((review) => (
                                <div key={review._id} className="bg-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold">{review.userName || 'Người dùng ẩn danh'}</p>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-sm text-gray-700">{review.comment}</p>
                                    {review.images.map((imgUrl, i) => (
                                        <img
                                            key={i}
                                            src={`http://localhost:9000${imgUrl}`}
                                            alt={`Review image ${i + 1}`}
                                            className="w-24 h-24 object-cover rounded shadow"
                                        />
                                    ))}
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(review.createdAt || review.date).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            ))}
                    </div>
                )}
            </div>
            {showModal && (
                <OptionModal
                    product={product}
                    onClose={() => setShowModal(false)}
                    onConfirm={(productWithOptions) => {
                        addToCart(productWithOptions);
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductDetail;
