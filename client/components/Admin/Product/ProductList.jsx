import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import Server, { ServerId } from '../../../Config/Server'
import { 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    Package,
    Filter
} from 'lucide-react'
import { useDeleteProductMutation } from '../../../services/adminApi'

function ProductList({ loaded, setLoaded }) {
    const [responseServer, setResponse] = useState({
        pagination: false
    })
    const [update, setUpdate] = useState(false)
    const [search, setSearch] = useState('')
    const [pages, setPages] = useState([])
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useRouter()
    const [deleteProduct] = useDeleteProductMutation()
    const logOut = () => {
        localStorage.removeItem("adminToken")
        setLoaded(true)
        navigate.push('/admin/login')
    }

    const fetchProducts = async (page = 1, searchTerm = null) => {
        setIsLoading(true)
        try {
            const response = await adminAxios((server) => 
                server.get('/admin/getProducts', {
                    params: { page, search: searchTerm }
                })
            )
            
            if (response.data.login) {
                logOut()
            } else {
                setProducts(response.data.data)
                setResponse(response.data)
                setPages(response.data.pages)
            }
        } catch (err) {
            console.error("Error fetching products:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setLoaded(false)
        const searchTerm = navigate.query.search || null
        fetchProducts(1, searchTerm)
        setLoaded(true)
        setSearch(searchTerm || '')
    }, [search, update, navigate.query])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate.push(`/admin/products?search=${search}`)
    }

    const handleDelete = async (product) => {
        if (window.confirm(`Do you want to delete "${product.name}"?`)) {
            try {
                const res = await deleteProduct({ id: product._id, folderId: product.uni_id_1 + product.uni_id_2 })
                if (res.data && res.data.login) {
                    logOut()
                } else {
                    alert("Product deleted successfully")
                    setUpdate(!update)
                }
            } catch (err) {
                alert("Sorry, server has some problem")
            }
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (!loaded) return <Loading />

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
                            <p className="text-gray-600">Manage your product catalog</p>
                        </div>
                        <button
                            onClick={() => navigate.push('/admin/products/add')}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <form onSubmit={handleSearch} className="max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="input-field pl-10"
                            />
                        </div>
                    </form>
                </div>

                {/* Products Grid */}
                {responseServer.showNot ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {products.map((product, key) => (
                            <div key={key} className="card-hover overflow-hidden">
                                <div className="relative">
                                    <img
                                        src={`${ServerId}/product/${product.uni_id_1}${product.uni_id_2}/${product.files[0].filename}`}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button
                                            onClick={() => window.open(`/p/${product.slug}/${product._id}`, '_blank')}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="View Product"
                                        >
                                            <Eye size={16} className="text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => navigate.push(`/admin/products/edit/${product._id}`)}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="Edit Product"
                                        >
                                            <Edit size={16} className="text-primary-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} className="text-error-600" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {product.discount > 0 && (
                                                <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">
                                                    {product.discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {product.discount > 0 && (
                                                <p className="text-xs text-gray-500 line-through">
                                                    {formatCurrency(product.mrp)}
                                                </p>
                                            )}
                                            <p className="font-bold text-gray-900">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {responseServer.pagination && pages.length > 1 && (
                    <div className="flex justify-center">
                        <div className="flex space-x-1">
                            {pages.map((page, key) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        const sp = new URLSearchParams(window.location.search)
                                        fetchProducts(page, sp.get("search"))
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        responseServer.currentPage === page
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductList
