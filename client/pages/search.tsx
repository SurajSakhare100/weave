import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import ProductCard from '@/components/products/ProductCard';
import MainLayout from '@/components/layout/MainLayout';
import { searchProducts } from '@/services/productService';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Search, X, TrendingUp } from 'lucide-react';

// Mock data for search suggestions and trending searches
const searchSuggestions = [
  'Tote',
  'Rainbow',
  'Black',
  'Green',
  'Yellow',
  'Bag',
  'Eco',
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
      const res = await searchProducts({ q: searchQuery });
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
      <section className="py-8  min-h-screen text-primary bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Bar Section */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto" ref={searchRef}>
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        index === selectedSuggestionIndex 
                          ? 'bg-pink-50 text-pink-700' 
                          : 'hover:bg-gray-50'
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Searches */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(trend)}
                    className="px-4 py-2 border border-primary text-primary text-sm rounded-full hover:bg-[#6B5B3F] transition-colors font-medium"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searched && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Search Results ({results.length})
              </h2>

              {error && (
                <div className="mb-4 text-red-600 text-center bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {!loading && results.length === 0 && !error && (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-gray-400">Try adjusting your search terms or browse our categories</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  <p className="mt-2 text-gray-600">Searching...</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {results.slice(0, 4).map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  
                  {results.length > 4 && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Show all results - you can implement pagination here
                          toast.info('Showing all results');
                        }}
                        className="bg-[#EE346C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D62A5A] transition-colors"
                      >
                        View all results
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Initial State - Show some featured products */}
          {!searched && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2">Start your search</h3>
              <p className="text-gray-400 mb-8">Search for products, categories, or brands</p>
              
              {/* Show trending searches more prominently */}
              <div className="max-w-md mx-auto">
                <h4 className="text-lg font-medium mb-4">Popular searches</h4>
                <div className="flex flex-wrap gap-3 justify-center">
                  {trendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingClick(trend)}
                      className="px-4 py-2 bg-[#8B7355] text-white text-sm rounded-full hover:bg-[#6B5B3F] transition-colors font-medium"
                    >
                      {trend}
                  </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
} 