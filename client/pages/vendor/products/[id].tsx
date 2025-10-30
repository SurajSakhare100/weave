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

// Predefined color options with hex codes
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' }
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // State for color variants with images and stock
  const [colorImageMap, setColorImageMap] = useState<{
    [color: string]: {
      hex: string;
      images: File[];
      imageUrls?: string[];
      stock: number;
    }
  }>({});

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
      setTags(p.tags || []);

      // Load color variants
      if (p.colorVariants && p.colorVariants.length > 0) {
        const colorMap: {[color: string]: {hex: string; images: File[]; imageUrls?: string[]; stock: number}} = {};
        p.colorVariants.forEach((variant: any) => {
          colorMap[variant.colorName] = {
            hex: variant.colorCode,
            images: [],
            imageUrls: variant.images?.map((img: any) => img.url) || [],
            stock: variant.stock || 0
          };
        });
        setColorImageMap(colorMap);
      } else if (p.colorImages) {
        // Legacy color images support
        const colorMap: {[color: string]: {hex: string; images: File[]; imageUrls?: string[]; stock: number}} = {};
        Object.entries(p.colorImages).forEach(([color, images]) => {
          colorMap[color] = {
            hex: '#cccccc', // Default color for legacy
            images: [],
            imageUrls: (images as any[])?.map((img: any) => img.url) || [],
            stock: 0
          };
        });
        setColorImageMap(colorMap);
      }
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

 // Handle color-specific image uploads
const handleColorImageUpload = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const currentColorData = colorImageMap[color] || {};
  const currentImages = currentColorData?.images || [];
  const currentImageUrls = currentColorData?.imageUrls || [];

  if (currentImages.length + currentImageUrls.length + files.length > MAX_IMAGES) {
    toast.error(`You can only upload a maximum of ${MAX_IMAGES} images for ${color}`);
    return;
  }

  const validFiles: File[] = [];
  const previewUrls: string[] = [];

  files.forEach(file => {
    const error = validateImage(file);
    if (error) {
      toast.error(`${file.name}: ${error}`);
    } else {
      validFiles.push(file);
      previewUrls.push(URL.createObjectURL(file));
    }
  });

  setColorImageMap(prev => ({
    ...prev,
    [color]: {
      ...prev[color],
      images: [...(prev[color]?.images || []), ...validFiles],
      previewUrls: [...(prev[color]?.previewUrls || []), ...previewUrls],
      imageUrls: prev[color]?.imageUrls || [], // keep backend URLs separate
    },
  }));

  // Prevent double trigger
  e.target.value = '';
};

// Remove a specific image (local preview or existing backend image)
const removeColorImage = (color: string, index: number, type: 'preview' | 'uploaded' = 'preview') => {
  setColorImageMap(prev => {
    const updated = { ...prev };
    const colorData = { ...updated[color] };

    if (type === 'preview') {
      const url = colorData.previewUrls?.[index];
      if (url) URL.revokeObjectURL(url);
      colorData.previewUrls = colorData.previewUrls?.filter((_, i) => i !== index);
      colorData.images = colorData.images?.filter((_, i) => i !== index);
    } else {
      colorData.imageUrls = colorData.imageUrls?.filter((_, i) => i !== index);
    }

    updated[color] = colorData;
    return updated;
  });
};

// Remove entire color section
const removeColorSection = (color: string) => {
  setColorImageMap(prev => {
    const newMap = { ...prev };

    // Revoke all preview URLs
    if (newMap[color]?.previewUrls) {
      newMap[color].previewUrls.forEach(url => URL.revokeObjectURL(url));
    }

    delete newMap[color];
    return newMap;
  });
};


  const handleFeatureChange = (idx: number, value: string) => {
    setKeyFeatures(prev => prev.map((f, i) => (i === idx ? value : f)));
  };

  const handleSizeToggle = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  // Handle color selection from predefined options
  const handleColorSelect = (colorOption: { name: string; hex: string }) => {
    if (colorImageMap[colorOption.name]) {
      // Remove color if already selected
      setColorImageMap(prev => {
        const newColorImages = {...prev};
        delete newColorImages[colorOption.name];
        return newColorImages;
      });
    } else {
      // Add new color
      setColorImageMap(prev => ({
        ...prev,
        [colorOption.name]: {
          hex: colorOption.hex,
          images: [],
          stock: 0
        }
      }));
    }
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
  
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    toast.error('Fix the highlighted errors.');
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();

    // Basic fields
    const basicFields = { name, description, price, mrp, category, offers, salePrice, srtDescription: additionalDetails };
    for (const [key, value] of Object.entries(basicFields)) {
      if (value) formData.append(key, String(value).trim());
    }

    // Product details, tags, sizes
    formData.append('productDetails', JSON.stringify(productDetails));
    keyFeatures.filter(Boolean).forEach(f => formData.append('keyFeatures', f.trim()));
    tags.forEach(tag => formData.append('tags', tag.trim()));
    sizes.forEach(size => formData.append('sizes', size.trim().toUpperCase()));

    // Color variants (no nested madness)
    const colorVariants = Object.entries(colorImageMap).map(([color, data]) => ({
      colorName: color,
      colorCode: data.hex,
      stock: data.stock,
      isActive: true,
    }));
    formData.append('colorVariants', JSON.stringify(colorVariants));

    // Color images
    Object.entries(colorImageMap).forEach(([color, data]) => {
      data.images.forEach(img => formData.append(`colorImages_${color}`, img));
    });

    // Product images
    formData.append('existingImages', JSON.stringify(existingImages));
    images.forEach(img => formData.append('images', img));

    await editVendorProduct(id as string, formData);
    toast.success('Product updated! Awaiting admin review.');
    router.push('/vendor/products');
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Update failed');
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
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`
                        flex flex-col items-center p-2 rounded-lg border-2 transition-all
                        ${colorImageMap[color.name]
                          ? 'border-[#5A9BD8] bg-[#5A9BD8]/10'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 mb-1"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-center">{color.name}</span>
                    </button>
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

            {/* Color Variants Section */}
            {Object.keys(colorImageMap).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Color Variants</h2>
                
                {Object.entries(colorImageMap).map(([color, colorData]) => (
                  <div key={color} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {/* Color header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorData.hex }}
                        />
                        <h3 className="text-lg font-medium capitalize">{color} Variant</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorSection(color)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stock input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Stock for {color} variant:</label>
                      <input
                        type="number"
                        min="0"
                        value={colorData.stock}
                        onChange={(e) => setColorImageMap(prev => ({
                          ...prev,
                          [color]: {
                            ...prev[color],
                            stock: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                        placeholder="0"
                      />
                    </div>

                    {/* Image upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Images for {color} variant:</label>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Existing images */}
                        {colorData.imageUrls?.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`${color} variant ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorImage(color, index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* New images */}
                        {colorData.images.map((imageUrl, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img 
                              src={URL.createObjectURL(imageUrl)} 
                              alt={`${color} variant ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorImage(color, index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add image button */}
                        {(colorData.images.length + (colorData.imageUrls?.length || 0)) < MAX_IMAGES && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-24 cursor-pointer hover:border-[#5A9BD8] transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              id={`color-image-upload-${color}`}
                              onChange={(e) => handleColorImageUpload(color, e)}
                            />
                            <label
                              htmlFor={`color-image-upload-${color}`}
                              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                            >
                              <Upload className="text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500 text-center px-2">
                                Add Images<br />
                                Max {MAX_IMAGES - (colorData.images.length + (colorData.imageUrls?.length || 0))} more
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

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