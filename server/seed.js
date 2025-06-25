import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weave';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  await Vendor.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});
  await Order.deleteMany({});

  // Create vendors
  const vendor = await Vendor.create({
    name: 'Demo Vendor',
    email: 'vendor@example.com',
    password: 'password123',
    number: '1234567890',
    accept: true
  });

  // Create categories
  const category = await Category.create({
    name: 'Tote Bags',
    file: null,
    header: 'true',
    mainSub: [],
    sub: []
  });

  // Create products
  const products = await Product.insertMany([
    {
      name: 'Rainbow Tote',
      slug: 'rainbow-tote',
      price: 1999,
      mrp: 2499,
      discount: 20,
      vendorId: vendor._id,
      vendor: true,
      available: 'true',
      category: category.name,
      categorySlug: 'tote-bags',
      srtDescription: 'A colorful tote bag.',
      description: 'A beautiful handwoven rainbow tote bag.',
      seoDescription: 'Rainbow tote bag for summer.',
      seoKeyword: 'tote, rainbow, bag',
      seoTitle: 'Rainbow Tote',
      pickup_location: 'Warehouse 1',
      return: true,
      cancellation: true,
      files: [],
      variant: false,
      variantDetails: [],
      reviews: [],
      colors: ['red', 'blue', 'green'],
      stock: 10,
      totalReviews: 5,
      averageRating: 4.5,
      status: 'active',
      currVariantSize: 'M'
    },
    {
      name: 'Classic Black Tote',
      slug: 'classic-black-tote',
      price: 1499,
      mrp: 1999,
      discount: 25,
      vendorId: vendor._id,
      vendor: true,
      available: 'true',
      category: category.name,
      categorySlug: 'tote-bags',
      srtDescription: 'A classic black tote bag.',
      description: 'Elegant and versatile black tote.',
      seoDescription: 'Classic black tote bag.',
      seoKeyword: 'tote, black, bag',
      seoTitle: 'Classic Black Tote',
      pickup_location: 'Warehouse 1',
      return: true,
      cancellation: true,
      files: [],
      variant: false,
      variantDetails: [],
      reviews: [],
      colors: ['black'],
      stock: 15,
      totalReviews: 2,
      averageRating: 4.0,
      status: 'active',
      currVariantSize: 'L'
    },
    {
      name: 'Eco Green Tote',
      slug: 'eco-green-tote',
      price: 1299,
      mrp: 1799,
      discount: 28,
      vendorId: vendor._id,
      vendor: true,
      available: 'true',
      category: category.name,
      categorySlug: 'tote-bags',
      srtDescription: 'Eco-friendly green tote.',
      description: 'Sustainable and stylish green tote.',
      seoDescription: 'Eco green tote bag.',
      seoKeyword: 'tote, green, eco',
      seoTitle: 'Eco Green Tote',
      pickup_location: 'Warehouse 1',
      return: true,
      cancellation: true,
      files: [],
      variant: false,
      variantDetails: [],
      reviews: [],
      colors: ['green'],
      stock: 8,
      totalReviews: 1,
      averageRating: 5.0,
      status: 'active',
      currVariantSize: 'S'
    },
    {
      name: 'Sunshine Yellow Tote',
      slug: 'sunshine-yellow-tote',
      price: 1599,
      mrp: 2099,
      discount: 24,
      vendorId: vendor._id,
      vendor: true,
      available: 'true',
      category: category.name,
      categorySlug: 'tote-bags',
      srtDescription: 'Bright yellow tote bag.',
      description: 'Cheerful and practical yellow tote.',
      seoDescription: 'Sunshine yellow tote bag.',
      seoKeyword: 'tote, yellow, bag',
      seoTitle: 'Sunshine Yellow Tote',
      pickup_location: 'Warehouse 1',
      return: true,
      cancellation: true,
      files: [],
      variant: false,
      variantDetails: [],
      reviews: [],
      colors: ['yellow'],
      stock: 12,
      totalReviews: 3,
      averageRating: 4.2,
      status: 'active',
      currVariantSize: 'M'
    }
  ]);

  // Create users
  const user1 = await User.create({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'alice@example.com',
    number: '1111111111',
  });
  const user2 = await User.create({
    name: 'Bob',
    email: 'bob@example.com',
    password: 'password123',
    number: '2222222222',
  });

  // Create orders
  await Order.create({
    _id: user1._id,
    order: [
      {
        product: products[0]._id,
        proName: products[0].name,
        quantity: 2,
        price: products[0].price,
        mrp: products[0].mrp,
        variantSize: products[0].currVariantSize,
        OrderStatus: 'Pending',
        secretOrderId: 'ORD001',
        pickup_location: products[0].pickup_location,
        vendorId: vendor._id,
        selling_price: products[0].price,
        discount: products[0].discount,
        payId: 'PAY001',
        return: false,
        cancellation: false,
        slug: products[0].slug,
        files: [],
        uni_id_Mix: '',
        order_id_shiprocket: '',
        shipment_id: '',
        date: new Date().toLocaleString('en-IN'),
        details: {},
        returnReason: '',
        updated: '',
        shipment_track_activities: [],
        etd: '',
        track_url: '',
        payStatus: 'Pending',
      }
    ]
  });
  await Order.create({
    _id: user2._id,
    order: [
      {
        product: products[1]._id,
        proName: products[1].name,
        quantity: 1,
        price: products[1].price,
        mrp: products[1].mrp,
        variantSize: products[1].currVariantSize,
        OrderStatus: 'Pending',
        secretOrderId: 'ORD002',
        pickup_location: products[1].pickup_location,
        vendorId: vendor._id,
        selling_price: products[1].price,
        discount: products[1].discount,
        payId: 'PAY002',
        return: false,
        cancellation: false,
        slug: products[1].slug,
        files: [],
        uni_id_Mix: '',
        order_id_shiprocket: '',
        shipment_id: '',
        date: new Date().toLocaleString('en-IN'),
        details: {},
        returnReason: '',
        updated: '',
        shipment_track_activities: [],
        etd: '',
        track_url: '',
        payStatus: 'Pending',
      }
    ]
  });

  console.log('Seed data inserted!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 