import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './models/Vendor.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import { uploadImage } from './utils/imageUpload.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

// 12 unique Unsplash tote bag images
const toteBagImages = [
  {
    url: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQOqOMml3E9w5F2yU0gOglyCm0K2xqmVQrmH7-ClynSh9cLtHqC1xF3V8wdAYIjqw9XYDMU2lVt1FnqRLx2Ox5fH4s0VuUS66nGhNxBO26hkuM7vvc3OAsk',
    name: 'Canvas Eco Tote'
  },
  {
    url: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRmBc0s6JYLCVRfD6WqQ4WSHYs7BW9MYeBdRwfO4fZiO5DnT9FY1uMAGBVDPAJv0IB7rxd38i93xQUjerNf-kCgZ-Ngh1NQuKxW1k6Jf4kW',
    name: 'Leather Crossbody Tote'
  },
  {
    url: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRZuxn-9kmygF_nhMUAvV0xHSWE38wIIH_M98ynnrRlfq3W_qvuE1sk-SU9RSeMFmMr-EzDBOI6OphROP2VqEhuqIiv0W6CRCbmHZ50nvKV9t4_-Ngxpazu',
    name: 'Woven Straw Beach Tote'
  },
  {
    url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSMant6s7q0njzihPsZVsAw48SZoE5Z5s5MfEDAe6IXik0wmwxo39f4jmCu-2Leo3Kl0p0Oz7r6yQNNhov3o_88tJB1kQLhSkvGIXXHct_Wf4-QA200sEwMPw',
    name: 'Denim Utility Tote'
  },
  {
    url: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRrzAly72-uHu9clHHxUuLYmi7LesHTLY0gFAYnplLMPeS8mXfeBp9Afx_qK1t833XG5uGzDIrxcEM1z_KMalThu6O3Ua8JacRtYUBB0kzqiULQpYDma2-GAQ',
    name: 'Jute Market Tote'
  },
  {
    url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTgVvmbPEQ2vPYtXUmQOcQ9zWiHJRs3zy-WeYTZojRTCEVh_uTpoc6qKgUjEFTvSPG_HW5wC_ba-Uy9NJ1YC5MnK6tqIiuGrr0Wuvskojr4qsgIbC1rP7JT',
    name: 'Linen Boho Tote'
  },
  {
    url: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS0VdlDyrF8Ca7eMrxwZH-x78ONdOvQV8TfvBZ6itX9ZiQAi6cZ6TP_zuAJK3foJaZMxZQeRRCiINXcNZe-RP4Z24KNQPk3NE9SuqQkqWNjnhn0Ua5mWA3iyQ',
    name: 'Recycled Plastic Tote'
  },
  {
    url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSMC34xjYSxf8RqRmr4KEVbcACugm3tEo9P8ZGlPSEByEefLFMFECetng5ch5BmVunq6dvWFizgwMbjuvZ7w95A4Q7JCaoYd8cRYSqPryXUwK1u9CxJRSRRAQ',
    name: 'Cotton Quilted Tote'
  },
  {
    url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop',
    name: 'Hemp Garden Tote'
  },
  {
    url: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT_SugBKdVMmixwBRUO5AfZl8gT8GY6fZtN7pIPnaxAGIzOr_SoMDgw9A-EgAlC5OPC4tSTtXwAvee7M1JBo_Ka8bVOIa7VdpYIoZlZHdQ',
    name: 'Velvet Evening Tote'
  },
  {
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop',
    name: 'Waxed Canvas Work Tote'
  },
  {
    url: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR2hIS5iQ_TvMRsfahiNbLRJWh0ZAS_SMjqy2aNXvdTLgkQy46BPDFuACdew6-IoSfd1GzjhTylaTgd-mWRdeIuFo37K0F05LrQHXlUqW-G9qztcR7QKb1YnV8',
    name: 'Canvas Shopping Tote'
  }
];

// Function to fetch image buffer from URL
async function fetchImageBuffer(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error);
    throw error;
  }
}

