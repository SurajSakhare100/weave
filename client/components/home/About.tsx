import React from 'react';
import Link from 'next/link';

const About: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-[#5E3A1C]">About Weave</h2>
          <p className="text-lg text-[#8b7355] mb-8 max-w-3xl mx-auto">
            Weave is a multi-vendor e-commerce platform that connects talented artisans and vendors 
            with customers worldwide. We believe in supporting small businesses and bringing unique, 
            high-quality products to our community.
          </p>
          <Link 
            href="/about" 
            className="bg-[#cf1a53] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#b01545] transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About; 