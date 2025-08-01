import React, { useState, useRef, Fragment, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { 
    Plus, 
    X, 
    Package, 
    DollarSign, 
    Tag, 
    FileText,
    Image as ImageIcon,
    Save,
    Settings
} from 'lucide-react';
import { useGetCategoriesQuery, useAddProductMutation } from '../../../services/adminApi';

// Dynamic import for JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading editor...</div>
});

function AddProduct() {
    const editor = useRef(null);
    const navigate = useRouter();

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

    // RTK Query hooks
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
    const [addProduct, { isLoading: addLoading }] = useAddProductMutation();

    const [categories, setCategories] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name: '',
        price: '',
        mrp: '',
        available: 'true',
        cancellation: 'true',
        return: 'true',
        category: '',
        categorySlug: '',
        srtDescription: '',
        description: '',
        seoDescription: '',
        seoTitle: '',
        seoKeyword: '',
        variant: [],
        uni_id_1: Date.now() + Math.random()
    });
    const [thumbPrev, setThumbPrev] = useState();
    const [thumb, setThumb] = useState();
    const [images, setImages] = useState();
    const [imagesPrev, setImagesPrev] = useState([]);

    // Set categories and default category when categoriesData changes
    useEffect(() => {
        if (categoriesData && Array.isArray(categoriesData)) {
            setCategories(categoriesData);
            if (categoriesData.length > 0) {
                setProductDetails(productDetails => ({
                    ...productDetails,
                    category: categoriesData[0].name,
                    categorySlug: categoriesData[0].slug
                }));
            }
        }
    }, [categoriesData]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            let formData = new FormData();
            formData.append("uni_id_1", productDetails.uni_id_1);
            formData.append("uni_id_2", Date.now() + Math.random());
            formData.append("name", productDetails.name);
            formData.append("price", productDetails.price);
            formData.append("mrp", productDetails.mrp);
            formData.append("variant", JSON.stringify(productDetails.variant));
            formData.append("available", productDetails.available);
            formData.append("cancellation", productDetails.cancellation);
            formData.append("category", productDetails.category);
            formData.append("categorySlug", productDetails.categorySlug);
            formData.append("srtDescription", productDetails.srtDescription);
            formData.append("description", productDetails.description);
            formData.append("seoDescription", productDetails.seoDescription);
            formData.append("seoKeyword", productDetails.seoKeyword);
            formData.append("seoTitle", productDetails.seoTitle);
            formData.append('return', productDetails.return);
            formData.append('images', thumb);
            for (var i = 0; images && i < images.length; i++) {
                formData.append('images', images[i]);
            }
            const result = await addProduct(formData);
            if (result.error && result.error.data && result.error.data.login) {
                logOut();
            } else if (result.data && result.data.login) {
                logOut();
            } else {
                navigate.push('/admin/products');
            }
        } catch (err) {
            alert("Sorry, server has some problem");
        }
    };

    if (categoriesLoading) return <div>Loading categories...</div>;
    if (categoriesError) return <div>Error loading categories</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Package className="h-8 w-8 text-primary-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
                                <p className="text-gray-600">Create a new product for your catalog</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate.push('/admin/products')}
                            className="btn-outline flex items-center space-x-2"
                        >
                            <X size={20} />
                            <span>Close</span>
                        </button>
                    </div>
                </div>

                {/* Product Form */}
                <div className="card">
                    <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Package size={20} className="mr-2" />
                                Basic Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        value={productDetails.name}
                                        type="text"
                                        required
                                        onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={productDetails.category}
                                        onChange={(e) => {
                                            const selectedCategory = categories.find(cat => cat.name === e.target.value);
                                            setProductDetails({
                                                ...productDetails,
                                                category: e.target.value,
                                                categorySlug: selectedCategory ? selectedCategory.slug : ''
                                            });
                                        }}
                                        className="input-field"
                                    >
                                        {categories.map((category, key) => (
                                            <option key={key} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹)
                                    </label>
                                    <input
                                        value={productDetails.price}
                                        type="number"
                                        onChange={(e) => setProductDetails({ ...productDetails, price: e.target.value })}
                                        disabled={productDetails.variant.length > 0}
                                        required={productDetails.variant.length === 0}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        MRP (₹)
                                    </label>
                                    <input
                                        value={productDetails.mrp}
                                        type="number"
                                        onChange={(e) => setProductDetails({ ...productDetails, mrp: e.target.value })}
                                        disabled={productDetails.variant.length > 0}
                                        required={productDetails.variant.length === 0}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Settings */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Settings size={20} className="mr-2" />
                                Product Settings
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Availability
                                    </label>
                                    <select
                                        value={productDetails.available}
                                        onChange={(e) => setProductDetails({ ...productDetails, available: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="true">Available</option>
                                        <option value="false">Not Available</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cancellation
                                    </label>
                                    <select
                                        value={productDetails.cancellation}
                                        onChange={(e) => setProductDetails({ ...productDetails, cancellation: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="true">Available</option>
                                        <option value="false">Not Available</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return Policy
                                    </label>
                                    <select
                                        value={productDetails.return}
                                        onChange={(e) => setProductDetails({ ...productDetails, return: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="true">Available</option>
                                        <option value="false">Not Available</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileText size={20} className="mr-2" />
                                Description
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Short Description
                                    </label>
                                    <textarea
                                        value={productDetails.srtDescription}
                                        onChange={(e) => setProductDetails({ ...productDetails, srtDescription: e.target.value })}
                                        className="input-field"
                                        rows="3"
                                        placeholder="Brief product description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Detailed Description
                                    </label>
                                    <JoditEditor
                                        ref={editor}
                                        value={productDetails.description}
                                        onChange={(newContent) => setProductDetails({ ...productDetails, description: newContent })}
                                        config={{
                                            height: 300,
                                            toolbar: true,
                                            spellcheck: true,
                                            language: "en",
                                            toolbarButtonSize: "medium",
                                            fontSize: 12,
                                            toolbarAdaptive: false,
                                            showCharsCounter: true,
                                            showWordsCounter: true,
                                            showXPathInStatusbar: false,
                                            askBeforePasteHTML: true,
                                            askBeforePasteFromWord: true,
                                            defaultActionOnPaste: "insert_clear_html",
                                            buttons: [
                                                "source",
                                                "|",
                                                "bold",
                                                "strikethrough",
                                                "underline",
                                                "italic",
                                                "|",
                                                "ul",
                                                "ol",
                                                "|",
                                                "outdent",
                                                "indent",
                                                "|",
                                                "font",
                                                "fontsize",
                                                "brush",
                                                "paragraph",
                                                "|",
                                                "image",
                                                "link",
                                                "table",
                                                "|",
                                                "align",
                                                "undo",
                                                "redo",
                                                "|",
                                                "hr",
                                                "eraser",
                                                "copyformat",
                                                "|",
                                                "fullsize"
                                            ]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEO Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Tag size={20} className="mr-2" />
                                SEO Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Title
                                    </label>
                                    <input
                                        value={productDetails.seoTitle}
                                        type="text"
                                        onChange={(e) => setProductDetails({ ...productDetails, seoTitle: e.target.value })}
                                        className="input-field"
                                        placeholder="SEO optimized title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Keywords
                                    </label>
                                    <input
                                        value={productDetails.seoKeyword}
                                        type="text"
                                        onChange={(e) => setProductDetails({ ...productDetails, seoKeyword: e.target.value })}
                                        className="input-field"
                                        placeholder="Keywords separated by commas"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Description
                                    </label>
                                    <textarea
                                        value={productDetails.seoDescription}
                                        onChange={(e) => setProductDetails({ ...productDetails, seoDescription: e.target.value })}
                                        className="input-field"
                                        rows="3"
                                        placeholder="SEO meta description"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={addLoading}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {addLoading ? (
                                    <>
                                        <div className="spinner mr-2"></div>
                                        Creating Product...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Create Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;