import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, useDispatch, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from '../store/store'
import { useEffect } from 'react';
import { getUserToken } from '../services/authService';
import { getUserProfile } from '../services/userService';
import { login, logout } from '../features/user/userSlice';

function UserHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

  useEffect(() => {
    const hydrate = async () => {
      const token = getUserToken();
      if (token && !isAuthenticated) {
        try {
          const profile = await getUserProfile();
          if (profile.data) {
            dispatch(login({ name: profile.data.name, role: 'user' }));
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UserHydrator />
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}
