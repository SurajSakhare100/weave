import Image from 'next/image';
import { Star } from 'lucide-react';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white p-6 rounded-lg flex items-center space-x-8">
      <div className="flex-shrink-0">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={200}
          height={250}
          className="object-cover rounded-lg"
        />
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-800">{testimonial.name}</h3>
        <div className="flex my-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-gray-600 text-sm leading-6">{testimonial.text}</p>
      </div>
    </div>
  );
};

export default TestimonialCard; 