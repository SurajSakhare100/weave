import api from './api';

export async function getWishlist() {
  try {
    const res = await api.get('/users/wishlist');
    return res.data;
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return { success: false, data: [], message: 'Failed to load wishlist' };
  }
}

export async function addToWishlist(productId: string) {
  try {
    const res = await api.post('/users/wishlist', { productId });
    return res.data;
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return { success: false, message: 'Failed to add item to wishlist' };
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const res = await api.delete(`/users/wishlist/${productId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: 'Failed to remove item from wishlist' };
  }
} 