import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { useProduct } from "./ProductContext";

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children, url }) => {
    const [products, setProducts] = useState([]);

    // Hàm lấy danh sách sản phẩm từ server
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${url}/api/products`);
            console.log('API response:', res.data);

            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else if (res.data.success) {
                setProducts(res.data.products);
            } else {
                toast.error(res.data.message || 'Lỗi khi fetch sản phẩm');
            }
        } catch (error) {
            toast.error('Không thể tải sản phẩm. Vui lòng kiểm tra API.');
            console.error('Fetch products error:', error);
        }
    };

    // Gọi fetchProducts khi component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Hàm thêm sản phẩm mới vào danh sách cục bộ
    const addProduct = (product) => {
        setProducts((prev) => [...prev, product]);
    };

    return (
        <ProductContext.Provider
            value={{
                url,
                products,
                fetchProducts,
                addProduct,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};
