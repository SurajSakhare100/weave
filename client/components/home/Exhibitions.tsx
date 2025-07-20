import React from 'react';
import Link from 'next/link';

const Exhibitions: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-[#5E3A1C]">Featured Exhibitions</h2>
          <p className="text-lg text-[#8b7355] mb-8">
            Discover curated collections from our featured vendors
          </p>
          <Link 
            href="/products" 
            className="bg-[#cf1a53] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b01545] transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Exhibitions; 