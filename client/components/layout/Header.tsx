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
  const items = useSelector((state: RootState) => state?.cart?.items ?? []);
  const isAuthenticated = useSelector((state: RootState) => state?.user?.isAuthenticated ?? false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="bg-[#5E3A1C] text-white text-center py-2 text-sm ">
          Shipping available across the globe!
        </div>
        
        <header className="bg-white sticky top-0 z-50 border-b ">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <nav className="hidden md:flex text-sm items-center space-x-8 flex-1 text-secondary">
                <div className="relative group">
                  <button className="flex items-center font-medium focus:outline-none hover:text-[#6c4323]">
                    Shop <span className="ml-1">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all">
                    <Link href="/products" className="block px-4 py-2 hover:bg-gray-100">All Products</Link>
                  </div>
                </div>
                <Link href="/wholesale" className="font-medium hover:text-[#6c4323] transition-colors">
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="font-medium hover:text-[#6c4323] transition-colors">
                  About Us
                </Link>
                <Link href="/products" className="font-medium hover:text-[#6c4323] transition-colors">
                  Products
                </Link>
              </nav>

              <div className="">
                <Link href="/" className="flex flex-row items-center space-y-1 gap-1">
                  <img src="/landing/navLogo.png" alt="Weave Logo" className="h-9 w-auto" />
                  <img src="/landing/navImage.png" alt="Weave Logo" className="h-8 w-auto" />
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-6 flex-1 text-sm justify-end text-secondary">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-64 px-4 py-2 border border-[#E7D9CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E7D9CC] text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:text-[#6c4323]"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
                <Link href="/cart" className="relative p-2 hover:text-[#6c4323] transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link href="/user/wishlist" className="p-2 hover:text-[#6c4323] transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                {isAuthenticated && token ? (
                  <Link href="/user/settings" className="p-2 hover:text-[#6c4323] transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/login" className="p-2 hover:text-[#6c4323] transition-colors">
                    <User className="w-5 h-5" />
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
                <form onSubmit={handleSearch} className="w-full mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#cf1a53]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </form>
                <div className="flex space-x-4">
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
                    <Link href="/user/settings" className="p-2 hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
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