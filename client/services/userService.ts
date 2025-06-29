import api from './api';

export async function loginUser(name: string, role: 'user' | 'vendor') {
  const res = await api.post('/auth/login', { name, role });
  return res.data;
}

export async function logoutUser() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function getUserOrders() {
  const res = await api.get('/orders/myorders');
  return res.data;
}

export async function getUserProfile() {
  const res = await api.get('/users/profile');
  return res.data;
}

export async function updateUserProfile(data: any) {
  const res = await api.put('/users/profile', data);
  return res.data;
}

export async function getUserDashboard() {
  const res = await api.get('/users/dashboard');
  return res.data;
}

// Address management functions
export async function getUserAddresses() {
  const res = await api.get('/users/addresses');
  return res.data;
}

export async function addUserAddress(addressData: any) {
  const res = await api.post('/users/addresses', addressData);
  return res.data;
}

export async function updateUserAddress(addressId: string, addressData: any) {
  const res = await api.put(`/users/addresses/${addressId}`, addressData);
  return res.data;
}

export async function deleteUserAddress(addressId: string) {
  const res = await api.delete(`/users/addresses/${addressId}`);
  return res.data;
}

export async function setDefaultAddress(addressId: string) {
  const res = await api.put(`/users/addresses/${addressId}/default`);
  return res.data;
}

// Admin functions - these use ID parameters but are admin-only
export async function getUsers(params?: any) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id: string, data: any) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function getUserStats() {
  const res = await api.get('/users/stats');
  return res.data;
} 