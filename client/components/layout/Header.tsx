import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { ShoppingCart, User, Heart, Search, Menu, X, ArrowDownNarrowWide, ArrowDown, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { getUserToken } from '@/services/authService';
import { RootState } from '@/store/store';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Weave - Multi-Vendor E-commerce' }) => {
  const router = useRouter();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery] = useState('');

  const cartItemCount = items?.length || 0;
  const token = getUserToken();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Multi-vendor e-commerce platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-white" style={{ color: '#5E3A1C' }}>
        <div className="bg-primary text-white text-center py-2 text-base font-medium">
          Shipping available across the globe!
        </div>
        
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <nav className="hidden md:flex text-sm items-center space-x-6 flex-1">
                <div className="relative group">
                  <button className="flex items-center font-medium focus:outline-none">
                    Shop <span className="ml-1">
                      <ChevronDown />
                    </span>
                  </button>
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all">
                    <Link href="/products" className="block px-4 py-2 hover:bg-gray-100">All Products</Link>
                  </div>
                </div>
                <Link href="/wholesale" className="font-medium hover:text-[#cf1a53] transition-colors">
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="font-medium hover:text-[#cf1a53] transition-colors">
                  About Us
                </Link>
                <Link href="/products" className="font-medium hover:text-[#cf1a53] transition-colors">
                  Products
                </Link>
              </nav>

              <div className="">
                <Link href="/" className="flex flex-row items-center space-y-1 gap-1">
                  <img src="/landing/navLogo.png" alt="Weave Logo" className="h-9 w-auto" />
                  <img src="/landing/navImage.png" alt="Weave Logo" className="h-8 w-auto" />
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-6 flex-1 text-sm justify-end">
                <Link href="/search" className="p-2 hover:text-[#cf1a53] transition-colors">
                  <Search className="w-4 h-4" />
                </Link>
                <Link href="/cart" className="relative p-2 hover:text-[#cf1a53] transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link href="/user/wishlist" className="p-2 hover:text-[#cf1a53] transition-colors">
                  <Heart className="w-4 h-4" />
                </Link>
                {isAuthenticated && token ? (
                  <Link href="/user/profile" className="p-2 hover:text-[#cf1a53] transition-colors">
                    <User className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link href="/login" className="p-2 hover:text-[#cf1a53] transition-colors">
                    <User className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:text-[#cf1a53] transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-2 space-y-1">
                <Link href="/products" className="block px-3 py-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Shop
                </Link>
                <Link href="/wholesale" className="block px-3 py-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="block px-3 py-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  About Us
                </Link>
                <div className="flex space-x-4 mt-4">
                  <Link href="/search" className="p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Search className="w-4 h-4" />
                  </Link>
                  <Link href="/cart" className="relative p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/user/wishlist" className="p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="w-4 h-4" />
                  </Link>
                  {isAuthenticated && token ? (
                    <Link href="/user/profile" className="p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link href="/login" className="p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
      </div>
    </>
  );
};

export default Header; 