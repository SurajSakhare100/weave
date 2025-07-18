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

  // Create orders with proper structure for earnings calculation
  const orders = [
    // Paid orders (contribute to totalEarnings)
    {
      user: user1._id,
      orderItems: [
        {
          productId: products[0]._id,
          name: products[0].name,
          quantity: 2,
          price: products[0].price,
          mrp: products[0].mrp,
          variantSize: products[0].currVariantSize,
          image: products[0].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Alice Johnson',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        pincode: '10001',
        phone: '1111111111'
      },
      paymentMethod: 'Credit Card',
      itemsPrice: products[0].price * 2,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[0].price * 2,
      isPaid: true,
      isDelivered: true,
      paidAt: new Date('2024-01-15'),
      deliveredAt: new Date('2024-01-20'),
      createdAt: new Date('2024-01-10')
    },
    {
      user: user2._id,
      orderItems: [
        {
          productId: products[1]._id,
          name: products[1].name,
          quantity: 1,
          price: products[1].price,
          mrp: products[1].mrp,
          variantSize: products[1].currVariantSize,
          image: products[1].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Bob Smith',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        pincode: '90210',
        phone: '2222222222'
      },
      paymentMethod: 'PayPal',
      itemsPrice: products[1].price,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[1].price,
      isPaid: true,
      isDelivered: true,
      paidAt: new Date('2024-02-10'),
      deliveredAt: new Date('2024-02-15'),
      createdAt: new Date('2024-02-05')
    },
    {
      user: user1._id,
      orderItems: [
        {
          productId: products[2]._id,
          name: products[2].name,
          quantity: 3,
          price: products[2].price,
          mrp: products[2].mrp,
          variantSize: products[2].currVariantSize,
          image: products[2].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Alice Johnson',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        pincode: '10001',
        phone: '1111111111'
      },
      paymentMethod: 'Credit Card',
      itemsPrice: products[2].price * 3,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[2].price * 3,
      isPaid: true,
      isDelivered: true,
      paidAt: new Date('2024-03-05'),
      deliveredAt: new Date('2024-03-10'),
      createdAt: new Date('2024-02-28')
    },
    // Pending orders (contribute to balance)
    {
      user: user2._id,
      orderItems: [
        {
          productId: products[3]._id,
          name: products[3].name,
          quantity: 2,
          price: products[3].price,
          mrp: products[3].mrp,
          variantSize: products[3].currVariantSize,
          image: products[3].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Bob Smith',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        pincode: '90210',
        phone: '2222222222'
      },
      paymentMethod: 'PayPal',
      itemsPrice: products[3].price * 2,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[3].price * 2,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date('2024-03-15')
    },
    // More orders for better data distribution
    {
      user: user1._id,
      orderItems: [
        {
          productId: products[0]._id,
          name: products[0].name,
          quantity: 1,
          price: products[0].price,
          mrp: products[0].mrp,
          variantSize: products[0].currVariantSize,
          image: products[0].images?.[0]?.url || ''
        },
        {
          productId: products[1]._id,
          name: products[1].name,
          quantity: 1,
          price: products[1].price,
          mrp: products[1].mrp,
          variantSize: products[1].currVariantSize,
          image: products[1].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Alice Johnson',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        pincode: '10001',
        phone: '1111111111'
      },
      paymentMethod: 'Credit Card',
      itemsPrice: products[0].price + products[1].price,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[0].price + products[1].price,
      isPaid: true,
      isDelivered: true,
      paidAt: new Date('2024-04-12'),
      deliveredAt: new Date('2024-04-18'),
      createdAt: new Date('2024-04-08')
    },
    {
      user: user2._id,
      orderItems: [
        {
          productId: products[2]._id,
          name: products[2].name,
          quantity: 2,
          price: products[2].price,
          mrp: products[2].mrp,
          variantSize: products[2].currVariantSize,
          image: products[2].images?.[0]?.url || ''
        }
      ],
      shippingAddress: {
        name: 'Bob Smith',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        pincode: '90210',
        phone: '2222222222'
      },
      paymentMethod: 'PayPal',
      itemsPrice: products[2].price * 2,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[2].price * 2,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date('2024-04-20')
    }
  ];

  await Order.insertMany(orders);

  console.log('Seed data inserted!');
  console.log('Vendor email: vendor@example.com');
  console.log('Vendor password: password123');
  console.log('User emails: alice@example.com, bob@example.com');
  console.log('User passwords: alice@example.com, password123');
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 