import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '../store/store';
import { getUserToken } from '../services/authService';

/**
 * useRequireUserAuth
 * Redirects to /login if user is not authenticated (Redux or cookie).
 * Returns isAuthenticated (boolean) for conditional rendering.
 */
export function useRequireUserAuth(redirect = true) {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const token = getUserToken();
  const loggedIn = isAuthenticated && !!token;

  useEffect(() => {
    if (!loggedIn && redirect) {
      router.replace('/login');
    }
  }, [loggedIn, redirect, router]);

  return loggedIn;
} 