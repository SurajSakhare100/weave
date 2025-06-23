import Link from 'next/link';

const Hero = () => {
  return (
    <div className="relative h-[600px] bg-cover bg-center"   style={{ backgroundImage: "url(/landing/hero.png)" }}>
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16">
        <Link href="/shop" className="bg-[#e75480] text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors">
            Shop Now
        </Link>
      </div>
    </div>
  );
};

export default Hero;