import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// Sample data
const sampleCategories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Books', slug: 'books' }
];

const sampleVendor = {
    name: 'Sample Vendor',
    email: 'vendor@example.com',
    password: 'password123',
    phone: '1234567890',
    adminApproved: true,
    isActive: true
};

const sampleAdmin = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
};

const sampleUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    password: 'user123',
    phone: '0987654321',
    isActive: true
};

const sampleProducts = [
  {
    name: 'Classic Canvas Tote Bag',
    price: 599,
    mrp: 899,
    category: 'Accessories',
    categorySlug: 'accessories',
    srtDescription: 'Durable and eco-friendly canvas tote for everyday use',
    description: 'A premium tote bag made from 100% organic cotton canvas. Designed to carry your daily essentials with style and strength.',
    seoDescription: 'Classic canvas tote bag made from eco-friendly materials – stylish, strong, and sustainable.',
    seoKeyword: 'canvas tote bag, eco-friendly bag, reusable tote, sustainable accessories',
    seoTitle: 'Classic Canvas Tote Bag - Sustainable Everyday Essential',
    pickup_location: 'Delhi Warehouse',
    return: true,
    cancellation: true,
    sizes: ['One Size'],
    status: 'active',
    adminApproved: true,
    adminApprovedAt: new Date(),
    available: true,
    vendor: true,
    keyFeatures: ['Organic Cotton', 'Reinforced Handles', 'Spacious Design', 'Machine Washable'],
    productDetails: {
      weight: '180g',
      dimensions: '40cm x 35cm x 10cm',
      capacity: '15L',
      materials: '100% Organic Cotton Canvas'
    },
    tags: ['eco-friendly', 'canvas', 'sustainable', 'reusable'],
    offers: true,
    salePrice: 499,
    colorVariants: [
      {
        colorName: 'Natural',
        colorCode: '#F5F5DC',
        stock: 40,
        price: 599,
        mrp: 899,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            public_id: 'tote_natural_unsplash',
            is_primary: true
          }
        ]
      },
      {
        colorName: 'Black',
        colorCode: '#000000',
        stock: 30,
        price: 599,
        mrp: 899,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
            public_id: 'tote_black_unsplash',
            is_primary: true
          }
        ]
      }
    ]
  },
  {
    name: 'Minimalist Cotton Tote Bag',
    price: 649,
    mrp: 999,
    category: 'Accessories',
    categorySlug: 'accessories',
    srtDescription: 'Sleek minimalist tote perfect for work or casual outings',
    description: 'A stylish tote bag designed with minimalism in mind. Crafted from premium cotton canvas with soft straps and ample space.',
    seoDescription: 'Minimalist cotton tote bag – elegant design, sustainable materials, and spacious layout.',
    seoKeyword: 'minimal tote bag, cotton tote, eco-friendly handbag, daily carry bag',
    seoTitle: 'Minimalist Cotton Tote Bag - Elegant & Eco-Friendly',
    pickup_location: 'Mumbai Warehouse',
    return: true,
    cancellation: true,
    sizes: ['One Size'],
    status: 'active',
    adminApproved: true,
    adminApprovedAt: new Date(),
    available: true,
    vendor: true,
    keyFeatures: ['Soft Cotton Canvas', 'Minimal Design', 'Reinforced Base', 'Eco-Friendly Material'],
    productDetails: {
      weight: '160g',
      dimensions: '38cm x 34cm x 10cm',
      capacity: '14L',
      materials: 'Cotton Canvas'
    },
    tags: ['minimal', 'cotton', 'eco', 'daily use'],
    offers: false,
    colorVariants: [
      {
        colorName: 'Beige',
        colorCode: '#F5F5DC',
        stock: 25,
        price: 649,
        mrp: 999,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1592878904946-36d0e1fd86d4?w=800&q=80',
            public_id: 'tote_beige_unsplash',
            is_primary: true
          }
        ]
      },
      {
        colorName: 'Olive',
        colorCode: '#708238',
        stock: 20,
        price: 649,
        mrp: 999,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1618354691405-5f0e66fbd6e9?w=800&q=80',
            public_id: 'tote_olive_unsplash',
            is_primary: true
          }
        ]
      }
    ]
  },
  {
    name: 'Foldable Travel Tote Bag',
    price: 799,
    mrp: 1199,
    category: 'Accessories',
    categorySlug: 'accessories',
    srtDescription: 'Compact foldable tote ideal for travel and daily errands',
    description: 'This foldable travel tote is made from water-resistant material, lightweight yet strong, perfect for travel or gym use.',
    seoDescription: 'Foldable travel tote bag – water-resistant, durable, and portable. Perfect for travelers.',
    seoKeyword: 'foldable tote bag, travel bag, lightweight tote, waterproof tote',
    seoTitle: 'Foldable Travel Tote Bag - Lightweight & Water-Resistant',
    pickup_location: 'Bangalore Warehouse',
    return: true,
    cancellation: true,
    sizes: ['One Size'],
    status: 'active',
    adminApproved: true,
    adminApprovedAt: new Date(),
    available: true,
    vendor: true,
    keyFeatures: ['Foldable Design', 'Water-Resistant', 'Lightweight', 'Durable Nylon Material'],
    productDetails: {
      weight: '120g',
      dimensions: '42cm x 36cm x 10cm',
      capacity: '18L',
      materials: 'Nylon and Polyester'
    },
    tags: ['travel', 'foldable', 'lightweight', 'nylon'],
    offers: true,
    salePrice: 699,
    colorVariants: [
      {
        colorName: 'Navy Blue',
        colorCode: '#000080',
        stock: 30,
        price: 799,
        mrp: 1199,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1603808033192-082d6919d7b8?w=800&q=80',
            public_id: 'tote_navy_unsplash',
            is_primary: true
          }
        ]
      },
      {
        colorName: 'Gray',
        colorCode: '#808080',
        stock: 25,
        price: 799,
        mrp: 1199,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586790170597-8a9d14b83e8d?w=800&q=80',
            public_id: 'tote_gray_unsplash',
            is_primary: true
          }
        ]
      }
    ]
  },
  {
    name: 'Printed Eco Tote Bag',
    price: 699,
    mrp: 999,
    category: 'Accessories',
    categorySlug: 'accessories',
    srtDescription: 'Stylish printed tote for shopping or casual use',
    description: 'A trendy printed tote bag made from 100% recycled cotton with artistic prints for a stylish look.',
    seoDescription: 'Printed eco tote bag – made from recycled cotton, sustainable and fashionable.',
    seoKeyword: 'printed tote bag, eco-friendly print bag, recycled cotton tote',
    seoTitle: 'Printed Eco Tote Bag - Sustainable & Stylish',
    pickup_location: 'Chennai Warehouse',
    return: true,
    cancellation: true,
    sizes: ['One Size'],
    status: 'active',
    adminApproved: true,
    adminApprovedAt: new Date(),
    available: true,
    vendor: true,
    keyFeatures: ['Recycled Cotton', 'Vivid Prints', 'Eco-Friendly Dyes', 'Washable'],
    productDetails: {
      weight: '170g',
      dimensions: '39cm x 35cm x 10cm',
      capacity: '14L',
      materials: 'Recycled Cotton Canvas'
    },
    tags: ['printed', 'eco', 'fashion', 'cotton'],
    offers: true,
    salePrice: 599,
    colorVariants: [
      {
        colorName: 'Floral Print',
        colorCode: '#FFFFFF',
        stock: 40,
        price: 699,
        mrp: 999,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1612178994549-4e59a0e8a8ed?w=800&q=80',
            public_id: 'tote_floral_unsplash',
            is_primary: true
          }
        ]
      },
      {
        colorName: 'Abstract Beige',
        colorCode: '#E0CDA9',
        stock: 35,
        price: 699,
        mrp: 999,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1606925797302-8b0500b13411?w=800&q=80',
            public_id: 'tote_abstract_unsplash',
            is_primary: true
          }
        ]
      }
    ]
  },
  {
    name: 'Luxury Leather Tote Bag',
    price: 2499,
    mrp: 3499,
    category: 'Accessories',
    categorySlug: 'accessories',
    srtDescription: 'Elegant leather tote for professionals and travelers',
    description: 'Crafted from high-quality vegan leather, this luxury tote combines style, comfort, and utility. Ideal for work or travel.',
    seoDescription: 'Luxury vegan leather tote bag – professional, elegant, and durable.',
    seoKeyword: 'leather tote bag, vegan leather, luxury tote, work bag',
    seoTitle: 'Luxury Leather Tote Bag - Elegant & Durable',
    pickup_location: 'Pune Warehouse',
    return: true,
    cancellation: true,
    sizes: ['One Size'],
    status: 'active',
    adminApproved: true,
    adminApprovedAt: new Date(),
    available: true,
    vendor: true,
    keyFeatures: ['Vegan Leather', 'Padded Laptop Compartment', 'Zipper Closure', 'Durable Stitching'],
    productDetails: {
      weight: '600g',
      dimensions: '42cm x 32cm x 12cm',
      capacity: '20L',
      materials: 'Premium Vegan Leather'
    },
    tags: ['leather', 'vegan', 'luxury', 'work'],
    offers: false,
    colorVariants: [
      {
        colorName: 'Brown',
        colorCode: '#8B4513',
        stock: 15,
        price: 2499,
        mrp: 3499,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
            public_id: 'tote_brown_unsplash',
            is_primary: true
          }
        ]
      },
      {
        colorName: 'Tan',
        colorCode: '#D2B48C',
        stock: 12,
        price: 2499,
        mrp: 3499,
        sizes: ['One Size'],
        isActive: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1585386959984-a41552231693?w=800&q=80',
            public_id: 'tote_tan_unsplash',
            is_primary: true
          }
        ]
      }
    ]
  }
]


