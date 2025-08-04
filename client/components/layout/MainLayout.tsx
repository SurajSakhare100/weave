import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ToastClearButton from '../ui/ToastClearButton';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      <Footer />
      
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