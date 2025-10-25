import React, { useEffect, useState } from 'react';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/index';
import ProductCard from '@/components/products/ProductCard';
import FullPageLoader from '@/components/ui/FullPageLoader';

const Bestsellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await getProducts({ limit: 4 });
        if (res.success) setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch bestsellers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  if (loading) return <FullPageLoader text="Loading bestsellers..." />;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-primary text-2xl md:text-3xl font-semibold leading-snug tracking-wide">
            Bestsellers
          </h2>
          <div className="text-secondary font-medium underline cursor-pointer hover:text-primary transition-colors">
            View all
          </div>
        </div>

        {/* Product Cards: Horizontal scroll on mobile, grid on desktop */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 scrollbar-hide">
            {products.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-72 sm:w-auto">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
