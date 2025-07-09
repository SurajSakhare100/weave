import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import VendorLayout from '@/components/VendorLayout';
import { createProduct } from '@/services/vendorService';
import api from '@/services/api';
import { Plus, Upload, Info, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const SIZE_OPTIONS = [
  'Extra small', 'Small', 'Medium', 'Large', 'Extra Large'
];
const COLOR_OPTIONS = [
  'Black', 'White', 'Beige', 'Tan', 'Brown', 'Grey'
];

export default function VendorAddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [offers, setOffers] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Load categories
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
    setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
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
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('srtDescription', additionalDetails);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('offers', String(offers));
      formData.append('salePrice', salePrice);
      formData.append('productDetails', JSON.stringify(productDetails));
      keyFeatures.forEach((f, i) => formData.append(`keyFeature${i+1}`, f));
      sizes.forEach(size => formData.append('sizes', size));
      colors.forEach(color => formData.append('colors', color));
      tags.forEach(tag => formData.append('tags', tag));
      images.forEach(img => formData.append('images', img));
      await createProduct(formData);
      setSuccess(true);
      setTimeout(() => router.push('/vendor/products'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };


  
  return (
    <VendorLayout>
      <div className="min-h-screen bg-[#f4f8fb] text-black py-8 px-2 md:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#357ab8] mb-8">Product</h1>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Name & Description */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Name & description</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-2">
                  Product title
                  <span className="text-xs text-gray-400">Maximum 100 characters. No HTML or emoji allowed</span>
                </label>
                <input maxLength={100} required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" placeholder="Input your text" />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Description <Info className="h-4 w-4 text-gray-400" />
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb]" />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">
                  Additional details <Info className="h-4 w-4 text-gray-400" />
                </label>
                <textarea value={additionalDetails} onChange={e => setAdditionalDetails(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] bg-[#f4f8fb]" />
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
                <label className="block font-medium mb-1 flex items-center gap-1">Cover images <Info className="h-4 w-4 text-gray-400" /></label>
                <div className="bg-[#f4f8fb] border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="product-images" />
                  <label htmlFor="product-images" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-[#5A9BD8] mb-2" />
                    <span className="text-[#5A9BD8] font-medium">Click or drop image</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 text-gray-500 hover:text-red-500"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">Category <Info className="h-4 w-4 text-gray-400" /></label>
                <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]">
                  <option value="" disabled>Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* Price */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Price</h2>
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">Price <Info className="h-4 w-4 text-gray-400" /></label>
                <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                <input required type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">Offers <Info className="h-4 w-4 text-gray-400" /></label>
                <input type="checkbox" checked={offers} onChange={e => setOffers(e.target.checked)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <label className="block font-medium mb-1 flex items-center gap-1">Sale Price <Info className="h-4 w-4 text-gray-400" /></label>
                <span className="inline-block px-3 py-2 bg-[#f4f8fb] border border-gray-200 rounded-lg">₹</span>
                <input type="number" min={0} value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A9BD8]" />
              </div>
            </section>

            {/* Category & Attributes */}
            <section>
              <h2 className="text-xl font-semibold text-[#357ab8] mb-4">Category & attributes</h2>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">Size <Info className="h-4 w-4 text-gray-400" /></label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {SIZE_OPTIONS.map(size => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sizes.includes(size)} onChange={() => handleSizeToggle(size)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">Color <Info className="h-4 w-4 text-gray-400" /></label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={colors.includes(color)} onChange={() => handleColorToggle(color)} className="form-checkbox h-5 w-5 text-[#5A9BD8]" />
                      {color}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-1">Tags <Info className="h-4 w-4 text-gray-400" /></label>
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

            {error && <div className="text-red-600 font-medium">{error}</div>}
            {success && <div className="text-green-600 font-medium">Product added successfully!</div>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#5A9BD8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
} 