import { Product } from './index';

export interface ReleasedProduct {
  _id: string;
  name: string;
  price: number;
  mrp: number;
  status: string;
  sales: number;
  salesGrowth: number;
  views: number;
  rating: number;
  reviewCount: number;
  files: string[];
  primaryImage?: string;
  available: string;
  stock: number;
  colors: string[];
  totalReviews: number;
  averageRating: number;
  discount: number;
  vendorId: string;
  vendor: any;
  description: string;
  pickup_location: string;
  return: boolean;
  cancellation: boolean;
  category: string;
  variant: boolean;
  variantDetails: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  slug: string;
}

export interface DraftProduct {
  _id: string;
  name: string;
  price: number;
  mrp: number;
  status: string;
  files: string[];
  primaryImage?: string;
  available: string;
  stock: number;
  colors: string[];
  totalReviews: number;
  averageRating: number;
  discount: number;
  vendorId: string;
  vendor: any;
  description: string;
  pickup_location: string;
  return: boolean;
  cancellation: boolean;
  category: string;
  variant: boolean;
  variantDetails: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  slug: string;
  lastEdited?: string;
}

export interface ScheduledProduct extends Product {
  scheduledDate: string;
  lastEdited: string;
  isScheduled: boolean;
  scheduledPublishDate: string;
  scheduledPublishTime: string;
  scheduleStatus: 'pending' | 'published' | 'cancelled';
}

export interface ProductManagementState {
  products: ReleasedProduct[];
  loading: boolean;
  viewMode: 'list' | 'grid';
  selectedProducts: string[];
  searchQuery: string;
  showContextMenu: string | null;
} 