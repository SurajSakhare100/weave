import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Sample Unsplash image URLs for different products and colors
const sampleImages = {
    tshirt: {
        red: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        blue: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&q=80',
        black: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80'
    },
    headphones: {
        black: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        white: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
    },
    shoes: {
        blue: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        gray: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
    },
    toteBag: {
        beige: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        black: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
        white: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80'
    }
};

/**
 * Upload an image from URL to Cloudinary
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} publicId - The public ID for the uploaded image
 * @param {string} folder - The folder to upload to
 * @returns {Promise<Object>} Cloudinary upload result
 */
async function uploadImageFromUrl(imageUrl, publicId, folder = 'weave-products') {
    try {
        console.log(`📤 Uploading ${publicId}...`);
        
        const result = await cloudinary.uploader.upload(imageUrl, {
            public_id: publicId,
            folder: folder,
            transformation: [
                { width: 800, height: 800, crop: 'fill', quality: 'auto:good' },
                { format: 'webp' }
            ],
            eager: [
                { width: 400, height: 400, crop: 'fill', quality: 'auto:good', format: 'webp' },
                { width: 200, height: 200, crop: 'fill', quality: 'auto:good', format: 'webp' }
            ]
        });

        console.log(`✅ Uploaded ${publicId}: ${result.secure_url}`);
        return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail_url: result.eager && result.eager[0] ? result.eager[0].secure_url : result.secure_url,
            small_thumbnail_url: result.eager && result.eager[1] ? result.eager[1].secure_url : result.secure_url,
            is_primary: true
        };
    } catch (error) {
        console.error(`❌ Failed to upload ${publicId}:`, error.message);
        throw error;
    }
}

/**
 * Upload all sample images to Cloudinary
 * @returns {Promise<Object>} Object containing all uploaded image data
 */
async function uploadAllSampleImages() {
    const uploadedImages = {};
    
    try {
        console.log('🚀 Starting image uploads to Cloudinary...\n');

        // Upload T-shirt images
        console.log('👕 Uploading T-shirt images...');
        uploadedImages.tshirt = {};
        uploadedImages.tshirt.red = await uploadImageFromUrl(sampleImages.tshirt.red, 'tshirt_red');
        uploadedImages.tshirt.blue = await uploadImageFromUrl(sampleImages.tshirt.blue, 'tshirt_blue');
        uploadedImages.tshirt.black = await uploadImageFromUrl(sampleImages.tshirt.black, 'tshirt_black');

        // Upload Headphones images
        console.log('\n🎧 Uploading Headphones images...');
        uploadedImages.headphones = {};
        uploadedImages.headphones.black = await uploadImageFromUrl(sampleImages.headphones.black, 'headphones_black');
        uploadedImages.headphones.white = await uploadImageFromUrl(sampleImages.headphones.white, 'headphones_white');

        // Upload Shoes images
        console.log('\n👟 Uploading Shoes images...');
        uploadedImages.shoes = {};
        uploadedImages.shoes.blue = await uploadImageFromUrl(sampleImages.shoes.blue, 'shoes_blue');
        uploadedImages.shoes.gray = await uploadImageFromUrl(sampleImages.shoes.gray, 'shoes_gray');

        // Upload Tote Bag images
        console.log('\n👜 Uploading Tote Bag images...');
        uploadedImages.toteBag = {};
        uploadedImages.toteBag.beige = await uploadImageFromUrl(sampleImages.toteBag.beige, 'totebag_beige');
        uploadedImages.toteBag.black = await uploadImageFromUrl(sampleImages.toteBag.black, 'totebag_black');
        uploadedImages.toteBag.white = await uploadImageFromUrl(sampleImages.toteBag.white, 'totebag_white');

        console.log('\n🎉 All images uploaded successfully!');
        console.log('📋 Upload Summary:');
        console.log(`- T-shirts: ${Object.keys(uploadedImages.tshirt).length} colors`);
        console.log(`- Headphones: ${Object.keys(uploadedImages.headphones).length} colors`);
        console.log(`- Shoes: ${Object.keys(uploadedImages.shoes).length} colors`);
        console.log(`- Tote Bags: ${Object.keys(uploadedImages.toteBag).length} colors`);

        return uploadedImages;

    } catch (error) {
        console.error('💥 Upload process failed:', error);
        throw error;
    }
}

/**
 * Generate updated seed data with real Cloudinary URLs
 * @param {Object} uploadedImages - The uploaded images data
 * @returns {Array} Updated products array for seed file
 */
function generateUpdatedSeedData(uploadedImages) {
    return [
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
                    images: [uploadedImages.tshirt.red]
                },
                {
                    colorName: 'Blue',
                    colorCode: '#0000FF',
                    stock: 30,
                    price: 299,
                    mrp: 399,
                    sizes: ['S', 'M', 'L', 'XL'],
                    isActive: true,
                    images: [uploadedImages.tshirt.blue]
                },
                {
                    colorName: 'Black',
                    colorCode: '#000000',
                    stock: 25,
                    price: 299,
                    mrp: 399,
                    sizes: ['S', 'M', 'L', 'XL'],
                    isActive: true,
                    images: [uploadedImages.tshirt.black]
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
            pickup_location: 'Delhi Warehouse',
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
            offers: false,
            colorVariants: [
                {
                    colorName: 'Beige',
                    colorCode: '#F5F5DC',
                    stock: 40,
                    price: 599,
                    mrp: 899,
                    sizes: ['One Size'],
                    isActive: true,
                    images: [uploadedImages.toteBag.beige]
                },
                {
                    colorName: 'Black',
                    colorCode: '#000000',
                    stock: 35,
                    price: 599,
                    mrp: 899,
                    sizes: ['One Size'],
                    isActive: true,
                    images: [uploadedImages.toteBag.black]
                },
                {
                    colorName: 'White',
                    colorCode: '#FFFFFF',
                    stock: 30,
                    price: 599,
                    mrp: 899,
                    sizes: ['One Size'],
                    isActive: true,
                    images: [uploadedImages.toteBag.white]
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
            pickup_location: 'Bangalore Warehouse',
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
                    images: [uploadedImages.headphones.black]
                },
                {
                    colorName: 'White',
                    colorCode: '#FFFFFF',
                    stock: 15,
                    price: 1999,
                    mrp: 2999,
                    sizes: ['One Size'],
                    isActive: true,
                    images: [uploadedImages.headphones.white]
                }
            ]
        }
    ];
}

// Main execution function
async function main() {
    try {
        console.log('🔧 Cloudinary Configuration:');
        console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not set'}`);
        console.log(`API Key: ${process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set'}`);
        console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'}\n`);

        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
        }

        const uploadedImages = await uploadAllSampleImages();
        const updatedSeedData = generateUpdatedSeedData(uploadedImages);
        
        console.log('\n📄 Updated seed data generated!');
        console.log('Copy the generated data to your seedDatabase.js file');
        
        // Write the updated data to a file
        const fs = await import('fs');
        fs.writeFileSync('uploadedImagesData.json', JSON.stringify(updatedSeedData, null, 2));
        console.log('✅ Updated seed data saved to uploadedImagesData.json');

    } catch (error) {
        console.error('💥 Process failed:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    main();
}

export { uploadAllSampleImages, generateUpdatedSeedData };
