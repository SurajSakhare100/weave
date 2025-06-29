import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, useDispatch, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor, RootState } from '../store/store'
import { useEffect } from 'react';
import { getUserToken } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { login, logout } from '../features/user/userSlice';
import ErrorBoundary from '../components/ErrorBoundary';

function UserHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    const hydrate = async () => {
      const token = getUserToken();
      if (token && !isAuthenticated) {
        try {
          const profile = await getUserProfile();
          if (profile.success && profile.data) {
            // Just set authentication state without trying to login again
            dispatch(login({ 
              email: profile.data.email, 
              password: '' // We don't have the password, just mark as authenticated
            }));
          } else {
            // If profile fetch fails, clear the token
            dispatch(logout());
          }
        } catch (err) {
          console.error('Failed to hydrate user:', err);
          // Clear invalid token
          dispatch(logout());
        }
      } else if (!token && isAuthenticated) {
        // Clear authentication state if no token
        dispatch(logout());
      }
    };
    hydrate();
  }, [dispatch, isAuthenticated]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <UserHydrator />
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
