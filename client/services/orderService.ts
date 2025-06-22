import api from './api';

export async function getOrders(userId: string) {
  const res = await api.get(`/users/${userId}/orders`);
  return res.data;
}

export async function placeOrder(orderData: any) {
  const res = await api.post('/orders', orderData);
  return res.data;
}

export async function getOrderById(id: string) {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function getMyOrders(params?: any) {
  const res = await api.get('/orders/myorders', { params });
  return res.data;
}

export async function updateOrderToPaid(id: string, data: any) {
  const res = await api.put(`/orders/${id}/pay`, data);
  return res.data;
}

export async function cancelOrder(id: string) {
  const res = await api.put(`/orders/${id}/cancel`);
  return res.data;
}

// Admin
export async function getAllOrders(params?: any) {
  const res = await api.get('/orders', { params });
  return res.data;
}

export async function updateOrderToDelivered(id: string) {
  const res = await api.put(`/orders/${id}/deliver`);
  return res.data;
}

export async function updateOrderStatus(id: string, data: any) {
  const res = await api.put(`/orders/${id}/status`, data);
  return res.data;
}

export async function getOrderStats() {
  const res = await api.get('/orders/stats');
  return res.data;
} 