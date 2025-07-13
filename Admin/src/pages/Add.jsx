import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useProduct } from './ProductContext';

const Add = ({ url, onAddProduct }) => {
    const { fetchProducts } = useProduct();
    const categoryOptions = {
        Burger: ['Bò', 'Gà', 'Cá', 'Xúc xích'],
        Pizza: ['Hải sản', 'Thịt', 'Chay', 'Gà', 'Thập cẩm'],
        Chicken: ['Giòn', 'Sốt'],
        'Thức uống': ['Nước ngọt', 'Trà sữa', 'Cà phê', 'Sinh tố'],
        'Tráng miệng': ['Kem', 'Bánh', 'Chè', 'Trái cây'],
        Combo: [],
    };

    const [image, setImage] = useState(null);
    // State product data
    const [data, setData] = useState({
        name: '',
        priceOld: '',
        deal: '',
        description: '',
        mainCategory: 'Burger', // danh mục lớn
        category: 'Bò', // danh mục con (mặc định theo mainCategory)
        price: '',
    });
    const [options, setOptions] = useState([
        {
            name: '',
            type: 'single',
            choices: [{ label: '', price: 0 }],
        },
    ]);
    const handleOptionChange = (index, field, value) => {
        const updated = [...options];
        updated[index][field] = value;
        setOptions(updated);
    };

    const handleChoiceChange = (optIdx, choiceIdx, field, value) => {
        const updated = [...options];
        updated[optIdx].choices[choiceIdx][field] = field === 'price' ? Number(value) : value;
        setOptions(updated);
    };

    const addOption = () => {
        setOptions([...options, { name: '', type: 'single', choices: [{ label: '', price: 0 }] }]);
    };

    const addChoice = (optIdx) => {
        const updated = [...options];
        updated[optIdx].choices.push({ label: '', price: 0 });
        setOptions(updated);
    };

    const removeOption = (index) => {
        const updated = [...options];
        updated.splice(index, 1);
        setOptions(updated);
    };
    //
    const onChangeHandler = (event) => {
        const { name, value } = event.target;

        if (name === 'mainCategory') {
            // khi chọn mainCategory thì category con reset về mục đầu tiên
            setData((prev) => ({
                ...prev,
                mainCategory: value,
                category: value === 'Combo' ? '' : categoryOptions[value][0] || '',
            }));
        } else if (name === 'category') {
            setData((prev) => ({
                ...prev,
                category: value,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Please upload an image');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('mainCategory', data.mainCategory);
            formData.append('category', data.category);
            formData.append('price', Number(data.price));
            formData.append('image', image);
            formData.append('priceOld', data.priceOld);
            formData.append('deal', data.deal);
            formData.append('options', JSON.stringify(options));

            const token = localStorage.getItem('adminToken'); // hoặc tùy bạn lưu token ở đâu

            const response = await axios.post(`${url}/api/products`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setData({
                    name: '',
                    description: '',
                    mainCategory: 'Burger',
                    category: 'Bò',
                    price: '',
                });
                setImage(null);
                toast.success(response.data.message || 'Added successfully!');
                if (onAddProduct) {
                    onAddProduct(response.data.product || response.data);
                }
            } else {
                toast.error(response.data.message || 'Add failed!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error. Please try again later.');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full gap-6  mt-[50px] text-[#6d6d6d] text-[16px] max-md:px-4 ml-80 p-4 pt-24">
            {/* Phần thêm sản phẩm */}
            <div className="flex-1">
                <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                    <h2 className="text-xl font-bold mb-4 text-primary">Thêm sản phẩm</h2>
                    {/* Upload Image */}
                    <div className="w-[60%] max-md:w-full">
                        <p className="mb-1 font-medium">Upload Image</p>
                        <label htmlFor="image" className="cursor-pointer">
                            <img
                                src={image ? URL.createObjectURL(image) : assets.upload_area}
                                alt="upload"
                                className="w-full max-w-[150px] object-cover rounded"
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
                            className="w-full px-3 py-[6px] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                        />
                    </div>

                    {/* Description */}
                    <div className="w-full">
                        <p className="mb-1 font-medium">Product Description</p>
                        <textarea
                            onChange={onChangeHandler}
                            value={data.description}
                            name="description"
                            rows="4"
                            placeholder="Write content here"
                            required
                            className="w-full px-3 py-[6px] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none rounded"
                        ></textarea>
                    </div>

                    {/* Main Category, Category & Price */}
                    <div className="flex flex-row flex-wrap gap-[20px] max-md:flex-col">
                        {/* Main Category */}
                        <div className="w-[20%] min-w-[150px]">
                            <p className="mb-1 font-medium">Main Category</p>
                            <select
                                onChange={onChangeHandler}
                                name="mainCategory"
                                value={data.mainCategory}
                                className="w-full px-3 py-[6px] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                            >
                                {Object.keys(categoryOptions).map((mainCat) => (
                                    <option key={mainCat} value={mainCat}>
                                        {mainCat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category con */}
                        {data.mainCategory !== 'Combo' && (
                            <div className="w-[20%] min-w-[150px]">
                                <p className="mb-1 font-medium">Category</p>
                                <select
                                    onChange={onChangeHandler}
                                    name="category"
                                    value={data.category}
                                    className="w-full px-3 py-[6px] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                                >
                                    {(categoryOptions[data.mainCategory] || []).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Combo info */}
                        {data.mainCategory === 'Combo' && (
                            <>
                                <div className="w-[20%] min-w-[150px]">
                                    <p className="mb-1 font-medium">Giá gốc</p>
                                    <input
                                        type="number"
                                        name="priceOld"
                                        value={data.priceOld || ''}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 py-[6px] border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        placeholder="Ví dụ: 120000"
                                    />
                                </div>

                                <div className="w-[30%] min-w-[200px]">
                                    <p className="mb-1 font-medium">Khuyến mãi</p>
                                    <input
                                        type="text"
                                        name="deal"
                                        value={data.deal || ''}
                                        onChange={onChangeHandler}
                                        className="w-full px-3 py-[6px] border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        placeholder="Ví dụ: Mua 1 tặng 1, Tiết kiệm 20%"
                                    />
                                </div>
                            </>
                        )}

                        {/* Price */}
                        <div className="w-[20%] min-w-[150px]">
                            <p className="mb-1 font-medium">Product Price</p>
                            <input
                                onChange={onChangeHandler}
                                value={data.price}
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                placeholder="$20"
                                required
                                className="w-full px-3 py-[6px] border border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                            />
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="w-[14%] max-md:w-[40%]">
                        <button
                            type="submit"
                            className="w-full bg-primary text-white px-6 py-2 hover:bg-primary/90 transition rounded"
                        >
                            ADD
                        </button>
                    </div>
                </form>
            </div>

            {/* Phần tùy chọn sản phẩm */}
            <div className=" border p-4 rounded bg-gray-50">
                <h3 className="font-bold text-lg mb-4 text-primary">Tùy chọn sản phẩm</h3>
                {options.map((opt, idx) => (
                    <div key={idx} className="mb-4 border-b pb-3">
                        <input
                            type="text"
                            placeholder="Tên option (vd: Kích thước, Nước chấm)"
                            value={opt.name}
                            onChange={(e) => handleOptionChange(idx, 'name', e.target.value)}
                            className="mb-2 w-full px-3 py-1 border rounded"
                        />
                        <select
                            value={opt.type}
                            onChange={(e) => handleOptionChange(idx, 'type', e.target.value)}
                            className="mb-2 w-full px-3 py-1 border rounded"
                        >
                            <option value="single">Chọn một</option>
                            <option value="multiple">Chọn nhiều</option>
                        </select>
                        {opt.choices.map((choice, cIdx) => (
                            <div key={cIdx} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Tên lựa chọn (vd: Lớn)"
                                    value={choice.label}
                                    onChange={(e) => handleChoiceChange(idx, cIdx, 'label', e.target.value)}
                                    className="w-1/2 px-3 py-1 border rounded"
                                />
                                <input
                                    type="number"
                                    placeholder="Giá cộng thêm"
                                    value={choice.price}
                                    onChange={(e) => handleChoiceChange(idx, cIdx, 'price', e.target.value)}
                                    className="w-1/2 px-3 py-1 border rounded"
                                />
                            </div>
                        ))}
                        <button type="button" onClick={() => addChoice(idx)} className="text-sm text-blue-500">
                            + Thêm lựa chọn
                        </button>
                        <button type="button" onClick={() => removeOption(idx)} className="ml-4 text-sm text-red-500">
                            Xoá option
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addOption} className="text-green-600 text-sm">
                    + Thêm option mới
                </button>
            </div>
        </div>
    );
};

export default Add;
