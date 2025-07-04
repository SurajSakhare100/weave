import Image from 'next/image';
import Link from 'next/link';

const About = () => {
  return (
    <section className="bg-white py-16">
      <div className=" mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="bg-gray-100  md:h-full w-full rounded-lg">
          {/* This is the gray placeholder block */}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About Us</h2>
          <p className="text-gray-600 mb-6 text-base leading-6">
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown since an printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
          <button className="bg-[#e75480] text-white font-semibold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors text-base">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default About; 