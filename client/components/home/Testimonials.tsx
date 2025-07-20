import React from 'react';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Customer",
      content: "Amazing quality products and excellent customer service. Highly recommended!",
      rating: 5
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Customer",
      content: "Found unique items that I couldn't find anywhere else. Great platform!",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Customer",
      content: "Fast shipping and beautiful packaging. Will definitely shop again!",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-[#f5e7df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#5E3A1C]">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 