import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const products = [
  {
    _id: '1',
    name: 'Bag name',
    price: 1999,
    mrp: 1999,
    available: 'true',
    stock: 10,
    colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'],
    Images: ['/products/product.png'],
    averageRating: 5,
    totalReviews: 745,
    slug: 'bag-1',
    discount: 0,
    vendorId: '',
    vendor: {},
    description: '',
    pickup_location: '',
    return: true,
    cancellation: true,
    category: 'Tote',
    variant: false,
    variantDetails: [],
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    _id: '2',
    name: 'Bag name',
    price: 1999,
    mrp: 1999,
    available: 'true',
    stock: 10,
    colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'],
    Images: ['/products/product.png'],
    averageRating: 5,
    totalReviews: 745,
    slug: 'bag-2',
    discount: 0,
    vendorId: '',
    vendor: {},
    description: '',
    pickup_location: '',
    return: true,
    cancellation: true,
    category: 'Tote',
    variant: false,
    variantDetails: [],
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    _id: '3',
    name: 'Bag name',
    price: 1999,
    mrp: 1999,
    available: 'true',
    stock: 10,
    colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'],
    Images: ['/products/product.png'],
    averageRating: 5,
    totalReviews: 745,
    slug: 'bag-3',
    discount: 0,
    vendorId: '',
    vendor: {},
    description: '',
    pickup_location: '',
    return: true,
    cancellation: true,
    category: 'Tote',
    variant: false,
    variantDetails: [],
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
  {
    _id: '4',
    name: 'Bag name',
    price: 1999,
    mrp: 1999,
    available: 'true',
    stock: 10,
    colors: ['#D93B65', '#1E1E1E', '#7B5B4D', '#4D7B6B', '#C76A3D', '#6B7B4D'],
    Images: ['/products/product.png'],
    averageRating: 5,
    totalReviews: 745,
    slug: 'bag-4',
    discount: 0,
    vendorId: '',
    vendor: {},
    description: '',
    pickup_location: '',
    return: true,
    cancellation: true,
    category: 'Tote',
    variant: false,
    variantDetails: [],
    createdAt: '',
    updatedAt: '',
    status: 'active'
  },
];

const Bestsellers = () => {
  return (
    <section className="py-16 bg-[#faf5f2]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Bestsellers</h2>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-pink-500 hover:underline">View All</a>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers; 