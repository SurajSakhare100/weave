import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { ShoppingCart, User, Heart, Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { getUserToken } from '../services/authService';

const Layout = ({ children, title = 'Weave - Multi-Vendor E-commerce' }) => {
  const router = useRouter();
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated, wishlist } = useSelector((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const cartItemCount = items?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const token = getUserToken();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // Clear tokens and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('vendorToken');
      window.location.href = '/login';
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

      <div className="min-h-screen bg-white" style={{ color: '#5E3A1C' }}>
        {/* Top Bar */}
        <div className="bg-primary text-white text-center py-2 text-base font-medium">
          Shipping available across the globe!
        </div>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Left Nav */}
              <nav className="hidden md:flex text-sm items-center space-x-6 flex-1">
                <div className="relative group">
                  <button className="flex items-center text-[var(--primary)] font-medium  focus:outline-none">
                    Shop <span className="ml-1">▼</span>
                  </button>
                  {/* Dropdown placeholder */}
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all">
                    <a href="/products" className="block px-4 py-2 text-[var(--primary)] hover:bg-gray-100">All Products</a>
                    {/* Add more categories here if needed */}
                  </div>
                </div>
                <Link href="/wholesale" className="text-[var(--primary)] font-medium  hover:text-[#cf1a53] transition-colors">
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="text-[var(--primary)] font-medium  hover:text-[#cf1a53] transition-colors">
                  About Us
                </Link>
                <Link href="/products" className="text-[var(--primary)] font-medium  hover:text-[#cf1a53] transition-colors">
                  Products
                </Link>
              </nav>

              {/* Logo Centered */}
              <div className="flex-1 flex justify-center">
                <Link href="/" className="flex flex-row items-center space-y-1">
                  <img src="/landing/navLogo.png" alt="Weave Logo" className="h-12 w-auto" />
                  <span className="text-3xl font-logo text-primary font-normal">Weave</span>
                </Link>
              </div>

              {/* Right Actions */}
              <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">
                <Link href="/search" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors">
                  <Search className="h-6 w-6" />
                </Link>
                <Link href="/cart" className="relative p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link href="/user/wishlist" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors">
                  <Heart className="h-6 w-6" />
                </Link>
                {isAuthenticated && token ? (
                  <Link href="/user/profile" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors">
                    <User className="h-6 w-6" />
                  </Link>
                ) : (
                  <Link href="/login" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors">
                    <User className="h-6 w-6" />
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-2 space-y-1">
                <Link href="/products" className="block px-3 py-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Shop
                </Link>
                <Link href="/wholesale" className="block px-3 py-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="block px-3 py-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  About Us
                </Link>
                <div className="flex space-x-4 mt-4">
                  <Link href="/search" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Search className="h-6 w-6" />
                  </Link>
                  <Link href="/cart" className="relative p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/user/wishlist" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="h-6 w-6" />
                  </Link>
                  {isAuthenticated && token ? (
                    <Link href="/user/profile" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="h-6 w-6" />
                    </Link>
                  ) : (
                    <Link href="/login" className="p-2 text-[var(--primary)] hover:text-[#cf1a53] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="h-6 w-6" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[var(--primary)] text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <img src="/landing/navLogo.png" alt="Weave Logo" className="h-10 w-auto" />
                  <span className="text-2xl font-logo font-normal" style={{ fontFamily: 'cursive' }}>Weave</span>
                </div>
                <p className="text-[#e5d6c3]">
                  Your trusted multi-vendor e-commerce platform for quality products.
                </p>
              </div>
              <div>
                <h3 className=" font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-[#e5d6c3] hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/products" className="text-[#e5d6c3] hover:text-white transition-colors">Shop</Link></li>
                  <li><Link href="/about" className="text-[#e5d6c3] hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/wholesale" className="text-[#e5d6c3] hover:text-white transition-colors">Wholesale & Bulk Inquiry</Link></li>
                </ul>
              </div>
              <div>
                <h3 className=" font-semibold mb-4">Customer Service</h3>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-[#e5d6c3] hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="/shipping" className="text-[#e5d6c3] hover:text-white transition-colors">Shipping Info</Link></li>
                  <li><Link href="/returns" className="text-[#e5d6c3] hover:text-white transition-colors">Returns</Link></li>
                  <li><Link href="/faq" className="text-[#e5d6c3] hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className=" font-semibold mb-4">Account</h3>
                <ul className="space-y-2">
                  <li><Link href="/login" className="text-[#e5d6c3] hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/register" className="text-[#e5d6c3] hover:text-white transition-colors">Register</Link></li>
                  <li><Link href="/vendor/login" className="text-[#e5d6c3] hover:text-white transition-colors">Vendor Login</Link></li>
                  <li><Link href="/vendor/register" className="text-[#e5d6c3] hover:text-white transition-colors">Become a Vendor</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[#e5d6c3] mt-8 pt-8 text-center">
              <p className="text-[#e5d6c3]">
                © {new Date().getFullYear()} Weave. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 