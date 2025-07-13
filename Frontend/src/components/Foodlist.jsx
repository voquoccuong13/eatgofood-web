import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menu_list } from '../assets/assets';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
const Foodlist = ({ category, setCategory, refProp }) => {
    const navigate = useNavigate();
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            disable: false, // <== Cho phép chạy ở mobile
        });
    }, []);
    // Hàm chuyển trang dựa vào menu_name, map menu_name sang path route
    const handleClick = (menu_name) => {
        setCategory((prev) => (prev === menu_name ? 'All' : menu_name));

        // map menu_name sang path tương ứng
        let path = '/thucdon'; // mặc định
        switch (menu_name.toLowerCase()) {
            case 'burger':
                path = '/thucdon/burger';
                break;
            case 'pizza':
                path = '/thucdon/pizza';
                break;
            case 'gà rán':
            case 'ga ran': // xử lý không dấu
                path = '/thucdon/ga-ran';
                break;
            case 'đồ uống':
            case 'do uong':
                path = '/thucdon/do-uong';
                break;
            case 'tráng miệng':
            case 'trang mieng':
                path = '/thucdon/trang-mieng';
                break;
            default:
                path = '/thucdon';
                break;
        }

        navigate(path);
    };

    return (
        <section className="py-12 bg-white rounded-xl pt-24" ref={refProp}>
            <div className="max-w-[1400px] mx-auto px-[20px]">
                <h2 className="text-3xl font-bold text-center mb-8">Danh mục món ăn</h2>

                <div className="overflow-x-auto md:overflow-x-visible">
                    <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-max md:w-full px-1">
                        {menu_list.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === menu_list.length - 1;

                            return (
                                <motion.div
                                    onClick={() => handleClick(item.menu_name)}
                                    key={item.menu_name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    className={`cursor-pointer ${isFirst ? 'ml-[10px]' : ''} ${
                                        isLast ? 'mr-[10px]' : ''
                                    }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                            <img
                                                className={`w-full h-full object-cover transition-transform duration-200 ${
                                                    category === item.menu_name
                                                        ? 'scale-90 border-2 border-primary rounded-full'
                                                        : ''
                                                }`}
                                                src={item.menu_image}
                                                alt={item.menu_name}
                                            />
                                        </div>
                                        <h3 className="font-medium text-sm">{item.menu_name}</h3>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Foodlist;
