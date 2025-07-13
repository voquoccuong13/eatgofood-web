import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const EditProductModal = ({ isOpen, onClose, product, apiUrl, onUpdated }) => {
    const mainCategoryOptions = {
        Burger: ['Bò', 'Gà', 'Cá', 'Xúc xích'],
        Pizza: ['Hải sản', 'Thịt', 'Chay', 'Gà', 'Thập cẩm'],
        'Gà rán': ['Giòn', 'Sốt'],
        Drink: ['Nước ngọt', 'Trà sữa', 'Cà phê', 'Sinh tố'],
        Dessert: ['Kem', 'Bánh', 'Chè', 'Trái cây', 'Nước ngọt'],
        Combo: [],
    };

    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name: '',
        description: '',
        category: 'Bò',
        mainCategory: 'Burger',
        price: '',
        priceOld: '',
        deal: '',
    });
    const [options, setOptions] = useState([
        {
            name: '',
            type: 'single',
            choices: [{ label: '', price: 0 }],
        },
    ]);

    useEffect(() => {
        if (product) {
            setData({
                name: product.name || '',
                description: product.description || '',
                mainCategory: product.mainCategory || 'Burger',
                category: product.category || mainCategoryOptions[product.mainCategory]?.[0] || '',
                price: Number(product.price) || '',
                priceOld: product.priceOld || '',
                deal: product.deal || '',
            });
            setImage(null);
            setOptions(
                product.options && Array.isArray(product.options)
                    ? product.options
                    : [
                          {
                              name: '',
                              type: 'single',
                              choices: [{ label: '', price: 0 }],
                          },
                      ],
            );
        }
    }, [product]);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        if (name === 'mainCategory') {
            setData((prev) => ({
                ...prev,
                mainCategory: value,
                category: mainCategoryOptions[value]?.[0] || '',
                originalPrice: '',
                promotion: '',
            }));
        } else {
            setData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!data.name.trim()) {
            toast.error('Tên sản phẩm không được để trống');
            return;
        }
        if (!data.price || Number(data.price) <= 0) {
            toast.error('Giá sản phẩm phải lớn hơn 0');
            return;
        }
        if (data.mainCategory === 'Combo') {
            if (!data.priceOld || Number(data.priceOld) <= 0) {
                toast.error('Giá gốc phải lớn hơn 0 cho Combo');
                return;
            }
        }
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('category', data.category);
            formData.append('mainCategory', data.mainCategory);
            formData.append('price', Number(data.price));
            if (data.mainCategory === 'Combo') {
                formData.append('priceOld', Number(data.priceOld));
                formData.append('deal', data.deal);
            }
            if (image) {
                formData.append('image', image);
            }
            formData.append('options', JSON.stringify(options));

            const token = localStorage.getItem('adminToken');

            const res = await axios.put(`${apiUrl}/api/products/${product._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                toast.success('Cập nhật thành công');
                onUpdated(res.data.product);
                onClose();
            } else {
                toast.error('Cập nhật thất bại');
            }
        } catch (err) {
            console.error(err);
            toast.error('Lỗi server');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative overflow-hidden flex flex-col"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-red-500 transition z-10"
                        >
                            &times;
                        </button>

                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-primary">🛠️ Chỉnh sửa sản phẩm</h2>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Form Section - Left Side */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                                    {/* Upload Image */}
                                    <div className="w-[20%] max-md:w-[50%]">
                                        <p className="mb-1 font-medium">Upload Image</p>
                                        <label htmlFor="image" className="cursor-pointer">
                                            <img
                                                src={
                                                    image
                                                        ? URL.createObjectURL(image)
                                                        : product?.image
                                                        ? `${apiUrl}${product.image}`
                                                        : '/placeholder-image.png'
                                                }
                                                alt="upload"
                                                className="w-full max-w-[150px] object-cover rounded border-2 border-dashed border-gray-300 hover:border-primary transition"
                                            />
                                        </label>
                                        <input
                                            onChange={(e) => setImage(e.target.files[0])}
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            hidden
                                        />
                                    </div>

                                    {/* Product Name */}
                                    <div className="w-full">
                                        <p className="mb-1 font-medium">Product Name</p>
                                        <input
                                            onChange={onChangeHandler}
                                            value={data.name}
                                            type="text"
                                            name="name"
                                            placeholder="Type here"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="w-full">
                                        <p className="mb-1 font-medium">Description</p>
                                        <textarea
                                            onChange={onChangeHandler}
                                            value={data.description}
                                            name="description"
                                            placeholder="Type here"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Main Category */}
                                        <div>
                                            <p className="mb-1 font-medium">Main Category</p>
                                            <select
                                                name="mainCategory"
                                                value={data.mainCategory}
                                                onChange={onChangeHandler}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                            >
                                                {Object.keys(mainCategoryOptions).map((mainCat) => (
                                                    <option key={mainCat} value={mainCat}>
                                                        {mainCat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Category */}
                                        {data.mainCategory !== 'Combo' && (
                                            <div>
                                                <p className="mb-1 font-medium">Category</p>
                                                <select
                                                    name="category"
                                                    value={data.category}
                                                    onChange={onChangeHandler}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                >
                                                    {(mainCategoryOptions[data.mainCategory] || []).map((cat) => (
                                                        <option key={cat} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Price Old (Combo only) */}
                                        {data.mainCategory === 'Combo' && (
                                            <div>
                                                <p className="mb-1 font-medium">PriceOld (Giá gốc)</p>
                                                <input
                                                    type="number"
                                                    name="priceOld"
                                                    value={data.priceOld}
                                                    onChange={onChangeHandler}
                                                    min={0}
                                                    required={data.mainCategory === 'Combo'}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                />
                                            </div>
                                        )}

                                        {/* Deal (Combo only) */}
                                        {data.mainCategory === 'Combo' && (
                                            <div className="md:col-span-2">
                                                <p className="mb-1 font-medium">Deal (Khuyến mãi)</p>
                                                <input
                                                    type="text"
                                                    name="deal"
                                                    value={data.deal}
                                                    onChange={onChangeHandler}
                                                    placeholder="Ví dụ: Mua 1 tặng 1, Tiết kiệm 20%"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                />
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div>
                                            <p className="mb-1 font-medium">Price (VND)</p>
                                            <input
                                                type="number"
                                                name="price"
                                                value={data.price}
                                                onChange={onChangeHandler}
                                                min={0}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium transition-all shadow-md hover:shadow-lg"
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Options Section - Right Side */}
                            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto border-l">
                                <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                    <span>⚙️</span>
                                    Tùy chọn món (Options)
                                </h3>

                                <div className="space-y-4">
                                    {options.map((option, optIndex) => (
                                        <div key={optIndex} className="bg-white p-4 rounded-lg border shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-600">
                                                    Tùy chọn #{optIndex + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                                                    onClick={() => {
                                                        const newOptions = [...options];
                                                        newOptions.splice(optIndex, 1);
                                                        setOptions(newOptions);
                                                    }}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </div>

                                            <input
                                                className="mb-3 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                placeholder="Tên tuỳ chọn (VD: Size, Topping)"
                                                value={option.name}
                                                onChange={(e) => {
                                                    const newOptions = [...options];
                                                    newOptions[optIndex].name = e.target.value;
                                                    setOptions(newOptions);
                                                }}
                                            />

                                            <select
                                                value={option.type}
                                                onChange={(e) => {
                                                    const newOptions = [...options];
                                                    newOptions[optIndex].type = e.target.value;
                                                    setOptions(newOptions);
                                                }}
                                                className="mb-3 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                                            >
                                                <option value="single">Chọn một</option>
                                                <option value="multiple">Chọn nhiều</option>
                                            </select>

                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-600 mb-2">Lựa chọn:</p>
                                                {option.choices.map((choice, choiceIndex) => (
                                                    <div key={choiceIndex} className="flex gap-2">
                                                        <input
                                                            className="flex-1 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary transition text-sm"
                                                            placeholder="Tên lựa chọn"
                                                            value={choice.label}
                                                            onChange={(e) => {
                                                                const newOptions = [...options];
                                                                newOptions[optIndex].choices[choiceIndex].label =
                                                                    e.target.value;
                                                                setOptions(newOptions);
                                                            }}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary transition text-sm"
                                                            placeholder="Giá"
                                                            value={choice.price}
                                                            onChange={(e) => {
                                                                const newOptions = [...options];
                                                                newOptions[optIndex].choices[choiceIndex].price =
                                                                    Number(e.target.value);
                                                                setOptions(newOptions);
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="text-red-500 hover:text-red-700 transition"
                                                            onClick={() => {
                                                                const newOptions = [...options];
                                                                newOptions[optIndex].choices.splice(choiceIndex, 1);
                                                                setOptions(newOptions);
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                                                onClick={() => {
                                                    const newOptions = [...options];
                                                    newOptions[optIndex].choices.push({ label: '', price: 0 });
                                                    setOptions(newOptions);
                                                }}
                                            >
                                                ➕ Thêm lựa chọn
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="mt-4 w-full py-3 text-green-600 hover:text-green-800 border-2 border-dashed border-green-300 hover:border-green-500 rounded-lg font-medium transition"
                                    onClick={() =>
                                        setOptions([
                                            ...options,
                                            { name: '', type: 'single', choices: [{ label: '', price: 0 }] },
                                        ])
                                    }
                                >
                                    ➕ Thêm tuỳ chọn mới
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditProductModal;
