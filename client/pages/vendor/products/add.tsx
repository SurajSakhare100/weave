import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/Vendor/VendorLayout';
import Image from 'next/image';
import { addVendorProduct } from '@/services/vendorService';
import api from '@/services/api';
import { Upload, Info, X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function VendorAddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [productDetails, setProductDetails] = useState({ weight: '', dimensions: '', capacity: '', materials: '' });
  const [keyFeatures, setKeyFeatures] = useState(['', '', '', '']);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [offers, setOffers] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // State for color and image management
  const [colorImageMap, setColorImageMap] = useState<{
    [color: string]: {
      hex: string;
      images: File[];
      imageUrls?: string[];
      stock: number;
    }
  }>({});

  // State for image upload
  const [imageUploadProgress, setImageUploadProgress] = useState<{[color: string]: number[]}>({});
  const [isUploading, setIsUploading] = useState<{[color: string]: boolean}>({});


  useEffect(() => {
    // Load categories
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    }).catch(err => {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
    });
  }, []);

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 5MB limit.`;
    }

    // Check for supported formats
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedFormats.includes(file.type.toLowerCase())) {
      return `${file.name}: Unsupported format. Use JPEG, PNG, WebP, or GIF.`;
    }

    return null;
  };

  // Enhanced validation for multiple files
  const validateImageFiles = (files: File[]): { validFiles: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors };
  };

  // Handle main product image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleMainImageUpload(files);
  };

  // Handle drag and drop for main images
  const handleMainImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag styling
    e.currentTarget.classList.remove('border-[#5A9BD8]', 'bg-blue-50');

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please drop only image files');
      return;
    }
    
    handleMainImageUpload(imageFiles);
  };

  // Main image upload handler
  const handleMainImageUpload = (files: File[]) => {
    // Validate number of images
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Cannot add ${files.length} images. Maximum ${MAX_IMAGES} images allowed. Current: ${images.length}`);
      return;
    }

    // Enhanced validation
    const { validFiles, errors } = validateImageFiles(files);

    // Show all errors at once
    errors.forEach(error => {
      toast.error(error);
    });

    if (validFiles.length === 0) {
      return;
    }

    // Set uploading state for main images
    setIsUploading(prev => ({ ...prev, main: true }));

    // Simulate processing time for better UX
    setTimeout(() => {
      // Create previews for valid files
      const validPreviews = validFiles.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
    
      // Clear uploading state
      setIsUploading(prev => ({ ...prev, main: false }));

      // Show success message
      if (validFiles.length === files.length) {
        toast.success(`Successfully uploaded ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`);
      } else {
        toast.info(`Uploaded ${validFiles.length} of ${files.length} images`);
      }
    }, 500); // Small delay for better UX feedback
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


  // Image upload handler
  const handleImageUpload = async (color: string, files: File[]) => {
    // Validate number of images
    const currentColorImages = colorImageMap[color]?.images || [];
    if (currentColorImages.length + files.length > MAX_IMAGES) {
      toast.error(`Cannot add ${files.length} images for ${color}. Maximum ${MAX_IMAGES} images allowed. Current: ${currentColorImages.length}`);
      return;
    }

    // Enhanced validation
    const { validFiles, errors } = validateImageFiles(files);

    // Show all errors at once
    errors.forEach(error => {
      toast.error(error);
    });

    if (validFiles.length === 0) {
      return;
    }

    // Set uploading state for this color
    setIsUploading(prev => ({ ...prev, [color]: true }));

    // Simulate processing time for better UX
    setTimeout(() => {
      // Create previews for valid files
      const validPreviews = validFiles.map(file => URL.createObjectURL(file));

      // Update color images with new files
      setColorImageMap(prev => ({
        ...prev,
        [color]: {
          ...prev[color],
          images: [...(prev[color]?.images || []), ...validFiles],
          imageUrls: [...(prev[color]?.imageUrls || []), ...validPreviews]
        }
      }));

      // Clear uploading state
      setIsUploading(prev => ({ ...prev, [color]: false }));

      // Show success message
      if (validFiles.length === files.length) {
        toast.success(`Successfully uploaded ${validFiles.length} image${validFiles.length > 1 ? 's' : ''} for ${color}`);
      } else {
        toast.info(`Uploaded ${validFiles.length} of ${files.length} images for ${color}`);
      }
    }, 500); // Small delay for better UX feedback
  };

  // Handle color-specific image upload
  const handleColorImageUpload = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Upload images
    handleImageUpload(color, files);
  };

  // Handle drag and drop for color images
  const handleColorImageDrop = (color: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      handleImageUpload(color, imageFiles);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-[#5A9BD8]', 'bg-blue-50');
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-[#5A9BD8]', 'bg-blue-50');
  };

  // Remove image from a color
  const removeColorImage = (color: string, index: number) => {
    setColorImageMap(prev => {
      const colorData = {...prev[color]};
      
      // Revoke object URL if exists
      if (colorData.imageUrls?.[index]) {
        URL.revokeObjectURL(colorData.imageUrls[index]);
      }

      // Remove image
      colorData.images.splice(index, 1);
      colorData.imageUrls?.splice(index, 1);

      return {
        ...prev,
        [color]: colorData
      };
    });
  };

  // Remove entire color section
  const removeColorSection = (color: string) => {
    setColorImageMap(prev => {
      const newMap = {...prev};
      
      // Revoke all preview URLs
      newMap[color].images.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
      
      // Remove color
      delete newMap[color];
      
      return newMap;
    });
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

    // Validate color variants have images
    const hasColorImages = Object.values(colorImageMap).some(colorData => colorData.images.length > 0);
    if (!hasColorImages) {
      errors.colorImages = 'At least one color variant must have images';
    }

    // Validate each selected color has at least one image
    const colorsWithoutImages = Object.entries(colorImageMap).filter(([color, colorData]) => colorData.images.length === 0);
    if (colorsWithoutImages.length > 0) {
      errors.colorImages = `The following colors need at least one image: ${colorsWithoutImages.map(([color]) => color).join(', ')}`;
    }

    if (sizes.length === 0) {
      errors.sizes = 'At least one size must be selected';
    }

    return errors;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Add basic product details
      formData.append('name', name);
      formData.append('description', description);
      formData.append('srtDescription', additionalDetails); // Fixed: model expects srtDescription
      formData.append('category', category);
      formData.append('price', Number(price).toString()); // Ensure number
      formData.append('mrp', Number(mrp).toString()); // Ensure number
      formData.append('stock', '0'); // Added: required field in model
      formData.append('status', 'active'); // Added: required field in model
      formData.append('weight', productDetails.weight);
      formData.append('dimensions', productDetails.dimensions);
      formData.append('capacity', productDetails.capacity);
      formData.append('materials', productDetails.materials);
      formData.append('keyFeatures', JSON.stringify(keyFeatures.filter(f => f.trim())));
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('tags', JSON.stringify(tags));
      formData.append('offers', offers.toString());
      if (offers && salePrice) {
        formData.append('salePrice', Number(salePrice).toString()); // Ensure number
      }

      // No main product images - only color-specific images

      // Add color variants with images and stock
      const colorVariants = Object.entries(colorImageMap).map(([colorName, colorData]) => ({
        colorName,
        colorCode: colorData.hex,
        stock: Number(colorData.stock), // Convert string to number
        isActive: true
      }));

      console.log('Color variants before stringify:', colorVariants);
      formData.append('colorVariants', JSON.stringify(colorVariants));

      // Add color-specific images
      Object.entries(colorImageMap).forEach(([color, colorData]) => {
        colorData.images.forEach((file, index) => {
          const fieldName = `colorVariantImages[${color}][${index}]`;
          formData.append(fieldName, file);
        });
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Submit product
      console.log('Submitting product with FormData...');
      const response = await addVendorProduct(formData);
      console.log('Product submission successful:', response);
      
      toast.success('Product added successfully');
      router.push('/admin/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error?.response?.data?.message || 'Failed to add product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="min-h-screen bg-[#f4f8fb] text-black py-8 px-2 md:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#357ab8] mb-2">Add New Product</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>Your product will be reviewed by admin before being published. This usually takes 24-48 hours.</span>
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

            {/* Category */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Category</h2>
              
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
                        <Trash2 className="h-5 w-5" />
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
                        {colorData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
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
                        {colorData.images.length < 4 && (
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-24 cursor-pointer hover:border-[#5A9BD8] transition-colors"
                            onDrop={(e) => handleColorImageDrop(color, e)}
                            onDragOver={handleDragOver}
                          >
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
                                Max 4 per color ({colorData.images.length}/4)
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

            {fieldErrors.colorImages && (
              <div className="text-red-600 font-medium bg-red-50 p-3 rounded-lg mb-4">
                {fieldErrors.colorImages}
              </div>
            )}

            {error && <div className="text-red-600 font-medium bg-red-50 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 font-medium bg-green-50 p-3 rounded-lg">Product added successfully! Redirecting...</div>}
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
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </VendorLayout>
  );
} 