import { Diamond } from 'lucide-react';

const BrandItem = () => (
  <div className="flex items-center mx-8">
    <Diamond className="h-5 w-5 mr-2" />
    <span className="font-semibold tracking-wider">logoipsum</span>
  </div>
);

const BrandsMarquee = () => {
  return (
    <section className="bg-[#6b4f4f] text-white py-4">
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap">
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          {/* Duplicate for seamless scroll */}
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
          <BrandItem />
        </div>
      </div>
    </section>
  );
};

export default BrandsMarquee; 