import React from 'react';
import Link from 'next/link';
import CategoryScroller from './EssentialsBar';

const Hero: React.FC = () => {
  return (
    <section className="hero-section relative h-screen flex flex-col justify-between items-center text-white">
      
      {/* Top content */}
      <div className="flex-1 flex items-end pb-8 md:pb-12 justify-center w-full">
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <Link 
            href="/products" 
            className="bg-button px-8 py-3 mt-15 rounded-sm text-lg font-semibold hover:opacity-90 transition-all"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Category scroller at the bottom */}
      <div className="w-full">
        <CategoryScroller />
      </div>
    </section>
  );
};

export default Hero;
