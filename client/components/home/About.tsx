import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 py-10 flex justify-center">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-start gap-12">
        {/* Left Image */}
        <div className="w-full lg:w-1/2">
          <div className="w-full h-80 sm:h-[400px] bg-zinc-100 rounded-md"></div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
          <h2 className="text-2xl font-medium tracking-wide text-primary">
            About Us
          </h2>
          <p className="text-base leading-tight text-secondary font-normal">
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            It has survived not only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
            sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
            like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
          <button className="w-max text-white bg-[#EE346C] px-6 py-3 bg-tags text-surface-default-1 text-base font-semibold rounded">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
