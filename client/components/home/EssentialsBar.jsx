import React from 'react';

const items = [
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
  { label: 'Tropical Essentials', icon: './landing/image-3.png' },
];

const CategoryScroller = () => {
  return (
    <div className="overflow-hidden bg-[#5E3A1C] py-2">
      <div className="whitespace-nowrap animate-scroll-left">
        {items.concat(items).map((item, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 mx-6 text-white text-base font-medium"
          >
            <img src={item.icon} alt="icon" className="w-8 h-8" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryScroller;
