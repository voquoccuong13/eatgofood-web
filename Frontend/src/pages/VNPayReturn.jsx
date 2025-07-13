import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VNPayReturn = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(queryParams.entries());

        if (!params.vnp_ResponseCode || !params.vnp_ExtraData) {
            navigate('/order-failed');
            return;
        }

        axios
            .post('/api/vnpay/confirm', params)
            .then((res) => {
                const data = res.data;
                if (data?.order?.orderCode) {
                    navigate(`/order/${data.order.orderCode}`);
                } else {
                    navigate('/order-failed');
                }
            })
            .catch((err) => {
                console.error('❌ Xác nhận thanh toán thất bại:', err);
                navigate('/order-failed');
            });
    }, []);

    return (
        <div className="p-4 text-center">
            <p className="text-lg font-semibold">Đang xác nhận thanh toán từ VNPay...</p>
        </div>
    );
};

export default VNPayReturn;
