import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditProductModal from './EditProductModal';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const List = ({ url }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    const [editingProduct, setEditingProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${url}/api/products`);
                setProducts(res.data);
            } catch (err) {
                console.error('Lỗi khi gọi API:', err);
                toast.error('Lỗi khi gọi API');
                setError('Lỗi khi gọi API');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [url]);

    const handleDelete = useCallback(
        async (id) => {
            const result = await Swal.fire({
                title: 'Xóa món này?',
                text: 'Bạn có chắc muốn xóa món ăn này?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                width: 300,
            });

            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('adminToken'); // hoặc 'token', tùy bạn lưu
                    const res = await axios.delete(`${url}/api/products/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (res.data.success) {
                        setProducts((prev) => prev.filter((item) => item._id !== id));
                        Swal.fire({
                            title: 'Đã xóa!',
                            text: 'Món ăn đã được xóa.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            width: 300,
                        });
                    } else {
                        Swal.fire({ title: 'Lỗi!', text: 'Xóa món thất bại.', icon: 'error', timer: 2000 });
                    }
                } catch (err) {
                    console.error('Lỗi khi xóa món ăn:', err);
                    const msg = err.response?.data?.message || 'Không thể xóa món ăn.';
                    Swal.fire({ title: 'Lỗi server!', text: msg, icon: 'error', timer: 2000 });
                }
            }
        },
        [url],
    );

    const handleEdit = (item) => {
        setEditingProduct(item);
        setModalOpen(true);
    };

    const handleUpdateProduct = (updatedProduct) => {
        setProducts((prev) => prev.map((item) => (item._id === updatedProduct._id ? updatedProduct : item)));
    };

    const filteredList = useMemo(() => {
        if (!searchKeyword.trim()) return products;
        return products.filter((item) => item.name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }, [products, searchKeyword]);

    const grouped = useMemo(() => {
        return filteredList.reduce((groups, item) => {
            const group = groups[item.mainCategory] || [];
            group.push(item);
            groups[item.mainCategory] = group;
            return groups;
        }, {});
    }, [filteredList]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-[90%] mx-auto mt-10 px-5 ml-72 p-4 pt-24"
        >
            <h2 className="text-2xl font-extrabold mb-6 text-primary border-b-4 border-primary pb-2">
                Danh sách món ăn
            </h2>

            <div className="mb-6 flex justify-end">
                <input
                    type="text"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {loading && (
                <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && <p className="text-red-500">{error}</p>}
            {!loading && products.length === 0 && (
                <p className="text-center text-gray-500 italic mt-6">Không có món ăn nào.</p>
            )}

            {!loading &&
                Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="mb-10">
                        <h3 className="text-xl font-semibold mb-3">{category}</h3>
                        <div className="overflow-x-auto border">
                            <table className="min-w-full table-auto border-collapse">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <th className="py-3 px-6 border">Hình ảnh</th>
                                        <th className="py-3 px-6 border">Tên món</th>
                                        <th className="py-3 px-6 border">Danh mục</th>
                                        <th className="py-3 px-6 border">Giá</th>
                                        <th className="py-3 px-6 border">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-primary/10 transition-colors duration-200"
                                        >
                                            <td className="py-3 px-6 border">
                                                <img
                                                    src={item.image || '/default-image.png'}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            </td>
                                            <td className="py-3 px-6 border font-medium">{item.name}</td>
                                            <td className="py-3 px-6 border">{item.category}</td>
                                            <td className="py-3 px-6 border">
                                                <div>
                                                    <span className="text-red-600 font-semibold">
                                                        {Number(item.price).toLocaleString()}₫
                                                    </span>
                                                    {item.mainCategory === 'Combo' && item.priceOld && (
                                                        <span className="ml-3 text-gray-500 line-through text-sm">
                                                            {Number(item.priceOld).toLocaleString()}₫
                                                        </span>
                                                    )}
                                                </div>
                                                {item.mainCategory === 'Combo' && item.promotion && (
                                                    <div className="text-green-600 text-sm italic mt-1">
                                                        {item.promotion}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-6 border whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:underline mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

            {modalOpen && editingProduct && (
                <EditProductModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    product={editingProduct}
                    apiUrl={url}
                    onUpdated={handleUpdateProduct}
                />
            )}
        </motion.div>
    );
};

export default List;
