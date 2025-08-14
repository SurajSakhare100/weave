import React from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import ToastClearButton from '../ui/ToastClearButton';
import { cn } from '@/lib/utils';
import MobilePageHeader from '../ui/MobilePageHeader';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileTitle?: string;
  tone?: 'light' | 'brand';
  rightActionLabel?: string;
  rightActionHref?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className, mobileTitle, tone = 'brand', rightActionLabel, rightActionHref }) => {
  const router = useRouter();

  const isUserRoute = router?.pathname?.startsWith('/user');
  const isProductRoute =  router?.pathname === '/' || router?.pathname?.startsWith('/product');
  const isHomeRoute = router?.pathname === '/';

  const computeFallbackTitle = () => {
    const segments = router?.pathname?.split('/') ?? [];
    const last = segments[segments.length - 1] || '';
    if (!last || last === 'user') return 'Account';
    return last
      .replace(/\[|\]|\.+/g, '')
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  };

  const resolvedMobileTitle = mobileTitle || computeFallbackTitle();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header: visible on mobile only for home route, always on desktop */}
      <div className={`${isProductRoute ? '' : 'hidden sm:block'} sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75`}>
        <Header />
      </div>

      {/* Mobile page header for user pages only */}
      {isUserRoute && (
        <div className="sm:hidden">
          <MobilePageHeader 
            title={resolvedMobileTitle}
            tone={tone}
            rightActionLabel={rightActionLabel}
            rightActionHref={rightActionHref}
          />
        </div>
      )}

      <main className={cn('flex-1', className)}>
        {children}
      </main>

      {/* Footer: visible on mobile only for home route, always on desktop */}
      <div className={!isHomeRoute ? 'hidden sm:block' : ''}>
        <Footer />
      </div>

      {/* Toast Clear Button - Fixed Position */}
      <div className="fixed bottom-4 left-4 z-50">
        <ToastClearButton
          variant="ghost"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
        />
      </div>
    </div>
  );
};

export default MainLayout; 