import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SendPromotionToPotential from './SendPromotionToPotential';
const AddPromotion = ({ url }) => {
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [expiry, setExpiry] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const promotionsPerPage = 10;
    const [selectedPromoId, setSelectedPromoId] = useState(null);
    const [showSendPanel, setShowSendPanel] = useState(false);

    const fetchPromotions = async () => {
        try {
            const res = await axios.get(`${url}/api/promotion-discounts`);
            setPromotions(res.data);
        } catch (err) {
            toast.error('Lỗi khi tải danh sách mã giảm giá');
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/api/promotion-discounts`, {
                code,
                discount,
                expiry,
            });
            toast.success('Tạo mã thành công');
            setCode('');
            setDiscount('');
            setExpiry('');
            setPromotions([...promotions, res.data]);
        } catch (error) {
            toast.error('Tạo mã thất bại');
        }
    };
    const handleSendToPotential = async (promotionId) => {
        const confirmed = window.confirm('Bạn có chắc muốn gửi mã này đến khách hàng thân thiết?');
        if (!confirmed) return;
        try {
            const res = await axios.post(`${url}/api/promotion/send-to-potential-users`, {
                promotionId,
            });
            alert(res.data.message);
        } catch (error) {
            alert('Lỗi khi gửi mã.');
        }
    };

    const indexOfLastPromo = currentPage * promotionsPerPage;
    const indexOfFirstPromo = indexOfLastPromo - promotionsPerPage;
    const currentPromotions = promotions.slice(indexOfFirstPromo, indexOfLastPromo);
    const totalPages = Math.ceil(promotions.length / promotionsPerPage);

    return (
        <div className="flex gap-6 ml-64 p-6 pt-24">
            {/* Form tạo mã */}
            <div className="flex-1 max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primary">Tạo mã giảm giá</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Mã giảm giá (VD: SALE20)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="border px-3 py-2 rounded"
                    />
                    <input
                        type="number"
                        placeholder="Giảm giá (%)"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        required
                        className="border px-3 py-2 rounded"
                    />
                    <input
                        type="date"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        className="border px-3 py-2 rounded"
                    />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
                        Tạo mã
                    </button>
                </form>
            </div>

            {/* Bảng danh sách mã */}
            <div className="flex-1">
                <h2 className="text-xl font-bold mb-4 text-primary">Danh sách mã</h2>
                <div className="border rounded shadow max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm table-auto border-collapse">
                        <thead className="sticky top-0 bg-primary text-white z-10">
                            <tr>
                                <th className="border px-4 py-2 text-left">Mã</th>
                                <th className="border px-4 py-2 text-left">Giảm (%)</th>
                                <th className="border px-4 py-2 text-left">Hết hạn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPromotions.map((promo) => (
                                <tr key={promo._id} className="hover:bg-gray-50 even:bg-gray-100">
                                    <td className="border px-4 py-2 font-medium text-primary">{promo.code}</td>
                                    <td className="border px-4 py-2">{promo.discount}%</td>
                                    <td className="border px-4 py-2">
                                        {new Date(promo.expiry).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPromoId(promo._id);
                                                setShowSendPanel(true);
                                            }}
                                            className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-3 rounded text-sm"
                                        >
                                            Gửi
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promotions.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center p-4 text-gray-500 italic">
                                        Chưa có mã nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded border ${
                                    currentPage === i + 1
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-primary border-primary'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {showSendPanel && selectedPromoId && <SendPromotionToPotential promotionId={selectedPromoId} />}
        </div>
    );
};

export default AddPromotion;
