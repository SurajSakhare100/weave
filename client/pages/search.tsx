import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '@/components/products/ProductCard';
import MainLayout from '@/components/layout/MainLayout';
import { getProducts } from '@/services/productService';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Search, X, TrendingUp } from 'lucide-react';

// Mock data for search suggestions and trending searches
const searchSuggestions = [
  'Tote',
  'Black',
  'Green',
  'Yellow',
  'Bag',
  'Classic'
];

const trendingSearches = [
  'Rainbow Tote',
  'Black Tote', 
  'Eco Green',
  'Yellow Bag'
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const initialQueryProcessed = useRef(false);

  // Get initial query from URL
  useEffect(() => {
    const { q } = router.query;
    if (q && typeof q === 'string' && !initialQueryProcessed.current) {
      setQuery(q);
      handleSearch(q);
      initialQueryProcessed.current = true;
    }
  }, [router.query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [query]);

  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    setSearched(false);
    setShowSuggestions(false);
    
    try {
      const res = await getProducts({ search: searchQuery });
      setResults(res.data || []);
      setSearched(true);
      
      // Update URL with search query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, undefined, { shallow: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || 'Search failed.');
      toast.error(error?.response?.data?.message || 'Search failed.');
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [query, router]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const handleTrendingClick = useCallback((trend: string) => {
    setQuery(trend);
    handleSearch(trend);
  }, [handleSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setShowSuggestions(false);
    router.push('/search', undefined, { shallow: true });
  }, [router]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestionIndex, handleSuggestionClick, handleSearch]);

  return (
    <MainLayout>
      <section className="py-4 sm:py-8 min-h-screen text-primary bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar Section */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-2xl mx-auto" ref={searchRef}>
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for products..."
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg border border-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-secondary hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </form>

            </div>

            {/* Search Categories */}
            <div className="mt-4 px-20 flex flex-wrap gap-4 justify-center">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-6 py-2 bg-white border border-[#E7D9CC] text-[#5E3A1C] rounded-full hover:bg-[#E7D9CC] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {searched && (
            <div className="mb-6 sm:mb-8 mx-auto ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-medium text-primary">
                  Search Results ({results.length})
                </h2>
                {/* {results.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <span>Sort by:</span>
                    <select 
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      onChange={(e) => {
                        // Add sorting logic here
                        console.log('Sort by:', e.target.value);
                      }}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                )} */}
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-center bg-red-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                  {error}
                </div>
              )}

              {!loading && results.length === 0 && !error && (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2">No products found</h3>
                  <p className="text-secondary text-sm sm:text-base mb-4">Try adjusting your search terms or browse our categories</p>
                  <button
                    onClick={() => setQuery('')}
                    className="bg-[#EE346C] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-[#D62A5A] transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-pink-500"></div>
                  <p className="mt-2 text-gray-600 text-sm sm:text-base">Searching...</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {results.slice(0, 8).map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  
                  {results.length > 0 && (
                    <div className="text-center ">
                      <button
                        onClick={() => {
                         router.push(`/products?search=${query}`)
                        }}
                        className="bg-[#EE346C] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#D62A5A] transition-colors text-sm sm:text-base"
                      >
                        View all {results.length} results
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Initial State - Show trending products */}
          {!searched && !loading && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-medium text-[#5E3A1C] mb-8">Trending</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingSearches.map((trend, index) => (
                  <div key={index} className="cursor-pointer" onClick={() => handleTrendingClick(trend)}>
                    <div className="aspect-square bg-[#F9F6F3] rounded-lg mb-4"></div>
                    <h3 className="text-[#5E3A1C] font-medium">{trend}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
} 