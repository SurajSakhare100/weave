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
    available: string
    category: string
    categorySlug?: string
    srtDescription?: string
    description?: string
    seoDescription?: string
    seoKeyword?: string
    seoTitle?: string
    pickup_location?: string
    return: boolean
    cancellation: boolean
    uni_id_1?: string
    uni_id_2?: string
    files: string[]
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
    currVariantSize?: string
    createdAt: string
    updatedAt: string
    images: ProductImage[]
    productDetails?: {
      weight?: string;
      dimensions?: string;
      capacity?: string;
      materials?: string;
    };
    keyFeatures?: string[];
    offers?: boolean;
    salePrice?: number;
    sizes?: string[];
    tags?: string[];
    // Scheduling fields
    isScheduled?: boolean;
    scheduledPublishDate?: string;
    scheduledPublishTime?: string;
    scheduleStatus?: 'pending' | 'published' | 'cancelled';
    scheduledDate?: string; // Formatted date for display
  }

// Add this above Product interface
declare interface ProductImage {
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