import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor, RootState } from "../store/store";
import { useEffect, useRef } from "react";
import { getUserToken } from "../services/authService";
import { getUserProfile } from "../services/userService";
import { login, logout } from "../features/user/userSlice";
import { fetchCart } from "../features/cart/cartSlice";
import { initializeVendorAuth } from "../utils/vendorAuthInit";
import { checkTokenFormat } from "../utils/clearOldTokens";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useRouter } from "next/router";
import { montserrat } from "@/lib/fonts";

function UserHydrator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    if (typeof window === "undefined") return; // avoid SSR issues

    const hydrate = async () => {
      checkTokenFormat();
      initializeVendorAuth();

      const token = getUserToken();

      if (token && !isAuthenticated) {
        try {
          const profile = await getUserProfile();
          if (profile.success && profile.data) {
            dispatch(
              login({
                email: profile.data.email,
                user: profile.data,
              })
            );
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
  const fetchedRef = useRef(false); // prevent duplicate fetch

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAuthenticated && cartItems.length === 0 && !fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(fetchCart() as any);
    }
  }, [dispatch, isAuthenticated, cartItems.length]);

  return null;
}

function StyleManager() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = router.pathname;
    const body = document.body;

    body.className = path.startsWith("/vendor")
      ? "vendor-theme"
      : path.startsWith("/admin")
      ? "admin-theme"
      : "";
  }, [router.pathname]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <main className={`${montserrat.variable} font-sans`}>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {/* Hydration helpers */}
            <UserHydrator />
            <CartHydrator />
            <StyleManager />

            {/* Toast notifications */}
            <Toaster
              richColors
              position="top-right"
              closeButton
              duration={4000}
              expand
              toastOptions={{
                style: {
                  fontSize: "14px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  maxWidth: "400px",
                },
                className: "mobile-friendly-toast",
              }}
            />

            {/* Actual page */}
            <Component key={router.asPath} {...pageProps} />
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </main>
  );
}
