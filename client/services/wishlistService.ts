import api from './api';

export async function getWishlist(userId: string) {
  const res = await api.get(`/users/${userId}/wishlist`);
  return res.data;
}

export async function addToWishlist(userId: string, productId: string) {
  const res = await api.post(`/users/${userId}/wishlist`, { productId });
  return res.data;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const res = await api.delete(`/users/${userId}/wishlist/${productId}`);
  return res.data;
} 