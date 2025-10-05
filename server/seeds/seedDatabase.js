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
        name: 'Premium T-Shirt',
        price: 299,
        mrp: 399,
        category: 'Clothing',
        categorySlug: 'clothing',
        srtDescription: 'Premium quality cotton t-shirt for everyday comfort',
        description: 'High-quality cotton t-shirt with premium fabric and comfortable fit. Perfect for casual wear and daily activities.',
        seoDescription: 'Premium cotton t-shirt with comfortable fit - available in multiple colors and sizes',
        seoKeyword: 'premium t-shirt, cotton t-shirt, casual wear, comfortable clothing',
        seoTitle: 'Premium Cotton T-Shirt - Comfortable & Stylish',
        pickup_location: 'Mumbai Warehouse',
        return: true,
        cancellation: true,
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'active',
        adminApproved: true,
        adminApprovedAt: new Date(),
        available: true,
        vendor: true,
        keyFeatures: ['100% Cotton', 'Comfortable Fit', 'Durable Fabric', 'Machine Washable'],
        productDetails: {
            weight: '200g',
            dimensions: 'Standard fit',
            capacity: 'N/A',
            materials: '100% Premium Cotton'
        },
        tags: ['casual', 'cotton', 'comfortable', 'daily wear'],
        offers: true,
        salePrice: 249,
        colorVariants: [
            {
                colorName: 'Red',
                colorCode: '#FF0000',
                stock: 50,
                price: 299,
                mrp: 399,
                sizes: ['S', 'M', 'L', 'XL'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
                    public_id: 'tshirt_red_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'Blue',
                colorCode: '#0000FF',
                stock: 30,
                price: 299,
                mrp: 399,
                sizes: ['S', 'M', 'L', 'XL'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80',
                    public_id: 'tshirt_blue_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'Black',
                colorCode: '#000000',
                stock: 25,
                price: 299,
                mrp: 399,
                sizes: ['S', 'M', 'L', 'XL'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
                    public_id: 'tshirt_black_unsplash',
                    is_primary: true
                }]
            }
        ]
    },
    {
        name: 'Canvas Tote Bag',
        price: 599,
        mrp: 899,
        category: 'Accessories',
        categorySlug: 'accessories',
        srtDescription: 'Eco-friendly canvas tote bag for daily use',
        description: 'Durable canvas tote bag made from sustainable materials. Perfect for shopping, work, or casual outings.',
        seoDescription: 'Eco-friendly canvas tote bag - sustainable, durable, and stylish',
        seoKeyword: 'canvas tote bag, eco-friendly bag, sustainable accessories, reusable bag',
        seoTitle: 'Canvas Tote Bag - Eco-Friendly & Durable',
        pickup_location: 'Chennai Warehouse',
        return: true,
        cancellation: true,
        sizes: ['One Size'],
        status: 'active',
        adminApproved: true,
        adminApprovedAt: new Date(),
        available: true,
        vendor: true,
        keyFeatures: ['100% Canvas', 'Eco-Friendly', 'Large Capacity', 'Reinforced Handles'],
        productDetails: {
            weight: '150g',
            dimensions: '40cm x 35cm x 10cm',
            capacity: '15L',
            materials: '100% Organic Canvas'
        },
        tags: ['eco-friendly', 'canvas', 'tote', 'sustainable'],
        offers: true,
        salePrice: 499,
        colorVariants: [
            {
                colorName: 'Beige',
                colorCode: '#F5F5DC',
                stock: 40,
                price: 599,
                mrp: 899,
                sizes: ['One Size'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
                    public_id: 'totebag_beige_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'Black',
                colorCode: '#000000',
                stock: 35,
                price: 599,
                mrp: 899,
                sizes: ['One Size'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
                    public_id: 'totebag_black_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'White',
                colorCode: '#FFFFFF',
                stock: 30,
                price: 599,
                mrp: 899,
                sizes: ['One Size'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
                    public_id: 'totebag_white_unsplash',
                    is_primary: true
                }]
            }
        ]
    },
    {
        name: 'Wireless Headphones',
        price: 1999,
        mrp: 2999,
        category: 'Electronics',
        categorySlug: 'electronics',
        srtDescription: 'Premium wireless headphones with noise cancellation',
        description: 'High-quality wireless headphones with active noise cancellation, long battery life, and superior sound quality.',
        seoDescription: 'Wireless headphones with noise cancellation - premium sound quality and long battery life',
        seoKeyword: 'wireless headphones, noise cancellation, bluetooth headphones, premium audio',
        seoTitle: 'Wireless Noise Cancelling Headphones - Premium Audio',
        pickup_location: 'Delhi Warehouse',
        return: true,
        cancellation: true,
        sizes: ['One Size'],
        status: 'active',
        adminApproved: true,
        adminApprovedAt: new Date(),
        available: true,
        vendor: true,
        keyFeatures: ['Active Noise Cancellation', '30-hour Battery', 'Bluetooth 5.0', 'Premium Sound Quality'],
        productDetails: {
            weight: '250g',
            dimensions: '18cm x 16cm x 7cm',
            capacity: 'N/A',
            materials: 'Premium Plastic and Metal'
        },
        tags: ['wireless', 'headphones', 'noise cancellation', 'bluetooth'],
        offers: true,
        salePrice: 1699,
        colorVariants: [
            {
                colorName: 'Black',
                colorCode: '#000000',
                stock: 20,
                price: 1999,
                mrp: 2999,
                sizes: ['One Size'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                    public_id: 'headphones_black_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'White',
                colorCode: '#FFFFFF',
                stock: 15,
                price: 1999,
                mrp: 2999,
                sizes: ['One Size'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
                    public_id: 'headphones_white_unsplash',
                    is_primary: true
                }]
            }
        ]
    },
    {
        name: 'Running Shoes',
        price: 2499,
        mrp: 3499,
        category: 'Sports',
        categorySlug: 'sports',
        srtDescription: 'Professional running shoes with superior grip and comfort',
        description: 'Comfortable running shoes with excellent grip, cushioning, and breathable material. Perfect for daily runs and athletic activities.',
        seoDescription: 'Professional running shoes with superior grip and comfort - perfect for athletes',
        seoKeyword: 'running shoes, athletic shoes, sports footwear, comfortable shoes',
        seoTitle: 'Professional Running Shoes - Superior Comfort & Grip',
        pickup_location: 'Bangalore Warehouse',
        return: true,
        cancellation: true,
        sizes: ['7', '8', '9', '10', '11'],
        status: 'active',
        adminApproved: true,
        adminApprovedAt: new Date(),
        available: true,
        vendor: true,
        keyFeatures: ['Superior Grip', 'Breathable Material', 'Cushioned Sole', 'Lightweight Design'],
        productDetails: {
            weight: '300g per shoe',
            dimensions: 'Standard athletic fit',
            capacity: 'N/A',
            materials: 'Synthetic mesh and rubber sole'
        },
        tags: ['running', 'sports', 'athletic', 'comfortable'],
        offers: false,
        colorVariants: [
            {
                colorName: 'Blue',
                colorCode: '#0000FF',
                stock: 40,
                price: 2499,
                mrp: 3499,
                sizes: ['7', '8', '9', '10', '11'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
                    public_id: 'shoes_blue_unsplash',
                    is_primary: true
                }]
            },
            {
                colorName: 'Gray',
                colorCode: '#808080',
                stock: 35,
                price: 2499,
                mrp: 3499,
                sizes: ['7', '8', '9', '10', '11'],
                isActive: true,
                images: [{
                    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
                    public_id: 'shoes_gray_unsplash',
                    is_primary: true
                }]
            }
        ]
    }
];

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
