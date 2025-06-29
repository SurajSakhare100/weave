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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Weave</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">
                  Home
                </Link>
                <Link href="/products" className="text-gray-700 hover:text-pink-600 transition-colors">
                  Products
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
                  About
                </Link>
                <Link href="/wholesale" className="text-gray-700 hover:text-pink-600 transition-colors">
                  Wholesale
                </Link>
              </nav>

              {/* Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                
                <Link href="/user/wishlist" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
                  <Heart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated && token ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-pink-600 transition-colors">
                      <User className="h-6 w-6" />
                      <span>Account</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link href="/user/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center space-x-2 p-2 text-gray-700 hover:text-pink-600 transition-colors">
                    <User className="h-6 w-6" />
                    <span>Login</span>
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden border-t border-gray-200 p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/wholesale"
                className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wholesale
              </Link>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/user/wishlist"
                  className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated && token ? (
                  <>
                    <Link
                      href="/user/profile"
                      className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/user/orders"
                      className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <span className="text-xl font-bold">Weave</span>
                </div>
                <p className="text-gray-400">
                  Your trusted multi-vendor e-commerce platform for quality products.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/wholesale" className="text-gray-400 hover:text-white transition-colors">Wholesale</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
                  <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
                  <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Account</h3>
                <ul className="space-y-2">
                  <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link></li>
                  <li><Link href="/vendor/login" className="text-gray-400 hover:text-white transition-colors">Vendor Login</Link></li>
                  <li><Link href="/vendor/register" className="text-gray-400 hover:text-white transition-colors">Become a Vendor</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
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