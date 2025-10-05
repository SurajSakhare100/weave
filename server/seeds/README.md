# Database Seeding

This directory contains scripts to seed the database with sample data for development and testing.

## Quick Start

To reset and seed your database with sample data:

```bash
# From the server directory
npm run seed
```

## What Gets Created

The seed script will:

1. **Clear all existing data** from the database
2. **Create sample categories**: Electronics, Clothing, Home & Garden, Sports, Books
3. **Create sample accounts**:
   - **Admin**: `admin@example.com` / `admin123`
   - **Vendor**: `vendor@example.com` / `password123`  
   - **User**: `user@example.com` / `user123`
4. **Create sample products** with color variants:
   - Premium T-Shirt (Red, Blue, Black variants)
   - Wireless Headphones (Black, White variants)
   - Running Shoes (Blue, Gray variants)

## Sample Data Features

Each product includes:
- ✅ **Color Variants**: Multiple colors with individual stock, pricing, and sizes
- ✅ **Color-Specific Images**: Each variant has its own image set
- ✅ **SEO Optimization**: Complete meta descriptions, keywords, and titles
- ✅ **Rich Product Details**: Key features, product specifications, and materials
- ✅ **Pricing & Offers**: Support for sales, discounts, and special offers
- ✅ **Admin Features**: Approval status, pickup locations, return policies
- ✅ **Scheduling Support**: Ready for scheduled publishing (draft status available)
- ✅ **Multi-Warehouse**: Different pickup locations per product

## Environment Setup

Make sure your `.env` file has the correct MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/weave
```

## Manual Usage

You can also run the seed script directly:

```bash
node seeds/seedDatabase.js
```

## Development

For development with auto-reload:

```bash
npm run seed:dev
```

## Important Notes

⚠️ **Warning**: This script will **DELETE ALL EXISTING DATA** in your database before creating new sample data.

✅ **Safe for Development**: Perfect for resetting your development database to a known state.

❌ **Never run in Production**: This will destroy all production data.

## Color Variant Testing

The seeded products are perfect for testing the color variant feature:

1. **Color Selection**: Each product has 2-3 color variants
2. **Image Switching**: Each color has its own set of images
3. **Stock Management**: Different stock levels per color
4. **Visual Indicators**: Color codes and image counts are included

## Customization

To modify the sample data, edit the arrays in `seedDatabase.js`:

- `sampleCategories` - Product categories
- `sampleProducts` - Products with color variants
- Account details for admin, vendor, and user

## Troubleshooting

If seeding fails:

1. Check MongoDB connection
2. Ensure all required models exist
3. Check console output for specific errors
4. Verify database permissions

For questions or issues, check the main project README or create an issue.
