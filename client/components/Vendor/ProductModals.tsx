import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import { setError } from '../../features/vendor/vendorSlice';
import { createProduct, updateProduct, deleteProduct } from '../../services/vendorService';
import { 
  X, 
  Package, 
  Save,
  Trash2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import api from '@/services/api';
import type { Product, ProductImage } from '@/types';

// Place these at the top of the file
const SIZE_OPTIONS = [
  'Extra small', 'Small', 'Medium', 'Large', 'Extra Large'
];
const COLOR_OPTIONS = [
  'Black', 'White', 'Beige', 'Tan', 'Brown', 'Grey'
];

// Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

// Category API response type
type CategoryApiResponse = {
  data: Category[];
};

// Add this above the AddProductModal
const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#795548', '#9C27B0', '#3F51B5', '#2196F3', '#4CAF50', '#FF9800', '#FFC107', '#E91E63',
];

function ColorPalette({ selectedColors, setSelectedColors }: { selectedColors: string[], setSelectedColors: (colors: string[]) => void }) {
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {COLOR_PALETTE.map(color => (
        <button
          key={color}
          type="button"
          className={`w-6 h-6 rounded-full border-2 ${selectedColors.includes(color) ? 'border-[#EE346C] scale-110' : 'border-gray-300'} transition-transform`}
          style={{ backgroundColor: color }}
          onClick={() => toggleColor(color)}
          aria-label={color}
        />
      ))}
    </div>
  );
}

