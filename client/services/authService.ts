import api from './api';
import Cookies from 'js-cookie';

export async function login(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);
  // Set token in cookie
  if (res.data.token) {
    Cookies.set('userToken', res.data.token, { expires: 7, sameSite: 'Lax' });
  }
  return res.data;
}

export async function register(data: { name: string; email: string; password: string; role?: string }) {
  const res = await api.post('/auth/register', data);
  // Set token in cookie
  if (res.data.token) {
    Cookies.set('userToken', res.data.token, { expires: 7, sameSite: 'Lax' });
  }
  return res.data;
}

export async function logout() {
  Cookies.remove('userToken');
  const res = await api.post('/auth/logout');
  return res.data;
}

export function getUserToken() {
  return Cookies.get('userToken') || null;
} 