import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@/types/index';
import { Loader2, AlertCircle } from 'lucide-react';

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        category: '',
        availability: '',
        size: '',
        colors: '',
        minPrice: '',
        maxPrice: '',
        sort: '-createdAt'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const query = { ...router.query };
        
        // sync filters state with url query params
        setFilters(prev => ({
            ...prev,
            ...query
        }));

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getProducts(query);
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (error) {
                setError('Failed to fetch products');
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [router.query]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);

        const query = { ...newFilters };
        // Remove empty filters
        Object.keys(query).forEach(key => {
            const filterKey = key as keyof typeof query;
            if (query[filterKey] === '' || query[filterKey] === null) {
                delete query[filterKey];
            }
        });

        router.push({
            pathname: '/products',
            query,
        }, undefined, { shallow: true });
    };

    return (
        <Layout>
            <div className=" mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Products</h1>
                <div className="flex">
                    {/* Filters Sidebar */}
                    <aside className="w-1/4 pr-8">
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Product Category</label>
                                <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="">All</option>
                                    {categories.map((cat: any) => <option key={cat._id} value={cat.slug}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                                <select name="availability" id="availability" value={filters.availability} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="">All</option>
                                    <option value="true">In Stock</option>
                                    <option value="false">Out of Stock</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                                <input type="text" name="size" id="size" value={filters.size} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" placeholder="e.g. M, L, XL" />
                            </div>
                            <div>
                                <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Color</label>
                                <input type="text" name="colors" id="colors" value={filters.colors} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" placeholder="e.g. Red, Blue" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <div className="flex items-center space-x-2">
                                    <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" placeholder="Min"/>
                                    <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" placeholder="Max" />
                                </div>
                            </div>
                        </div>
                    </aside>
                    {/* Products Grid */}
                    <main className="w-3/4">
                        <div className="flex justify-end mb-4">
                            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="block w-52 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="-createdAt">Newest</option>
                                <option value="createdAt">Oldest</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="discount">Discount</option>
                            </select>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-96">
                                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                            </div>
                        ) : error ? (
                             <div className="flex flex-col justify-center items-center h-96">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                                <p className="mt-4 text-red-500">{error}</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {products.map((product: Product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-96">
                                <p>No products found.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default ProductsPage; 