// Add Product Modal
export const AddProductModal = ({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const dispatch = useDispatch();
  // Individual state for each input
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [allowReturn, setAllowReturn] = useState(true);
  const [allowCancellation, setAllowCancellation] = useState(true);
  const [available, setAvailable] = useState('true');
  const [colors, setColors] = useState<string[]>([]);
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('active');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLocalLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await api.get<CategoryApiResponse>('/categories');
      setCategories(data.data || []);
      if (data.data && data.data.length === 0) {
        setCategories([
          { _id: 'default', name: 'General', slug: 'general' }
        ]);
      }
    } catch {
      setCategories([
        { _id: 'default', name: 'General', slug: 'general' }
      ]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('price', price);
      formDataToSend.append('mrp', mrp);
      formDataToSend.append('discount', discount.toString());
      formDataToSend.append('category', category);
      formDataToSend.append('description', description);
      formDataToSend.append('pickup_location', pickupLocation);
      formDataToSend.append('return', allowReturn.toString());
      formDataToSend.append('cancellation', allowCancellation.toString());
      formDataToSend.append('available', available);
      formDataToSend.append('status', status);
      formDataToSend.append('stock', stock);
      colors.forEach(color => formDataToSend.append('colors', color));
      images.forEach(image => formDataToSend.append('images', image));
      await createProduct(formDataToSend);
      onSuccess();
      onClose();
      resetForm();
    } catch (error: unknown) {
      let errorMessage = 'Failed to create product';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        errorMessage = (error as { response: { data: { message: string } } }).response.data.message;
      }
      dispatch(setError(errorMessage));
    } finally {
      setLocalLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setMrp('');
    setDiscount(0);
    setCategory('');
    setDescription('');
    setPickupLocation('');
    setAllowReturn(true);
    setAllowCancellation(true);
    setAvailable('true');
    setColors([]);
    setStock('');
    setStatus('active');
    setImages([]);
    setImagePreviews([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-[10000]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Add New Product
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MRP (₹) *</label>
                  <input type="number" required value={mrp} onChange={e => setMrp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Colors</label>
                  <ColorPalette selectedColors={colors} setSelectedColors={setColors} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter product description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                <input type="text" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Enter pickup location" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input type="checkbox" id="return" checked={allowReturn} onChange={e => setAllowReturn(e.target.checked)} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                  <label htmlFor="return" className="ml-2 text-sm text-gray-700">Allow Returns</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="cancellation" checked={allowCancellation} onChange={e => setAllowCancellation(e.target.checked)} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
                  <label htmlFor="cancellation" className="ml-2 text-sm text-gray-700">Allow Cancellation</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full"
                  required={false}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={src} className="relative w-20 h-20">
                      <Image src={src} alt="Preview" width={80} height={80} className="object-cover w-full h-full rounded" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center">
                  {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</>) : (<><Save className="h-4 w-4 mr-2" />Create Product</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Product Modal
export const EditProductModal = ({ isOpen, onClose, onSuccess, product }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}) => {
  // Move hooks to the top
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  // Form fields
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [additionalDetails, setAdditionalDetails] = useState(product?.srtDescription || '');
  const [productDetails, setProductDetails] = useState(product?.productDetails || { weight: '', dimensions: '', capacity: '', materials: '' });
  const [keyFeatures, setKeyFeatures] = useState(product?.keyFeatures || ['', '', '', '']);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [mrp, setMrp] = useState(product?.mrp?.toString() || '');
  const [offers, setOffers] = useState(!!product?.offers);
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '');
  const [category, setCategory] = useState(product?.categorySlug || '');
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    });
  }, []);

  // Early return after hooks
  if (!isOpen || !product) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };
  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
  };
  const removeExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };
  const handleFeatureChange = (idx: number, value: string) => {
    setKeyFeatures((prev: string[]) => prev.map((f: string, i: number) => (i === idx ? value : f)));
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
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    // Client-side validation
    const newErrors: {[key: string]: string} = {};
    if (!name.trim()) newErrors.name = 'Product name is required.';
    if (!price || isNaN(Number(price)) || Number(price) < 0) newErrors.price = 'Valid price is required.';
    if (!mrp || isNaN(Number(mrp)) || Number(mrp) < 0) newErrors.mrp = 'Valid MRP is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (images.length === 0 && (!existingImages || existingImages.length === 0)) newErrors.images = 'At least one image is required.';
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('srtDescription', additionalDetails);
      formData.append('price', price);
      formData.append('mrp', mrp);
      formData.append('category', category);
      formData.append('offers', String(offers));
      formData.append('salePrice', salePrice);
      formData.append('productDetails', JSON.stringify(productDetails));
      keyFeatures.forEach((f, i) => formData.append(`keyFeature${i+1}`, f));
      sizes.forEach(size => formData.append('sizes', size));
      colors.forEach(color => formData.append('colors', color));
      tags.forEach(tag => formData.append('tags', tag));
      formData.append('existingImages', JSON.stringify(existingImages));
      images.forEach(img => formData.append('images', img));
      await updateProduct(product._id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      dispatch(setError(error?.response?.data?.message || 'Failed to update product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-[10000]">
          <div className="bg-white px-8 pt-8 pb-4 sm:p-8 sm:pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#357ab8] flex items-center">Edit Product</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Name & Description */}
              <section>
                <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Name & description</h2>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-2">Product title</label>
                  <input maxLength={100} required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" placeholder="Input your text" />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb]" />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Additional details</label>
                  <textarea value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1 flex items-center gap-1">Product details</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={productDetails.weight} onChange={e => setProductDetails({ ...productDetails, weight: e.target.value })} placeholder="Weight" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                      <input value={productDetails.dimensions} onChange={e => setProductDetails({ ...productDetails, dimensions: e.target.value })} placeholder="Dimensions" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                      <input value={productDetails.capacity} onChange={e => setProductDetails({ ...productDetails, capacity: e.target.value })} placeholder="Capacity" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                      <input value={productDetails.materials} onChange={e => setProductDetails({ ...productDetails, materials: e.target.value })} placeholder="Materials" className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5A9BD8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 flex items-center gap-1">Key features</label>
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
                  <label className="block font-medium mb-1 flex items-center gap-1">Cover images</label>
                  <div className="bg-[#f4f8fb] border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="product-images-edit" />
                    <label htmlFor="product-images-edit" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-[#5A9BD8] mb-2" />
                      <span className="text-[#5A9BD8] font-medium">Click or drop image</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img.url} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-gray-500 hover:text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img src={src} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-gray-500 hover:text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {fieldErrors.images && <div className="text-red-600 text-sm mt-1">{fieldErrors.images}</div>}
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]">
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
                <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Price</h2>
                <div className="mb-4 flex items-center gap-2">
                  <label className="block font-medium mb-1 flex items-center gap-1">Price</label>
                  <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                  <input required type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" />
                  {fieldErrors.price && <div className="text-red-600 text-sm mt-1">{fieldErrors.price}</div>}
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <label className="block font-medium mb-1 flex items-center gap-1">MRP</label>
                  <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                  <input required type="number" min={0} value={mrp} onChange={e => setMrp(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" />
                  {fieldErrors.mrp && <div className="text-red-600 text-sm mt-1">{fieldErrors.mrp}</div>}
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <label className="block font-medium mb-1 flex items-center gap-1">Offers</label>
                  <input type="checkbox" checked={offers} onChange={e => setOffers(e.target.checked)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <label className="block font-medium mb-1 flex items-center gap-1">Sale Price</label>
                  <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                  <input type="number" min={0} value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" />
                </div>
              </section>
              {/* Category & Attributes */}
              <section>
                <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Category & attributes</h2>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Size</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {SIZE_OPTIONS.map((size: string) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={sizes.includes(size)} onChange={() => handleSizeToggle(size)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Color</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {COLOR_OPTIONS.map((color: string) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={colors.includes(color)} onChange={() => handleColorToggle(color)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
                        {color}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1 flex items-center gap-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span key={tag} className="bg-[#5A9BD8] text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-white hover:text-red-200"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    placeholder="Enter tags to describe your item"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]"
                  />
                </div>
              </section>
              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#5A9BD8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Product Modal
export const DeleteProductModal = ({ isOpen, onClose, onSuccess, product }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}) => {
  // Move hooks to the top
  const dispatch = useDispatch();
  const [loading, setLocalLoading] = useState(false);

  // Early return after hooks
  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    if (!product) return;
    
    setLocalLoading(true);
    try {
      await deleteProduct(product._id);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete product';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        errorMessage = (error as { response: { data: { message: string } } }).response.data.message;
      }
      dispatch(setError(errorMessage));
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Product
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 