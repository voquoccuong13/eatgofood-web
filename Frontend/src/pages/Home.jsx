import React, { useState, useRef } from 'react';
import Foodlist from '../components/Foodlist';
import FoodDisplay from '../components/FoodDisplay';
import Hero from '../components/Hero';
import Search from '../components/Search';
import Aboutus from '../components/Aboutus';
import PthucThanhToan from '../components/PthucThanhToan';
import Offer from '../components/Offer';
import Derlivery from '../components/Derlivery';
import AppDownloadSection from '../components/AppDownloadSection ';
import NewFoodDisplay from '../components/NewFoodDisplay';
// import ChatBox from '../components/ChatBox';
const Home = ({ aboutRef }) => {
    const [category, setCategory] = useState('All');
    const foodRef = useRef(null);

    const scrollToFoodList = () => {
        foodRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="pt-20">
            <Hero onOrderNowClick={scrollToFoodList} />
            <Search />
            <FoodDisplay category="Top" />
            <NewFoodDisplay />
            <Offer />
            <Derlivery />
            <PthucThanhToan />
            <AppDownloadSection />
            <div ref={aboutRef}>
                <Aboutus />
            </div>
        </div>
    );
};

export default Home;
