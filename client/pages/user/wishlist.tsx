import MainLayout from '@/components/layout/MainLayout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productService';
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';
import { Product } from '@/types';

export default function WishlistPage() {
  useRequireUserAuth();
  const wishlist = useSelector((state: RootState) => state.user.wishlist);
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Track whether all products are visible

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        const wishlistProducts = allProducts?.data?.filter(
          (product: Product) => wishlist.includes(product._id)
        );
        setProducts(wishlistProducts);
        setVisibleProducts(wishlistProducts.slice(0, 4)); // Show first 4 products initially
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (wishlist.length > 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [wishlist]);

  const loadMoreProducts = () => {
    setVisibleProducts(products); // Show all products
    setShowAll(true); // Set the state to show all
  };

  const loadLessProducts = () => {
    setVisibleProducts(products.slice(0, 4)); // Show only the first 4 products
    setShowAll(false); // Set the state to show only 4
  };

  if (loading) {
    return (
      <MainLayout>
        <section className="py-8 sm:py-12 lg:py-16 bg-[#faf5f2] min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-center items-center py-12 sm:py-16 lg:py-20">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-pink-500"></div>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="mt-12 sm:mt-0 py-8 sm:py-12 lg:py-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="hidden sm:block text-lg sm:text-2xl font-bold text-primary mb-6 sm:mb-8">Wishlist</h1>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
              <p className="text-base sm:text-lg text-gray-500 mb-3 sm:mb-4 text-center">No items in wishlist.</p>
              <Link
                href="/products"
                className="bg-button text-white px-4 sm:px-6 py-2 sm:py-3 rounded hover:bg-hover transition text-sm sm:text-base"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {visibleProducts.map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {visibleProducts.length < products.length && !showAll && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreProducts}
                    className="bg-button text-white px-6 py-2 rounded hover:bg-hover transition"
                  >
                    View More
                  </button>
                </div>
              )}
              {showAll && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadLessProducts}
                    className="bg-button text-white px-6 py-2 rounded hover:bg-hover transition"
                  >
                    View Less
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
