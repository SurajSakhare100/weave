import api from './api';

// User operations - use token-based auth
export async function placeOrder(orderData: any) {
  try {
    // Transform the data to match server expectations
    const transformedOrderData = {
      orderItems: orderData.items.map((item: any) => ({
        productId: item.proId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        variantSize: item.variantSize
      })),
      shippingAddress: {
        name: orderData.shippingAddress.name,
        address: orderData.shippingAddress.address.join(', '),
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        pincode: orderData.shippingAddress.pincode,
        phone: orderData.shippingAddress.phone
      },
      paymentMethod: orderData.paymentMethod,
      itemsPrice: orderData.itemTotal,
      shippingPrice: orderData.deliveryFee,
      totalPrice: orderData.totalAmount
    };

    const res = await api.post('/orders', transformedOrderData);
    return res.data;
  } catch (error: any) {
    console.error('Error placing order:', error);
    return { success: false, message: 'Failed to place order' };
  }
}

export async function getMyOrders(params?: any) {
  const res = await api.get('/orders/myorders', { params });
  return res.data;
}

export async function getOrderById(id: string) {
  const res = await api.get(`/orders/${id}`);
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

// Admin operations - these use ID parameters but are admin-only
export async function getOrders(userId: string) {
  const res = await api.get(`/users/${userId}/orders`);
  return res.data;
}

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