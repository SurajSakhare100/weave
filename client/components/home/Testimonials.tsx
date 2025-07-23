import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'User Name',
    image: './landing/testimonial_1.png',
    rating: 5,
    text: `Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
      when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
  },
  {
    name: 'User Name',
    image: './landing/testimonial.png',
    rating: 5,
    text: `Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
      when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12 flex flex-col gap-10">
      {/* Header with arrows */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-primary tracking-wide">
          Testimonials
        </h2>
        <div className="flex items-center gap-2">
          <button className="w-9 h-10 px-2 py-1.5 rounded-lg border border-text-tertiary flex justify-center items-center">
            <div className="w-2 h-3 bg-text-secondary" />
          </button>
          <button className="w-9 h-10 px-2 py-1.5 rotate-180 rounded-lg border border-text-tertiary flex justify-center items-center">
            <div className="w-2 h-3 bg-text-secondary" />
          </button>
        </div>
      </div>

      {/* Testimonials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="flex gap-6 items-start">
            <img
              src={t.image}
              alt={t.name}
              className="w-64 h-80 object-cover rounded-md"
            />
            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <h3 className="text-xl font-semibold text-primary">
                  {t.name}
                </h3>
                <div className="text-yellow-400 text-lg">
                  {'★'.repeat(t.rating)}
                </div>
              </div>
              <p className="text-secondary text-base leading-relaxed">
                {t.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