async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Product.deleteMany({}),
            Vendor.deleteMany({}),
            Admin.deleteMany({}),
            User.deleteMany({}),
            Category.deleteMany({})
        ]);
        console.log('✅ Existing data cleared');

        // Create categories
        console.log('📂 Creating categories...');
        const createdCategories = await Category.insertMany(sampleCategories);
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Create admin
        console.log('👨‍💼 Creating admin user...');
        const hashedAdminPassword = await bcrypt.hash(sampleAdmin.password, 12);
        const admin = await Admin.create({
            ...sampleAdmin,
            password: hashedAdminPassword
        });
        console.log(`✅ Created admin: ${admin.email}`);

        // Create vendor
        console.log('🏪 Creating vendor...');
        const hashedVendorPassword = await bcrypt.hash(sampleVendor.password, 12);
        const vendor = await Vendor.create({
            ...sampleVendor,
            password: hashedVendorPassword
        });
        console.log(`✅ Created vendor: ${vendor.email}`);

        // Create user
        console.log('👤 Creating user...');
        const hashedUserPassword = await bcrypt.hash(sampleUser.password, 12);
        const user = await User.create({
            ...sampleUser,
            password: hashedUserPassword
        });
        console.log(`✅ Created user: ${user.email}`);

        // Create products
        console.log('📦 Creating products...');
        const productsWithVendor = sampleProducts.map(product => ({
            ...product,
            vendorId: vendor._id
        }));
        
        const createdProducts = await Product.insertMany(productsWithVendor);
        console.log(`✅ Created ${createdProducts.length} products`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample Accounts Created:');
        console.log(`Admin: ${sampleAdmin.email} / ${sampleAdmin.password}`);
        console.log(`Vendor: ${sampleVendor.email} / ${sampleVendor.password}`);
        console.log(`User: ${sampleUser.email} / ${sampleUser.password}`);
        console.log(`\n📊 Data Summary:`);
        console.log(`- Categories: ${createdCategories.length}`);
        console.log(`- Products: ${createdProducts.length} (with full SEO, features, and scheduling support)`);
        console.log(`- Color Variants: ${createdProducts.reduce((total, product) => total + product.colorVariants.length, 0)} (with individual pricing and stock)`);
        console.log(`- Total Stock: ${createdProducts.reduce((total, product) => total + product.colorVariants.reduce((sum, variant) => sum + variant.stock, 0), 0)} items`);
        console.log(`- Products with Offers: ${createdProducts.filter(p => p.offers).length}`);
        console.log(`- SEO Optimized: All products include meta descriptions, keywords, and titles`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seeding if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weave';
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('📡 Connected to MongoDB');
            return seedDatabase();
        })
        .then(() => {
            console.log('✨ Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

export default seedDatabase;
