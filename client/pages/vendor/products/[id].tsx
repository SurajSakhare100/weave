import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/Vendor/VendorLayout';
import Image from 'next/image';
import { editVendorProduct } from '@/services/vendorService';
import api from '@/services/api';
import { Upload, Info, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL'
];
const COLOR_OPTIONS = [
  'Black', 'White', 'Beige', 'Tan', 'Brown', 'Grey'
];

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function VendorEditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [productNotFound, setProductNotFound] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [productDetails, setProductDetails] = useState({ weight: '', dimensions: '', capacity: '', materials: '' });
  const [keyFeatures, setKeyFeatures] = useState(['', '', '', '']);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{url: string; public_id: string}[]>([]);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [offers, setOffers] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    }).catch(err => {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setProductNotFound(false);
    
    api.get(`/products/${id}`).then(res => {
      const p = res.data.data;
      if (!p) {
        setProductNotFound(true);
        return;
      }
      setName(p.name || '');
      setDescription(p.description || '');
      setAdditionalDetails(p.srtDescription || '');
      setProductDetails(p.productDetails || { weight: '', dimensions: '', capacity: '', materials: '' });
      setKeyFeatures(p.keyFeatures || ['', '', '', '']);
      setExistingImages(p.images || []);
      setPrice(p.price?.toString() || '');
      setMrp(p.mrp?.toString() || '');
      setOffers(!!p.offers);
      setSalePrice(p.salePrice?.toString() || '');
      setCategory(p.categorySlug || '');
      setSizes(p.sizes || []);
      setColors(p.colors || []);
      setTags(p.tags || []);
    }).catch((err) => {
      if (err.response?.status === 404) {
        setProductNotFound(true);
      } else {
        setError('Failed to load product');
        toast.error('Failed to load product');
      }
    }).finally(() => setLoading(false));
  }, [id]);

  // Redirect to 404 if product not found
  useEffect(() => {
    if (productNotFound) {
      router.push('/vendor/404');
    }
  }, [productNotFound, router]);

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB';
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of images (existing + new)
    if (existingImages.length + images.length + files.length > MAX_IMAGES) {
      toast.error(`You can only have a maximum of ${MAX_IMAGES} images total`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }
    });

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
    
    // Clear the input
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== idx);
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[idx]);
      return newPreviews;
    });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFeatureChange = (idx: number, value: string) => {
    setKeyFeatures(prev => prev.map((f, i) => (i === idx ? value : f)));
  };

  const handleSizeToggle = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleColorToggle = (color: string) => {
    setColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
      } else if (tags.length >= 10) {
        toast.error('Maximum 10 tags allowed');
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const validateForm = (): {[key: string]: string} => {
    const errors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      errors.name = 'Product name is required';
    } else if (name.length > 100) {
      errors.name = 'Product name cannot exceed 100 characters';
    }

    if (!description.trim()) {
      errors.description = 'Product description is required';
    } else if (description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = 'Valid price is required (must be greater than 0)';
    }

    if (!mrp || isNaN(Number(mrp)) || Number(mrp) <= 0) {
      errors.mrp = 'Valid MRP is required (must be greater than 0)';
    }

    if (Number(price) > Number(mrp)) {
      errors.price = 'Price cannot be greater than MRP';
    }

    if (offers && (!salePrice || isNaN(Number(salePrice)) || Number(salePrice) <= 0)) {
      errors.salePrice = 'Valid sale price is required when offers is enabled';
    }

    if (offers && Number(salePrice) >= Number(price)) {
      errors.salePrice = 'Sale price must be less than regular price';
    }

    if (!category) {
      errors.category = 'Category is required';
    }

    const totalImages = existingImages.length + images.length;
    if (totalImages === 0) {
      errors.images = 'At least one image is required';
    } else if (totalImages > MAX_IMAGES) {
      errors.images = `Maximum ${MAX_IMAGES} images allowed`;
    }

    if (sizes.length === 0) {
      errors.sizes = 'At least one size must be selected';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('srtDescription', additionalDetails.trim());
      formData.append('price', price);
      formData.append('mrp', mrp);
      formData.append('category', category);
      formData.append('offers', String(offers));
      if (offers && salePrice) {
        formData.append('salePrice', salePrice);
      }
      formData.append('productDetails', JSON.stringify(productDetails));
      
      // Add key features (filter out empty ones)
      const nonEmptyFeatures = keyFeatures.filter(f => f.trim());
      nonEmptyFeatures.forEach((f, i) => formData.append(`keyFeature${i+1}`, f.trim()));

      // Add sizes and colors
      sizes.forEach(size => formData.append('sizes', size));
      colors.forEach(color => formData.append('colors', color));
      tags.forEach(tag => formData.append('tags', tag));
      
      // Add existing images and new images
      formData.append('existingImages', JSON.stringify(existingImages));
      images.forEach(img => formData.append('images', img));

      await editVendorProduct(id as string, formData);
      setSuccess(true);
      toast.success('Product updated successfully! Changes will be reviewed by admin before going live.');
      setTimeout(() => router.push('/vendor/products'), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Failed to update product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3475A6]"></div>
        </div>
      </VendorLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <VendorLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => router.back()}
              className="bg-[#3475A6] text-white px-4 py-2 rounded hover:bg-[#2a5a8a]"
            >
              Go Back
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="min-h-screen bg-[#f4f8fb] text-black py-8 px-2 md:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#357ab8] mb-2">Edit Product</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>Changes will be reviewed by admin before being published.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Name & Description */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Name & Description</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-2">
                  Product title *
                  <span className="text-xs text-gray-400">Maximum 100 characters. No HTML or emoji allowed</span>
                </label>
                <input 
                  maxLength={100} 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'}`} 
                  placeholder="Enter product name" 
                />
                <div className="flex justify-between items-center mt-1">
                  {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name}</div>}
                  <div className="text-xs text-gray-400">{name.length}/100</div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Description * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={4} 
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb] ${fieldErrors.description ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Describe your product in detail"
                />
                <div className="flex justify-between items-center mt-1">
                  {fieldErrors.description && <div className="text-red-600 text-sm">{fieldErrors.description}</div>}
                  <div className="text-xs text-gray-400">{description.length}/1000</div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Additional details <Info className="h-4 w-4 text-gray-400" />
                </label>
                <textarea 
                  value={additionalDetails} 
                  onChange={e => setAdditionalDetails(e.target.value)} 
                  rows={2} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb]"
                  placeholder="Any additional information about your product"
                />
                <div className="text-xs text-gray-400 mt-1">{additionalDetails.length}/200</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-1 flex items-center gap-1">Product details <Info className="h-4 w-4 text-gray-400" /></label>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={productDetails.weight} onChange={e => setProductDetails({ ...productDetails, weight: e.target.value })} placeholder="Weight" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                    <input value={productDetails.dimensions} onChange={e => setProductDetails({ ...productDetails, dimensions: e.target.value })} placeholder="Dimensions" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                    <input value={productDetails.capacity} onChange={e => setProductDetails({ ...productDetails, capacity: e.target.value })} placeholder="Capacity" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                    <input value={productDetails.materials} onChange={e => setProductDetails({ ...productDetails, materials: e.target.value })} placeholder="Materials" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1 flex items-center gap-1">Key features <Info className="h-4 w-4 text-gray-400" /></label>
                  <div className="grid grid-cols-2 gap-2">
                    {keyFeatures.map((f, i) => (
                      <input key={i} value={f} onChange={e => handleFeatureChange(i, e.target.value)} placeholder={`Feature ${i+1}`} className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Images & Category */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Images & Category</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Product images * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <div className={`bg-[#f4f8fb] border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${fieldErrors.images ? 'border-red-500' : 'border-gray-200'}`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="product-images-edit" 
                    disabled={existingImages.length + images.length >= MAX_IMAGES}
                  />
                  <label htmlFor="product-images-edit" className={`cursor-pointer flex flex-col items-center ${existingImages.length + images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="h-8 w-8 text-[#5A9BD8] mb-2" />
                    <span className="text-[#5A9BD8] font-medium">
                      {existingImages.length + images.length >= MAX_IMAGES ? 'Maximum images reached' : 'Click or drop images'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {existingImages.length + images.length}/{MAX_IMAGES} images • Max 5MB each
                    </span>
                  </label>
                  
                  {(existingImages.length > 0 || images.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4 w-full">
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <Image src={img.url} alt={`Existing product image ${idx + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <button 
                            type="button" 
                            onClick={() => removeExistingImage(idx)} 
                            className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-1 rounded-b-lg">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                      {imagePreviews.map((src, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <Image src={src} alt={`New product image ${idx + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)} 
                            className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs text-center py-1 rounded-b-lg">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {fieldErrors.images && <div className="text-red-600 text-sm mt-2">{fieldErrors.images}</div>}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Category * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <select 
                  required 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] ${fieldErrors.category ? 'border-red-500' : 'border-gray-200'}`}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                {fieldErrors.category && <div className="text-red-600 text-sm mt-1">{fieldErrors.category}</div>}
              </div>
            </section>

            {/* Price */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Pricing</h2>
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Price * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                <input 
                  required 
                  type="number" 
                  min={0} 
                  step="0.01"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] ${fieldErrors.price ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="0.00"
                />
                {fieldErrors.price && <div className="text-red-600 text-sm mt-1">{fieldErrors.price}</div>}
              </div>
              
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  MRP * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                <input 
                  required 
                  type="number" 
                  min={0} 
                  step="0.01"
                  value={mrp} 
                  onChange={e => setMrp(e.target.value)} 
                  className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] ${fieldErrors.mrp ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="0.00"
                />
                {fieldErrors.mrp && <div className="text-red-600 text-sm mt-1">{fieldErrors.mrp}</div>}
              </div>
              
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Offers <Info className="h-4 w-4 text-gray-400" />
                </label>
                <input 
                  type="checkbox" 
                  checked={offers} 
                  onChange={e => setOffers(e.target.checked)} 
                  className="form-checkbox h-5 w-5 text-[#5A9BD8]" 
                />
              </div>
              
              {offers && (
                <div className="mb-4 flex items-center gap-2">
                  <label className="block font-medium mb-1 flex items-center gap-1">
                    Sale Price * <Info className="h-4 w-4 text-gray-400" />
                  </label>
                  <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                  <input 
                    type="number" 
                    min={0} 
                    step="0.01"
                    value={salePrice} 
                    onChange={e => setSalePrice(e.target.value)} 
                    className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] ${fieldErrors.salePrice ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="0.00"
                  />
                  {fieldErrors.salePrice && <div className="text-red-600 text-sm mt-1">{fieldErrors.salePrice}</div>}
                </div>
              )}
            </section>

            {/* Category & Attributes */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Attributes</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Sizes * <Info className="h-4 w-4 text-gray-400" />
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {SIZE_OPTIONS.map(size => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sizes.includes(size)} 
                        onChange={() => handleSizeToggle(size)} 
                        className="form-checkbox h-5 w-5 text-[#5A9BD8]" 
                      />
                      {size}
                    </label>
                  ))}
                </div>
                {fieldErrors.sizes && <div className="text-red-600 text-sm mt-1">{fieldErrors.sizes}</div>}
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Colors <Info className="h-4 w-4 text-gray-400" />
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={colors.includes(color)} 
                        onChange={() => handleColorToggle(color)} 
                        className="form-checkbox h-5 w-5 text-[#5A9BD8]" 
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Tags <Info className="h-4 w-4 text-gray-400" />
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="bg-[#5A9BD8] text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)} 
                        className="ml-1 text-white hover:text-red-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder="Enter tags to describe your item (press Enter or comma to add)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  disabled={tags.length >= 10}
                />
                <div className="text-xs text-gray-400 mt-1">{tags.length}/10 tags</div>
              </div>
            </section>

            {error && <div className="text-red-600 font-medium bg-red-50 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 font-medium bg-green-50 p-3 rounded-lg">Product updated successfully! Redirecting...</div>}
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5A9BD8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Product...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
} 