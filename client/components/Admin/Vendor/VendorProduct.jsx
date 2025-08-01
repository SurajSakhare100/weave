import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import {
  useGetOneVendorProductsQuery,
  useDeleteProductMutation
} from '../../../services/adminApi';
import { 
    Package, 
    Eye, 
    Edit, 
    Trash2, 
    DollarSign,
    Tag,
    Search
} from 'lucide-react'

function VendorProduct({ vendorId, loaded, setLoaded }) {
  let router = useRouter()
  const logOut = async () => {
    try {
      // Call logout endpoint to clear cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/admin/login')
  }
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [products, setProducts] = useState([])
  // RTK Query hooks
  const { data, error, isLoading, refetch } = useGetOneVendorProductsQuery({ vendorId, search, skip: 0 }, { skip: !vendorId });
  const [deleteProduct] = useDeleteProductMutation();
  useEffect(() => {
    if (data) {
      setProducts(data.products)
      setTotal(data.total)
      setLoaded(true)
    }
    if (isLoading) setLoaded(false)
    if (error) setLoaded(true)
  }, [data, isLoading, error, setLoaded])

  const handleDeleteProduct = async (obj) => {
    if (window.confirm(`Do You Want Delete ${obj.name}`)) {
      try {
        const res = await deleteProduct({ id: obj._id, folderId: obj.uni_id_1 + obj.uni_id_2 });
        if (res.data && res.data.login) {
          logOut();
        } else {
          setLoaded(false);
          alert("Product Deleted");
          refetch();
        }
      } catch (err) {
        alert("Sorry Server Has Some Problem");
      }
    }
  }

  return (
    <>
      {
        loaded ? (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="h-8 w-8 text-[#5A9BD8]" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Products</h1>
                    <p className="text-gray-600">Manage products for this vendor</p>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    setLoaded(false)
                    refetch()
                  }} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="text" 
                          value={search} 
                          onInput={(e) => {
                            setSearch(e.target.value)
                          }} 
                          placeholder='Search products by name...' 
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-[#5A9BD8] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A9BD8] transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MRP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.length > 0 ? (
                        products.map((obj, key) => (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={
                                  obj.images && obj.images.length > 0
                                    ? (obj.images.find(img => img.is_primary)?.url || obj.images[0].url)
                                    : '/products/product.png'
                                }
                                alt={obj.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {obj.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#5A9BD8]">
                                {obj.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{obj.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{obj.mrp}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {obj.discount}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button 
                                onClick={() => {
                                  window.open(`/p/${obj.slug}/${obj._id}`, '_blank')
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A9BD8] transition-colors"
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </button>
                              <button 
                                onClick={() => {
                                  handleDeleteProduct(obj)
                                }}
                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <Package className="h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-lg font-medium text-gray-900 mb-2">
                                No products found
                              </p>
                              <p className="text-gray-600">
                                {search ? 'No products match your search criteria' : 'This vendor has no products yet'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Load More Button */}
                {total !== products.length && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center">
                    <button 
                      onClick={() => {
                        refetch()
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A9BD8] transition-colors"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : <Loading />
      }
    </>
  )
}

export default VendorProduct