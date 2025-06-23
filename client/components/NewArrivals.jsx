import Link from 'next/link';

const NewArrivals = () => {
  return (
    <section className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: "url('/landing/newArrival.png')" }}>
      <div className="relative z-10 flex flex-col items-start justify-center h-full container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white">New Arrivals</h2>
        <p className="text-white mt-2">Check out our latest collection</p>
        <Link href="/shop/new-arrivals"className="mt-6 border border-white text-white px-8 py-3 rounded-md hover:bg-white hover:text-black transition-colors">
            View Collection
        </Link>
      </div>
    </section>
  );
};

export default NewArrivals; 