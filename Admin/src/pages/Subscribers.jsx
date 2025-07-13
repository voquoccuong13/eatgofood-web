import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import UserManagementAdmin from './UserManagementAdmin';
const Subscribers = ({ url }) => {
    const [subscribers, setSubscribers] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchSubscribers(page);
    }, [page]);

    const fetchSubscribers = async (page) => {
        try {
            const res = await axios.get(`${url}/api/promotion/subscribers`, {
                params: { page, limit },
            });
            setSubscribers(res.data.subscribers);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đăng ký', error);
        }
    };

    const handleSendCode = async (email) => {
        try {
            // Lấy danh sách mã giảm giá
            const res = await axios.get(`${url}/api/promotion-discounts`);
            const promotions = res.data;

            if (!promotions.length) {
                Swal.fire('Không có mã', 'Bạn chưa tạo mã giảm giá nào.', 'info');
                return;
            }

            // Tạo HTML cho danh sách mã
            const optionsHtml = promotions
                .map(
                    (promo) =>
                        `<option value="${promo._id}">${promo.code} - ${promo.discount}% (HSD: ${new Date(
                            promo.expiry,
                        ).toLocaleDateString('vi-VN')})</option>`,
                )
                .join('');

            // Hiện hộp chọn mã
            const { value: selectedId } = await Swal.fire({
                title: 'Chọn mã giảm giá',
                html: `
                    <select id="swal-select" class="swal2-input">
                        ${optionsHtml}
                    </select>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Gửi',
                preConfirm: () => {
                    return document.getElementById('swal-select').value;
                },
            });

            if (selectedId) {
                const selectedPromo = promotions.find((p) => p._id === selectedId);
                await axios.post(`${url}/api/promotion/send-to-email`, {
                    email,
                    code: selectedPromo.code,
                    discount: selectedPromo.discount,
                    expiry: selectedPromo.expiry,
                });
                Swal.fire('Thành công', 'Đã gửi mã đến người dùng.', 'success');
            }
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể gửi mã giảm giá.', 'error');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 w-full ml-72 pt-24">
            <UserManagementAdmin />
        </div>
    );
};

export default Subscribers;
