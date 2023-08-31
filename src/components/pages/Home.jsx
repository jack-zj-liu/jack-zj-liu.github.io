import React from 'react';
import '../../App.css';
import HeroSection from '../HeroSection';
import Cards from '../Cards';
import Navbar from '../Navbar';
import Footer from '../Footer';

function Home () {
    return (
        <>
            <Navbar />
            <HeroSection />
            <Cards />
            <Footer />
        </>
    );
}

export default Home;