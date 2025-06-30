import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';
import { searchProducts } from '@/services/productService';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const res = await searchProducts({ q: query });
      setResults(res.data || []);
      setSearched(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Search failed.');
      toast.error(error?.response?.data?.message || 'Search failed.');
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen text-black">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Search Products</h1>
          <form onSubmit={handleSearch} className="flex items-center mb-8 max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-6 py-2 rounded-r hover:bg-pink-600 transition font-semibold"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

          {searched && !loading && results.length === 0 && !error && (
            <div className="text-center text-gray-500">No products found.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {results.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
} 