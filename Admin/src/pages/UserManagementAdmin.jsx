import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const UserManagementAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('adminToken');

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:9000/api/users/admin/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Lỗi lấy danh sách người dùng:', err);
            Swal.fire('Lỗi', 'Không thể tải danh sách người dùng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        const confirm = await Swal.fire({
            title: 'Bạn chắc chắn muốn xoá?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ',
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`http://localhost:9000/api/users/admin/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(users.filter((u) => u._id !== userId));
                Swal.fire('Đã xoá!', 'Người dùng đã bị xoá', 'success');
            } catch (err) {
                console.error('Lỗi xoá người dùng:', err);
                Swal.fire('Lỗi', 'Không thể xoá người dùng', 'error');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    // Hàm gửi lại email xác minh
    const handleResendVerification = async (email) => {
        try {
            const res = await axios.post(
                'http://localhost:9000/api/users/resend-verification',
                { email },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            Swal.fire('Thành công', res.data.message, 'success');
        } catch (error) {
            console.error('Lỗi gửi lại email xác minh:', error);
            Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi lại email xác minh', 'error');
        }
    };

    if (loading) return <p className="text-center mt-8">Đang tải danh sách người dùng...</p>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary">Quản lý người dùng</h2>
            {users.length === 0 ? (
                <p>Không có người dùng nào.</p>
            ) : (
                <div className="grid gap-4">
                    {users.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 border rounded shadow">
                            <div className="flex-1">
                                <p>
                                    <strong>Tên:</strong> {user.name}
                                </p>
                                <p>
                                    <strong>Email:</strong> {user.email}
                                </p>
                                <p>
                                    <strong>Role:</strong> {user.role}
                                </p>
                                <p>
                                    <strong>Xác minh:</strong>{' '}
                                    {user.isVerified ? (
                                        '✅ Đã xác minh'
                                    ) : (
                                        <>
                                            ❌ Chưa xác minh{' '}
                                            <button
                                                onClick={() => handleResendVerification(user.email)}
                                                className="ml-2 text-blue-600 underline hover:text-blue-800 text-sm"
                                            >
                                                Gửi lại
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={() => deleteUser(user._id)}
                            >
                                Xoá
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserManagementAdmin;
