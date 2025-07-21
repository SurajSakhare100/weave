import api from './api';

export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  proId: string;
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  title: string;
  review: string;
  responses: ReviewResponse[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  content: string;
  isVendorResponse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  stars: 'one' | 'two' | 'three' | 'four' | 'five';
  title: string;
  review: string;
}

export interface ResponseData {
  content: string;
}

export interface ReviewApiResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    ratingDistribution: Array<{
      _id: string;
      count: number;
    }>;
    summary: {
      totalReviews: number;
      averageRating: number;
    };
  };
}

// Get reviews for a product
export async function getReviews(productId: string, page: number = 1, limit: number = 10): Promise<ReviewApiResponse> {
  const res = await api.get(`/products/${productId}/reviews`, {
    params: { page, limit }
  });
  return res.data;
}

// Add a review to a product
export async function addReview(productId: string, review: ReviewData) {
  const res = await api.post(`/products/${productId}/reviews`, review);
  return res.data;
}

// Update a review
export async function updateReview(productId: string, reviewId: string, review: ReviewData) {
  const res = await api.put(`/products/${productId}/reviews/${reviewId}`, review);
  return res.data;
}

// Remove a review
export async function removeReview(productId: string, reviewId: string) {
  const res = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return res.data;
}

// Add response to a review
export async function addReviewResponse(productId: string, reviewId: string, response: ResponseData) {
  const res = await api.post(`/products/${productId}/reviews/${reviewId}/responses`, response);
  return res.data;
}

// Update a review response
export async function updateReviewResponse(productId: string, reviewId: string, responseId: string, response: ResponseData) {
  const res = await api.put(`/products/${productId}/reviews/${reviewId}/responses/${responseId}`, response);
  return res.data;
}

// Remove a review response
export async function removeReviewResponse(productId: string, reviewId: string, responseId: string) {
  const res = await api.delete(`/products/${productId}/reviews/${reviewId}/responses/${responseId}`);
  return res.data;
}

// Vendor review management
export const getVendorReviews = async (page: number = 1, limit: number = 10, filters: any = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/vendors/reviews?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVendorReviewAnalytics = async (days: number = 30) => {
  try {
    const response = await api.get(`/vendors/reviews/analytics?days=${days}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addVendorResponse = async (reviewId: string, content: string) => {
  try {
    const response = await api.post(`/vendors/reviews/${reviewId}/responses`, {
      content
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateVendorResponse = async (reviewId: string, responseId: string, content: string) => {
  try {
    const response = await api.put(`/vendors/reviews/${reviewId}/responses/${responseId}`, {
      content
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVendorResponse = async (reviewId: string, responseId: string) => {
  try {
    const response = await api.delete(`/vendors/reviews/${reviewId}/responses/${responseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 