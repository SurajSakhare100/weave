import React from 'react';
import Link from 'next/link';

const NewArrivals: React.FC = () => {
  return (
    <section className=" w-full overflow-hidden px-4 py-8 md:py-16 md:px-8" 
           >
      <div className='relative h-[80vh]'>
        <img
        src="/landing/newArrival.png"
        alt="New Arrivals Background"
        className=" w-full h-full object-cover"
      />

      <div className="absolute bottom-0 w-full h-fit mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col justify-center  bg-black/10 backdrop-blur-[30px]">
        <div className="flex flex-col gap-2 md:gap-4">
          <h2 className="text-surface text-2xl md:text-5xl font-semibold tracking-wide">
            New Arrivals
          </h2>
          <Link
            href="/collections"
            className="text-accent font-medium text-md md:text-2xl underline  transition-colors"
          >
            View collections
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
};

export default NewArrivals;
