// Product interface
export interface Product {
    _id: string
    name: string
    slug: string
    price: number
    mrp: number
    discount: number
    vendorId: string
    vendor: boolean
    available: boolean // Changed from string to boolean
    category: string
    categorySlug: string // Made required
    srtDescription?: string
    description?: string
    seoDescription?: string
    seoKeyword?: string
    seoTitle?: string
    pickup_location?: string
    return: boolean
    cancellation: boolean
    images: ProductImage[] //  Single source of truth for images
    variant: boolean
    variantDetails: Array<{
      size: string
      color?: string
      price: number
      mrp: number
      stock: number
    }>
    stock: number;
    colors: string[];
    totalReviews: number;
    averageRating: number;
    status: 'active' | 'inactive' | 'draft' | 'scheduled';
    createdAt: string
    updatedAt: string
    productDetails?: {
      weight?: string;
      dimensions?: string;
      capacity?: string;
      materials?: string;
    };
    keyFeatures?: string[];
    offers?: boolean;
    salePrice?: number;
    // Size fields
    size?: string; // Single size for simple products
    sizes?: string[]; // Multiple sizes for products with size variants
    tags?: string[];
    // Scheduling fields
    isScheduled?: boolean;
    scheduledPublishDate?: string;
    scheduledPublishTime?: string;
    scheduleStatus?: 'pending' | 'published' | 'cancelled';
    scheduledDate?: string; // Formatted date for display
    // Virtual fields
    primaryImage?: string;
    thumbnail?: string;
    discountPercentage?: number;
    availableSizes?: string[]; // 
    adminApproved?: boolean;
    adminRejectionReason?: string;
    // Virtual field for available sizes

    // Color variants with images
    colorVariants?: ColorVariant[];
    // Legacy color field (keep for backward compatibility)
    color?: string;
}

// Color variant interface
export interface ColorVariant {
  colorName: string;
  colorCode: string; // Hex color code
  images: ProductImage[];
  stock: number;
  price?: number; // Optional price override for this color
  mrp?: number; // Optional MRP override for this color
  isActive: boolean;
}

// Product image interface
export interface ProductImage {
  url: string;
  public_id: string;
  is_primary?: boolean;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  thumbnail_url?: string;
  small_thumbnail_url?: string;
}

// Product with reviews interface
export interface ProductWithReviews extends Product {
  vendorId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  reviews: Array<{
    isVerified: boolean
    _id: string;
    userId: {
      email: string
      _id: string;
      firstName: string;
      lastName: string;
    };
    stars: 'one' | 'two' | 'three' | 'four' | 'five';
    title: string;
    review: string;
    createdAt: string;
    responses?: Array<{
      _id: string;
      userId?: {
        _id: string;
        firstName: string;
        lastName: string;
      };
      content: string;
      isVendorResponse: boolean;
      createdAt: string;
    }>;
  }>;
  ratingDistribution?: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CartItem {
  proId: string;
  quantity: number;
  price: number;
  mrp: number;
  variantSize?: string;
  item: {
    _id: string;
    name: string;
    images?: {
      url: string;
    }[];
    color?: string;
    size?: string;
  };
  image?: string;
  color?: string;
  size?: string;
}