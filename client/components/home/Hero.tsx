import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-[#f5e7df] to-[#e5d6c3] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[#5E3A1C] mb-6">
            Welcome to Weave
          </h1>
          <p className="text-xl text-[#8b7355] mb-8 max-w-2xl mx-auto">
            Discover unique products from talented vendors around the world
          </p>
          <Link 
            href="/products" 
            className="bg-[#cf1a53] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#b01545] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero; 