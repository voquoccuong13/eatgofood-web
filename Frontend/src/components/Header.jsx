import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

// import { UserCircle } from 'lucide-react';
const Header = ({ user, setUser, setShowLogin, scrollToAboutUs }) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { logout } = useContext(StoreContext);
    const { cartItem = {} } = useContext(StoreContext); //
    const location = useLocation();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('home');
    const controls = useAnimation();
    const [showDropdown, setShowDropdown] = useState(false);
    const handleLogoClick = () => {
        if (location.pathname === '/home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/home');
        }
    };

    const { getTotalCartQuantity } = useContext(StoreContext);
    const totalItems = getTotalCartQuantity();

    useEffect(() => {
        if (totalItems > 0) {
            controls.start({
                scale: [1, 1.3, 0.95, 1.1, 1],
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.6, times: [0, 0.2, 0.5, 0.8, 1] },
            });
        }
    }, [totalItems]);

    return (
        <motion.header
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm px-4 md:px-20"
        >
            <div className="max-w-screen-xl mx-auto w-full px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <button
                    onClick={handleLogoClick}
                    className="text-3xl font-['Pacifico'] text-primary hover:text-orange-500 transition"
                >
                    Eatgo
                </button>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-6">
                    <button
                        onClick={() => {
                            handleLogoClick();
                            setActiveMenu('home');
                        }}
                        className={`font-medium transition ${
                            activeMenu === 'home' ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'
                        }`}
                    >
                        Trang Chủ
                    </button>

                    <div className="relative group">
                        <button
                            className={`font-medium flex items-center transition ${
                                activeMenu.startsWith('thucdon')
                                    ? 'text-primary font-semibold'
                                    : 'text-gray-700 hover:text-primary'
                            }`}
                        >
                            Thực đơn <i className="ri-arrow-down-s-line ml-1"></i>
                        </button>

                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-2">
                                {[
                                    {
                                        name: 'Burger',
                                        slug: 'burger',
                                        desc: 'Burger bò, gà, cá',
                                        icon: 'ri-hamburger-line',
                                    },
                                    {
                                        name: 'Pizza',
                                        slug: 'pizza',
                                        desc: 'Pizza hải sản, thịt',
                                        icon: 'ri-pie-chart-line',
                                    },
                                    {
                                        name: 'Gà rán',
                                        slug: 'ga-ran',
                                        desc: 'Gà giòn, gà sốt',
                                        icon: 'ri-chicken-line',
                                    },
                                    {
                                        name: 'Đồ uống',
                                        slug: 'do-uong',
                                        desc: 'Nước ngọt, trà sữa',
                                        icon: 'ri-cup-line',
                                    },
                                    {
                                        name: 'Tráng miệng',
                                        slug: 'trang-mieng',
                                        desc: 'Bánh ngọt, kem',
                                        icon: 'ri-cake-3-line',
                                    },
                                ].map(({ name, slug, desc, icon }) => (
                                    <NavLink
                                        key={slug}
                                        to={`/thucdon/${slug}`}
                                        onClick={() => setActiveMenu(`thucdon/${slug}`)}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded transition ${
                                                isActive || activeMenu === `thucdon/${slug}`
                                                    ? 'text-primary font-semibold bg-primary/5'
                                                    : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                                            }`
                                        }
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center mr-3">
                                            <i className={`${icon} text-primary`}></i>
                                        </div>
                                        <div>
                                            <div className="font-medium">{name}</div>
                                            <div className="text-xs text-gray-500">{desc}</div>
                                        </div>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            scrollToAboutUs();
                            setActiveMenu('about');
                        }}
                        className={`font-medium transition ${
                            activeMenu === 'about' ? 'text-primary font-semibold' : 'text-gray-700 hover:text-primary'
                        }`}
                    >
                        Về chúng tôi
                    </button>
                </nav>

                {/* gio hang */}
                <div className="flex items-center space-x-4 ">
                    {/* Giỏ hàng */}
                    <div className="relative flex-shrink-0 ">
                        <NavLink
                            to="/cart"
                            className={({ isActive }) =>
                                `text-gray-700 hover:text-primary ${isActive ? 'text-primary' : ''}`
                            }
                        >
                            <motion.div
                                animate={controls}
                                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center"
                            >
                                <i className="ri-shopping-cart-2-line ri-lg"></i>
                            </motion.div>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] md:text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </NavLink>
                    </div>

                    {/* Đăng nhập hoặc avatar */}
                    {!user ? (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-white bg-primary transition text-sm md:text-base flex-shrink-0 "
                        >
                            <i className="ri-user-line ri-lg"></i>
                            <span className="hidden md:inline ml-1">Đăng nhập</span>
                        </button>
                    ) : (
                        <div className="relative group flex-shrink-0 ">
                            <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-transparent">
                                <i className="ri-user-line ri-lg text-gray-700 group-hover:text-primary"></i>
                            </button>

                            <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-sm">
                                <Link to="/home/sidebar" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                    Trang cá nhân
                                </Link>
                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Bạn có chắc chắn muốn đăng xuất?',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Đăng xuất',
                                            cancelButtonText: 'Huỷ',
                                            customClass: {
                                                popup: 'rounded-xl p-4 text-sm',
                                                title: 'text-base font-semibold',
                                                confirmButton: 'px-4 py-2 text-sm',
                                                cancelButton: 'px-4 py-2 text-sm',
                                            },
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                logout();
                                                setUser(null);
                                                localStorage.removeItem('user');
                                                localStorage.removeItem('token');

                                                Swal.fire({
                                                    title: 'Đã đăng xuất',
                                                    icon: 'success',
                                                    timer: 1500,
                                                    showConfirmButton: false,
                                                    customClass: {
                                                        popup: 'rounded-xl p-4 text-sm',
                                                        title: 'text-base',
                                                    },
                                                });
                                            }
                                        });
                                    }}
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Menu Mobile */}
                    <button className="md:hidden flex-shrink-0 " onClick={() => setShowMobileMenu(true)}>
                        <i className="ri-menu-line ri-lg"></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[999] bg-black/40 flex justify-end md:hidden">
                    <div className="w-64 bg-white h-full shadow-lg p-6 relative animate-slideInRight flex flex-col">
                        <button
                            className="absolute top-4 right-4 text-2xl text-gray-500"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            &times;
                        </button>
                        <nav className="flex flex-col gap-6 mt-10">
                            <button
                                onClick={() => {
                                    handleLogoClick();
                                    setActiveMenu('home');
                                    setShowMobileMenu(false);
                                }}
                                className={`text-left font-medium ${
                                    activeMenu === 'home' ? 'text-primary font-semibold' : 'text-gray-700'
                                }`}
                            >
                                Trang Chủ
                            </button>
                            <button
                                onClick={() => setShowDropdown((prev) => !prev)}
                                className="text-left font-medium text-gray-700 flex justify-between items-center"
                            >
                                <span className={activeMenu?.startsWith('thucdon') ? 'text-primary font-semibold' : ''}>
                                    Thực đơn
                                </span>
                                <span className="text-sm">
                                    <i className={`ri-arrow-${showDropdown ? 'up' : 'down'}-s-line`}></i>
                                </span>
                            </button>

                            {/* Danh sách menu dropdown */}
                            {showDropdown && (
                                <div className="ml-4 mt-2 flex flex-col gap-2 ">
                                    {['burger', 'pizza', 'ga-ran', 'do-uong', 'trang-mieng'].map((item) => (
                                        <NavLink
                                            key={item}
                                            to={`/thucdon/${item}`}
                                            className={({ isActive }) =>
                                                `text-left font-medium no-underline ${
                                                    isActive ? 'text-primary font-semibold' : 'text-gray-700'
                                                }`
                                            }
                                        >
                                            {item.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    scrollToAboutUs();
                                    setActiveMenu('about');
                                    setShowMobileMenu(false);
                                }}
                                className={`text-left font-medium ${
                                    activeMenu === 'about' ? 'text-primary font-semibold' : 'text-gray-700'
                                }`}
                            >
                                Về chúng tôi
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </motion.header>
    );
};

export default Header;
