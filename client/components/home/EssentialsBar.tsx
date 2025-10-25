import React from 'react';

const items = Array(10).fill({
  label: 'Tropical Essentials',
  icon: '/landing/footer.png', 
});

const CategoryScroller: React.FC = () => {
  return (
    <div className="bg-primary py-3 overflow-hidden">
      <div className="flex animate-scroll-left whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mx-6 text-white text-base font-medium min-w-max"
          >
            <img 
              src={item.icon} 
              alt={`${item.label} icon`} 
              className="w-8 h-8 object-contain" 
              loading="lazy" 
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryScroller;
