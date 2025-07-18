import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState } from '../store/store';
import { getVendorToken } from '../utils/vendorAuth';
import { debugAuth } from '../utils/debugAuth';

/**
 * useRequireVendorAuth
 * Redirects to /vendor/login if vendor is not authenticated (Redux or cookie).
 * Returns isAuthenticated (boolean) for conditional rendering.
 */
export function useRequireVendorAuth(redirect = true) {
  const { isAuthenticated: reduxAuthenticated } = useSelector((state: RootState) => state.vendor);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const token = getVendorToken();
  // Consider authenticated if either Redux state is true OR token exists
  const loggedIn = reduxAuthenticated || !!token;

  useEffect(() => {
    // Debug authentication status
    console.log('Vendor Auth Hook - Redux isAuthenticated:', reduxAuthenticated, 'token:', !!token, 'loggedIn:', loggedIn);
    debugAuth();
    
    setIsInitialized(true);
  }, [reduxAuthenticated, token, loggedIn]);

  useEffect(() => {
    if (isInitialized && !loggedIn && redirect) {
      console.log('Redirecting to vendor login - not authenticated');
      router.replace('/vendor/login');
    }
  }, [isInitialized, loggedIn, redirect, router]);

  return { isAuthenticated: loggedIn, isInitialized };
} 