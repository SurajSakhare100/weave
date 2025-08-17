import "@/styles/globals.css";
import "@/styles/vendor-globals.css";
import "@/styles/admin-globals.css";
import type { AppProps } from "next/app";
import { Provider, useDispatch, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor, RootState } from '../store/store'
import { useEffect } from 'react';
import { getUserToken } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { login, logout } from '../features/user/userSlice';
import { fetchCart } from '../features/cart/cartSlice';
import { initializeVendorAuth } from '../utils/vendorAuthInit';
import { checkTokenFormat } from '../utils/clearOldTokens';
import { Toaster } from 'sonner';
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useRouter } from 'next/router';
import { montserrat } from '@/lib/fonts'

function UserHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state?.user?.isAuthenticated);

  useEffect(() => {
    const hydrate = async () => {
      // Check and clear old tokens first
      checkTokenFormat();
      
      initializeVendorAuth();
      
      const token = getUserToken();
      if (token && !isAuthenticated) {
        try {
          const profile = await getUserProfile();
          if (profile.success && profile.data) {
            dispatch(login({ 
              email: profile.data.email, 
              user: profile.data
            }));
          } else {
            dispatch(logout());
          }
        } catch {
          dispatch(logout());
        }
      } else if (!token && isAuthenticated) {
        dispatch(logout());
      }
    };
    hydrate();
  }, [dispatch, isAuthenticated]);
  return null;
}

function CartHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state?.user?.isAuthenticated);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    
    if (isAuthenticated && cartItems.length === 0) {
        dispatch(fetchCart() as any);
    } 
  }, [dispatch, isAuthenticated, cartItems.length]);
  
  return null;
}

function StyleManager() {
  const router = useRouter();
  
  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('vendor-theme', 'admin-theme');
    
    // Add appropriate theme class based on route
    if (router.pathname.startsWith('/vendor')) {
      document.body.classList.add('vendor-theme');
    } else if (router.pathname.startsWith('/admin')) {
      document.body.classList.add('admin-theme');
    }
  }, [router.pathname]);
  
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${montserrat.variable} font-sans`}>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <UserHydrator />
            <CartHydrator />
            <StyleManager />
            <Toaster 
              richColors 
              position="top-right"
              closeButton
              duration={4000}
              expand={true}
              // maxToasts={5}
              toastOptions={{
                style: {
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  maxWidth: '400px',
                },
                className: 'mobile-friendly-toast',
              }}
            />
            <Component {...pageProps} />
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </main>
  );
}
