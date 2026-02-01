import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { PromotionCarousel } from '@/components/home/PromotionCarousel';
import CombosSection from '@/components/CombosSection';
import LocationContact from '@/components/LocationContact';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B]">
      <Header />
      
      <main className="flex-grow w-full">
        <Hero />
        <PromotionCarousel />
        <CombosSection />
        <div id="contato">
          <LocationContact />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
