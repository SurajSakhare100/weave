import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '../services/productService';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// Product interface
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  discount: number;
  vendorId: string;
  vendor: boolean;
  available: string;
  category: string;
  categorySlug?: string;
  srtDescription?: string;
  description?: string;
  seoDescription?: string;
  seoKeyword?: string;
  seoTitle?: string;
  pickup_location?: string;
  return: boolean;
  cancellation: boolean;
  uni_id_1?: string;
  uni_id_2?: string;
  files: string[];
  variant: boolean;
  variantDetails: Array<{
    size: string;
    price: number;
    mrp: number;
    stock: number;
  }>;
  currVariantSize?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProducts();
      const productsData = response.data || [];
      setProducts(productsData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="py-16 bg-[#faf5f2] min-h-screen">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-16 bg-[#faf5f2] min-h-screen">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Products</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={loadProducts}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">All Products</h1>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
} 