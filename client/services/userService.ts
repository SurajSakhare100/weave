import api from './api';

export async function loginUser(name: string, role: 'user' | 'vendor') {
  const res = await api.post('/auth/login', { name, role });
  return res.data;
}

export async function logoutUser() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function getUserOrders(userId: string) {
  const res = await api.get(`/users/${userId}/orders`);
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

// Admin
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