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
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle
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
    const [approvalFilter, setApprovalFilter] = useState('all') // all, pending, approved, rejected
    const navigate = useRouter()
    const [deleteProduct] = useDeleteProductMutation()

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
        navigate.push('/admin/login')
    }

    const fetchProducts = async (page = 1, searchTerm = null) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/getProducts?page=${page}&search=${searchTerm || ''}&approvalStatus=${approvalFilter}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setProducts(data.data);
                setResponse(data);
                setPages(Array.from({ length: data.totalPages }, (_, i) => i + 1));
            } else if (response.status === 401) {
                logOut();
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
    }, [search, update, navigate.query, approvalFilter])

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

    const handleApprove = async (product) => {
        if (window.confirm(`Do you want to approve "${product.name}"?`)) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/products/${product._id}/approve`, {
                    method: 'PUT',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    alert("Product approved successfully");
                    setUpdate(!update);
                } else {
                    alert("Failed to approve product");
                }
            } catch (err) {
                alert("Sorry, server has some problem");
            }
        }
    }

    const handleReject = async (product) => {
        const rejectionReason = prompt("Please provide a reason for rejection:");
        if (rejectionReason && rejectionReason.trim()) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/products/${product._id}/reject`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
                });
                
                if (response.ok) {
                    alert("Product rejected successfully");
                    setUpdate(!update);
                } else {
                    alert("Failed to reject product");
                }
            } catch (err) {
                alert("Sorry, server has some problem");
            }
        }
    }

    const getApprovalStatusBadge = (product) => {
        if (product.adminApproved === true) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Approved
                </span>
            );
        } else if (product.adminApproved === false && product.adminRejectionReason) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle size={12} className="mr-1" />
                    Rejected
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={12} className="mr-1" />
                    Pending
                </span>
            );
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
        <div className="min-h-screen admin-bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold admin-text-primary mb-2">Products</h1>
                            <p className="admin-text-secondary">Manage your product catalog</p>
                        </div>
                        <button
                            onClick={() => navigate.push('/admin/products/add')}
                            className="admin-btn admin-btn-primary flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 admin-text-tertiary" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="admin-input pl-10"
                            />
                        </div>
                    </form>
                    
                    {/* Approval Status Filter */}
                    <div className="flex items-center space-x-2">
                        <label className="admin-text-secondary text-sm font-medium">Status:</label>
                        <select
                            value={approvalFilter}
                            onChange={(e) => setApprovalFilter(e.target.value)}
                            className="admin-input text-sm"
                        >
                            <option value="all">All Products</option>
                            <option value="pending">Pending Approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {responseServer.showNot ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 admin-text-tertiary mb-4" />
                        <h3 className="text-lg font-medium admin-text-primary mb-2">No Products Found</h3>
                        <p className="admin-text-secondary">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {products.map((product, key) => (
                            <div key={key} className="admin-card overflow-hidden">
                                <div className="relative">
                                    <img
                                        src={`${ServerId}/product/${product.uni_id_1}${product.uni_id_2}/${product.files[0].filename}`}
                                        alt={product.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    
                                    {/* Approval Status Badge */}
                                    <div className="absolute top-2 left-2">
                                        {getApprovalStatusBadge(product)}
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 flex space-x-1">
                                        <button
                                            onClick={() => window.open(`/p/${product.slug}/${product._id}`, '_blank')}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="View Product"
                                        >
                                            <Eye size={16} className="admin-text-secondary" />
                                        </button>
                                        <button
                                            onClick={() => navigate.push(`/admin/products/edit/${product._id}`)}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="Edit Product"
                                        >
                                            <Edit size={16} className="admin-text-primary" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="p-2 bg-white rounded-full shadow-soft hover:shadow-medium transition-shadow"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={16} className="admin-text-danger" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <h3 className="font-semibold admin-text-primary mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm admin-text-secondary mb-3">{product.category}</p>
                                    
                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-1">
                                                {product.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {product.tags.length > 3 && (
                                                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                        +{product.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            {product.discount > 0 && (
                                                <span className="text-xs admin-badge admin-badge-success">
                                                    {product.discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {product.discount > 0 && (
                                                <p className="text-xs admin-text-tertiary line-through">
                                                    {formatCurrency(product.mrp)}
                                                </p>
                                            )}
                                            <p className="font-bold admin-text-primary">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Approval Actions */}
                                    {(product.adminApproved === null || product.adminApproved === false) && (
                                        <div className="flex space-x-2 mt-3">
                                            <button
                                                onClick={() => handleApprove(product)}
                                                className="flex-1 admin-btn admin-btn-success text-xs py-1"
                                            >
                                                <CheckCircle size={14} className="mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(product)}
                                                className="flex-1 admin-btn admin-btn-danger text-xs py-1"
                                            >
                                                <XCircle size={14} className="mr-1" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* Rejection Reason */}
                                    {product.adminRejectionReason && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                            <p className="font-medium text-red-800 mb-1">Rejection Reason:</p>
                                            <p className="text-red-700">{product.adminRejectionReason}</p>
                                        </div>
                                    )}
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
                                            ? 'admin-bg-primary admin-text-white'
                                            : 'admin-bg-secondary admin-text-secondary hover:admin-bg-primary-lighter border admin-border-primary'
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
