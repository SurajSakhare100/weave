import api from './api';

export async function getReviews(productId: string) {
  const res = await api.get(`/products/${productId}/reviews`);
  return res.data;
}

export async function addReview(productId: string, review: any) {
  const res = await api.post(`/products/${productId}/reviews`, review);
  return res.data;
}

export async function removeReview(productId: string, reviewId: string) {
  const res = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return res.data;
} 