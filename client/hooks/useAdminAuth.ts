import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/me`, {
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
        setError(null);
      } else {
        setAdmin(null);
        setError('Not authenticated');
      }
    } catch (err) {
      setAdmin(null);
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setAdmin(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    admin,
    loading,
    error,
    isAuthenticated: !!admin,
    logout,
    checkAuth,
  };
}; 