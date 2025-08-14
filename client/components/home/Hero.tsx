import React from 'react';
import Link from 'next/link';
import CategoryScroller from './EssentialsBar';

const Hero: React.FC = () => {
  return (
    <section className="hero-section relative h-screen flex flex-col justify-between items-center text-white">
      
      {/* Top content (can include headings if needed later) */}
      <div className="flex-1 flex items-end pb-8 justify-center w-full">
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <Link 
            href="/products" 
            className="bg-[#cf1a53] text-white px-8 py-3 mt-15 rounded-lg text-lg font-semibold hover:bg-[#b01545] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Category scroller at the very bottom */}
      <div className="w-full">
        <CategoryScroller />
      </div>
    </section>
  );
};

export default Hero;
