import React, { useEffect, useState } from 'react';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/index';
import ProductCard from '@/components/products/ProductCard';
import { Loader2 } from 'lucide-react';

const Bestsellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await getProducts({ sort: '-totalReviews', limit: '8' });
        if (res.success) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch bestsellers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  if (loading) {
    return (
      <section className="py-16 " style={{ backgroundColor: '#F9F9F9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#5E3A1C]">Bestsellers</h2>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 " style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="w-full flex justify-between items-center mb-12">
        <div className="text-primary text-2xl font-medium leading-7 tracking-wide">
          Bestsellers
        </div>
        <div className="text-text-secondary text-base font-medium underline leading-tight cursor-pointer">
          View all
        </div>
      </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers; 