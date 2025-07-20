import React from 'react';

const BrandsMarquee: React.FC = () => {
  const brands = [
    'Brand 1', 'Brand 2', 'Brand 3', 'Brand 4', 'Brand 5', 'Brand 6'
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl font-semibold text-center mb-8 text-[#5E3A1C]">
          Trusted by Leading Brands
        </h3>
        <div className="flex justify-center items-center space-x-12">
          {brands.map((brand, index) => (
            <div key={index} className="text-[#8b7355] font-medium">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsMarquee; 