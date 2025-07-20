import React from 'react';
import Link from 'next/link';

const NewArrivals: React.FC = () => {
  return (
    <section className="py-16 bg-[#f5e7df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-8 text-[#5E3A1C]">New Arrivals</h2>
        <p className="text-lg text-[#8b7355] mb-8">
          Check out our latest products from talented vendors
        </p>
        <Link 
          href="/products?sort=-createdAt" 
          className="bg-[#cf1a53] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b01545] transition-colors"
        >
          View New Arrivals
        </Link>
      </div>
    </section>
  );
};

export default NewArrivals; 