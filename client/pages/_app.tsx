import "@/styles/globals.css";
import "@/styles/vendor-globals.css";
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

function UserHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

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
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    console.log('CartHydrator - Effect triggered:', { isAuthenticated, cartItemsLength: cartItems.length });
    
    if (isAuthenticated && cartItems.length === 0) {
      console.log('CartHydrator - User authenticated and cart empty, fetching cart');
      // Fetch cart when user is authenticated and cart is empty
      dispatch(fetchCart()).catch((error) => {
        console.error('CartHydrator - Failed to fetch cart on app init:', error);
      });
    } else {
      console.log('CartHydrator - Skipping cart fetch:', { 
        isAuthenticated, 
        cartItemsLength: cartItems.length,
        reason: !isAuthenticated ? 'not authenticated' : 'cart not empty'
      });
    }
  }, [dispatch, isAuthenticated, cartItems.length]);
  
  return null;
}

function VendorStyleManager() {
  const router = useRouter();
  
  useEffect(() => {
    if (router.pathname.startsWith('/vendor')) {
      document.body.classList.add('vendor-theme');
    } else {
      document.body.classList.remove('vendor-theme');
    }
  }, [router.pathname]);
  
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <UserHydrator />
          <CartHydrator />
          <VendorStyleManager />
          <Toaster richColors position="top-right" />
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
