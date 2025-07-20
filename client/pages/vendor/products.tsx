import VendorLayout from '@/components/Vendor/VendorLayout';
import { useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setProducts, setLoading, setError } from '../../features/vendor/vendorSlice';
import { getVendorProducts } from '../../services/vendorService';
import { isVendorAuthenticated } from '../../utils/vendorAuth';
import { AddProductModal, EditProductModal, DeleteProductModal } from '../../components/Vendor/ProductModals';
import { Product } from '@/types/index';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle,
  Filter,
  Grid,
  List
} from 'lucide-react';
import Image from 'next/image';
import { deleteProduct } from '@/services/productService';

export default function VendorProductsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state: RootState) => state.vendor);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  
  useEffect(() => {
    // Check authentication
    if (!isVendorAuthenticated()) {
      router.push('/vendor/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const loadProducts = useCallback(async (page = 1) => {
    try {
      dispatch(setLoading(true));
      const params: { page: number, limit: number, search?: string, status?: string } = {
        page,
        limit: 20,
      };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await getVendorProducts(params);
      
      // Transform the backend response to match frontend expectations
      const transformedData = {
        items: response.data || [],
        page: response.pagination?.page || 1,
        pages: response.pagination?.pages || 1,
        total: response.pagination?.total || 0,
        limit: response.pagination?.limit || 20
      };
      
      dispatch(setProducts(transformedData));
    } catch (error: unknown) {
      type VendorProductsError = { response?: { data?: { message?: string } } };
      const err: VendorProductsError = error as VendorProductsError;
      const errorMessage = err.response?.data?.message || 'Failed to load products';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, searchTerm, filterStatus]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(1);
  };



  const handleDeleteProduct = (product: Product) => {
    deleteProduct(product._id)
  };

  const handleModalSuccess = () => {
    // Reload products after successful operation
    loadProducts(products?.page || 1);
    toast.success('Operation successful!');
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive' | 'draft') => {
    setFilterStatus(status);
  };

  // Safe access to products data with fallbacks
  const productsList = (products?.items || []) as Product[];
  const currentPage = products?.page || 1;
  const totalPages = products?.pages || 1;
  const totalProducts = products?.total || 0;

  const filteredProducts = productsList;

  const getImageUrl = (images: { url: string; is_primary?: boolean }[] = []) => {
    if (Array.isArray(images) && images.length > 0) {
      const primary = images.find(img => img.is_primary && img.url);
      if (primary && primary.url) return primary.url;
      if (images[0].url) return images[0].url;
    }
    return '/products/product.png';
  };

  return (
    <VendorLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <section className="py-16 bg-gray-50 min-h-screen text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Products</h1>
              <p className="text-gray-600">Manage your product catalog ({totalProducts} products)</p>
            </div>
            <button
              onClick={() => router.push('/vendor/products/add')}
              className="mt-4 md:mt-0 flex items-center bg-[#5A9BD8] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  />
                </div>
              </form>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'draft')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A9BD8]"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first product'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => router.push('/vendor/products/add')}
                  className="flex items-center mx-auto bg-[#5A9BD8] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <Image
                          src={getImageUrl(product.images)}
                          alt={product.name}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.available === 'true' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.available === 'true' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            {product.mrp > product.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">₹{product.mrp}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{product.category}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/vendor/products/${product._id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => router.push(`/products/${product._id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View product"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Image
                                  src={getImageUrl(product.images)}
                                  alt={product.name}
                                  width={80}
                                  height={80}
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                              {product.mrp > product.price && (
                                <div className="text-sm text-gray-500 line-through">₹{product.mrp}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                product.available === 'true' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.available === 'true' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => router.push(`/vendor/products/${product._id}`)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/products/${product._id}`)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="View product"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => loadProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadProducts(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? 'bg-[#5A9BD8] text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => loadProducts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Modals */}
        <AddProductModal
          isOpen={false}
          onClose={() => {}}
          onSuccess={handleModalSuccess}
        />
        
        <EditProductModal
          isOpen={false}
          onClose={() => {}}
          onSuccess={handleModalSuccess}
          product={null}
        />
        
        <DeleteProductModal
          isOpen={false}
          onClose={() => {}}
          onSuccess={handleModalSuccess}
          product={null}
        />
      </section>
    </VendorLayout>
  );
} 