// Function to upload image to Cloudinary
async function uploadImageToCloudinary(imageUrl, productName) {
  try {
    console.log(`Uploading image for ${productName}...`);
    const imageBuffer = await fetchImageBuffer(imageUrl);
    const result = await uploadImage(imageBuffer, 'weave-products', `seed_${productName.toLowerCase().replace(/\s+/g, '_')}`);
    console.log(`Successfully uploaded image for ${productName}`);
    return result;
  } catch (error) {
    console.error(`Failed to upload image for ${productName}:`, error);
    // Return a fallback image structure if upload fails
    return {
      url: imageUrl,
      public_id: `fallback_${productName.toLowerCase().replace(/\s+/g, '_')}`,
      width: 800,
      height: 600,
      format: 'jpg',
      bytes: 50000,
      thumbnail_url: imageUrl,
      small_thumbnail_url: imageUrl,
      is_primary: true
    };
  }
}

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

  // Product data with unique details
  const productData = [
    {
      name: 'Canvas Eco Tote Bag',
      slug: 'canvas-eco-tote-bag',
      price: 899,
      mrp: 1299,
      discount: 31,
      srtDescription: 'Sustainable canvas tote bag perfect for shopping and daily use.',
      description: 'Made from 100% organic cotton canvas, this eco-friendly tote bag is both stylish and sustainable. Perfect for grocery shopping, beach trips, or everyday use. Features reinforced handles and spacious interior.',
      colors: ['natural', 'beige'],
      stock: 25,
      totalReviews: 8,
      averageRating: 4.6,
      keyFeatures: ['Eco-friendly', 'Reinforced handles', 'Spacious interior', 'Machine washable'],
      productDetails: {
        weight: '250g',
        dimensions: '40cm x 35cm x 12cm',
        capacity: '15L',
        materials: '100% Organic Cotton Canvas'
      },
      tags: ['eco-friendly', 'canvas', 'shopping', 'sustainable']
    },
    {
      name: 'Leather Crossbody Tote',
      slug: 'leather-crossbody-tote',
      price: 2499,
      mrp: 3499,
      discount: 29,
      srtDescription: 'Premium leather crossbody tote with adjustable strap.',
      description: 'Crafted from genuine leather, this crossbody tote combines elegance with functionality. Features an adjustable strap, multiple compartments, and a timeless design that complements any outfit.',
      colors: ['brown', 'black'],
      stock: 15,
      totalReviews: 12,
      averageRating: 4.8,
      keyFeatures: ['Genuine leather', 'Adjustable strap', 'Multiple compartments', 'Timeless design'],
      productDetails: {
        weight: '450g',
        dimensions: '35cm x 25cm x 8cm',
        capacity: '8L',
        materials: 'Genuine Leather'
      },
      tags: ['leather', 'crossbody', 'premium', 'elegant']
    },
    {
      name: 'Woven Straw Beach Tote',
      slug: 'woven-straw-beach-tote',
      price: 699,
      mrp: 999,
      discount: 30,
      srtDescription: 'Handwoven straw tote perfect for beach days and summer outings.',
      description: 'Beautifully handwoven from natural straw, this beach tote is perfect for carrying towels, sunscreen, and beach essentials. Lightweight and breathable design with comfortable handles.',
      colors: ['natural', 'cream'],
      stock: 30,
      totalReviews: 6,
      averageRating: 4.4,
      keyFeatures: ['Handwoven straw', 'Lightweight', 'Beach-friendly', 'Natural material'],
      productDetails: {
        weight: '180g',
        dimensions: '45cm x 30cm x 15cm',
        capacity: '12L',
        materials: 'Natural Straw'
      },
      tags: ['straw', 'beach', 'summer', 'natural']
    },
    {
      name: 'Denim Utility Tote',
      slug: 'denim-utility-tote',
      price: 1199,
      mrp: 1599,
      discount: 25,
      srtDescription: 'Durable denim tote with multiple pockets for everyday utility.',
      description: 'Made from premium denim, this utility tote features multiple pockets and compartments for organized storage. Perfect for work, school, or daily errands with a casual, stylish look.',
      colors: ['blue', 'black'],
      stock: 20,
      totalReviews: 10,
      averageRating: 4.5,
      keyFeatures: ['Premium denim', 'Multiple pockets', 'Durable construction', 'Casual style'],
      productDetails: {
        weight: '320g',
        dimensions: '38cm x 28cm x 10cm',
        capacity: '10L',
        materials: 'Premium Denim'
      },
      tags: ['denim', 'utility', 'pockets', 'casual']
    },
    {
      name: 'Jute Market Tote',
      slug: 'jute-market-tote',
      price: 599,
      mrp: 899,
      discount: 33,
      srtDescription: 'Eco-friendly jute tote perfect for farmers markets and grocery shopping.',
      description: 'Sustainable jute tote bag ideal for carrying fresh produce, groceries, and market finds. Natural fiber construction with reinforced handles for heavy loads.',
      colors: ['natural', 'brown'],
      stock: 35,
      totalReviews: 15,
      averageRating: 4.7,
      keyFeatures: ['Natural jute', 'Reinforced handles', 'Large capacity', 'Eco-friendly'],
      productDetails: {
        weight: '280g',
        dimensions: '42cm x 32cm x 14cm',
        capacity: '18L',
        materials: 'Natural Jute'
      },
      tags: ['jute', 'market', 'eco-friendly', 'grocery']
    },
    {
      name: 'Linen Boho Tote',
      slug: 'linen-boho-tote',
      price: 1499,
      mrp: 1999,
      discount: 25,
      srtDescription: 'Bohemian-style linen tote with embroidered details.',
      description: 'Beautiful linen tote with hand-embroidered bohemian patterns. Lightweight and breathable fabric perfect for summer days, festivals, and casual outings.',
      colors: ['white', 'beige', 'pink'],
      stock: 18,
      totalReviews: 9,
      averageRating: 4.6,
      keyFeatures: ['Premium linen', 'Hand-embroidered', 'Bohemian design', 'Breathable'],
      productDetails: {
        weight: '220g',
        dimensions: '36cm x 26cm x 8cm',
        capacity: '7L',
        materials: 'Premium Linen'
      },
      tags: ['linen', 'boho', 'embroidered', 'summer']
    },
    {
      name: 'Recycled Plastic Tote',
      slug: 'recycled-plastic-tote',
      price: 799,
      mrp: 1199,
      discount: 33,
      srtDescription: 'Waterproof tote made from recycled plastic bottles.',
      description: 'Eco-conscious tote crafted from recycled plastic bottles. Waterproof and durable, perfect for beach trips, pool days, or rainy weather. Helps reduce plastic waste.',
      colors: ['blue', 'green', 'gray'],
      stock: 22,
      totalReviews: 7,
      averageRating: 4.3,
      keyFeatures: ['Recycled material', 'Waterproof', 'Durable', 'Eco-friendly'],
      productDetails: {
        weight: '150g',
        dimensions: '40cm x 30cm x 12cm',
        capacity: '14L',
        materials: 'Recycled Plastic Bottles'
      },
      tags: ['recycled', 'waterproof', 'eco-friendly', 'beach']
    },
    {
      name: 'Cotton Quilted Tote',
      slug: 'cotton-quilted-tote',
      price: 1299,
      mrp: 1799,
      discount: 28,
      srtDescription: 'Soft quilted cotton tote with padded interior for delicate items.',
      description: 'Luxuriously soft quilted cotton tote with padded interior perfect for carrying laptops, books, or delicate items. Elegant design with comfortable shoulder straps.',
      colors: ['white', 'gray', 'navy'],
      stock: 16,
      totalReviews: 11,
      averageRating: 4.7,
      keyFeatures: ['Quilted cotton', 'Padded interior', 'Shoulder straps', 'Laptop friendly'],
      productDetails: {
        weight: '380g',
        dimensions: '34cm x 24cm x 10cm',
        capacity: '8L',
        materials: 'Premium Cotton'
      },
      tags: ['quilted', 'cotton', 'padded', 'laptop']
    },
    {
      name: 'Hemp Garden Tote',
      slug: 'hemp-garden-tote',
      price: 999,
      mrp: 1399,
      discount: 29,
      srtDescription: 'Durable hemp tote with garden tool pockets.',
      description: 'Strong hemp tote designed for gardening with specialized pockets for tools, seeds, and gloves. Natural fiber construction that gets softer with use.',
      colors: ['natural', 'olive'],
      stock: 12,
      totalReviews: 5,
      averageRating: 4.5,
      keyFeatures: ['Hemp fiber', 'Tool pockets', 'Durable', 'Garden-friendly'],
      productDetails: {
        weight: '420g',
        dimensions: '44cm x 30cm x 16cm',
        capacity: '20L',
        materials: 'Natural Hemp'
      },
      tags: ['hemp', 'garden', 'tools', 'natural']
    },
    {
      name: 'Velvet Evening Tote',
      slug: 'velvet-evening-tote',
      price: 1899,
      mrp: 2599,
      discount: 27,
      srtDescription: 'Luxurious velvet tote perfect for evening events and special occasions.',
      description: 'Elegant velvet tote with metallic accents, perfect for evening events, parties, and special occasions. Soft, luxurious fabric with structured design.',
      colors: ['black', 'burgundy', 'navy'],
      stock: 10,
      totalReviews: 8,
      averageRating: 4.8,
      keyFeatures: ['Luxury velvet', 'Metallic accents', 'Evening design', 'Structured'],
      productDetails: {
        weight: '280g',
        dimensions: '28cm x 20cm x 6cm',
        capacity: '3L',
        materials: 'Premium Velvet'
      },
      tags: ['velvet', 'evening', 'luxury', 'elegant']
    },
    {
      name: 'Waxed Canvas Work Tote',
      slug: 'waxed-canvas-work-tote',
      price: 2199,
      mrp: 2999,
      discount: 27,
      srtDescription: 'Durable waxed canvas tote built for work and daily commutes.',
      description: 'Heavy-duty waxed canvas tote designed for work professionals. Water-resistant, durable construction with laptop compartment and organizational features.',
      colors: ['olive', 'brown', 'black'],
      stock: 14,
      totalReviews: 13,
      averageRating: 4.9,
      keyFeatures: ['Waxed canvas', 'Water-resistant', 'Laptop compartment', 'Professional'],
      productDetails: {
        weight: '520g',
        dimensions: '42cm x 30cm x 12cm',
        capacity: '15L',
        materials: 'Waxed Canvas'
      },
      tags: ['waxed canvas', 'work', 'professional', 'durable']
    },
    {
      name: 'Canvas Shopping Tote',
      slug: 'canvas-shopping-tote',
      price: 799,
      mrp: 1199,
      discount: 33,
      srtDescription: 'Versatile canvas shopping tote for everyday use.',
      description: 'Classic canvas shopping tote with sturdy construction and comfortable handles. Perfect for grocery shopping, library visits, or carrying everyday essentials.',
      colors: ['natural', 'navy', 'olive'],
      stock: 28,
      totalReviews: 14,
      averageRating: 4.6,
      keyFeatures: ['Sturdy canvas', 'Comfortable handles', 'Versatile design', 'Everyday use'],
      productDetails: {
        weight: '300g',
        dimensions: '38cm x 32cm x 10cm',
        capacity: '12L',
        materials: 'Heavy Duty Canvas'
      },
      tags: ['canvas', 'shopping', 'versatile', 'everyday']
    }
  ];

  // Upload images to Cloudinary and create products
  console.log('Uploading images to Cloudinary...');
  const products = [];
  
  for (let i = 0; i < productData.length; i++) {
    const productInfo = productData[i];
    const imageInfo = toteBagImages[i];
    
    try {
      // Upload image to Cloudinary
      const cloudinaryResult = await uploadImageToCloudinary(imageInfo.url, productInfo.name);
      
      // Create product with Cloudinary image data
      const product = await Product.create({
        ...productInfo,
        vendorId: vendor._id,
        vendor: true,
        available: 'true',
        category: category.name,
        categorySlug: 'tote-bags',
        seoDescription: productInfo.srtDescription,
        seoKeyword: productInfo.tags.join(', '),
        seoTitle: productInfo.name,
        pickup_location: 'Warehouse 1',
        return: true,
        cancellation: true,
        files: [],
        images: [{
          url: cloudinaryResult.url,
          public_id: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          thumbnail_url: cloudinaryResult.thumbnail_url || cloudinaryResult.url,
          small_thumbnail_url: cloudinaryResult.small_thumbnail_url || cloudinaryResult.url,
          is_primary: true
        }],
        variant: false,
        variantDetails: [],
        reviews: [],
        status: 'active',
        currVariantSize: 'M'
      });
      
      products.push(product);
      console.log(`Created product: ${productInfo.name}`);
    } catch (error) {
      console.error(`Failed to create product ${productInfo.name}:`, error);
    }
  }

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
          productId: products[4]._id,
          name: products[4].name,
          quantity: 1,
          price: products[4].price,
          mrp: products[4].mrp,
          variantSize: products[4].currVariantSize,
          image: products[4].images?.[0]?.url || ''
        },
        {
          productId: products[5]._id,
          name: products[5].name,
          quantity: 1,
          price: products[5].price,
          mrp: products[5].mrp,
          variantSize: products[5].currVariantSize,
          image: products[5].images?.[0]?.url || ''
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
      itemsPrice: products[4].price + products[5].price,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[4].price + products[5].price,
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
          productId: products[6]._id,
          name: products[6].name,
          quantity: 2,
          price: products[6].price,
          mrp: products[6].mrp,
          variantSize: products[6].currVariantSize,
          image: products[6].images?.[0]?.url || ''
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
      itemsPrice: products[6].price * 2,
      taxPrice: 0,
      shippingPrice: 0,
      discountAmount: 0,
      totalPrice: products[6].price * 2,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date('2024-04-20')
    }
  ];

  await Order.insertMany(orders);

  console.log('Seed data inserted successfully!');
  console.log('Vendor email: vendor@example.com');
  console.log('Vendor password: password123');
  console.log('User emails: alice@example.com, bob@example.com');
  console.log('User passwords: alice@example.com, password123');
  console.log(`Created ${products.length} tote bag products with Cloudinary images`);
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
}); 