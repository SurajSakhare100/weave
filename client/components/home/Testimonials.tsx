import React from 'react';
import {  ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'User Name',
    image: '/landing/testimonial_1.png', // Use absolute path for Next.js public folder
    rating: 5,
    text: `Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
      when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
  },
  {
    name: 'User Name',
    image: '/landing/testimonial.png',
    rating: 5,
    text: `Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
      when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-16 py-16  flex flex-col gap-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-primary text-2xl md:text-3xl font-semibold tracking-wide">
          Testimonials
        </h2>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex justify-center items-center rounded-lg  border-2 border-border hover:bg-muted transition">
            <ChevronLeft className='w-6 h-6 text-primary' />
          </button>
          <button className="w-10 h-10 flex justify-center items-center rounded-lg border-2 border-border hover:bg-muted transition">
            <ChevronRight className='w-6 h-6 text-primary' />
          </button>
        </div>
      </div>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row gap-6 items-start bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
          >
            <img
              src={t.image}
              alt={`Photo of ${t.name}`}
              className="w-full md:w-64 h-64 md:h-80 object-cover rounded-lg"
              loading="lazy"
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-primary text-xl font-semibold">{t.name}</h3>
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-secondary text-base leading-relaxed">{t.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
