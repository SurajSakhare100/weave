import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { ShoppingCart, User, Heart, Search, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getUserToken } from '@/services/authService';
import { RootState } from '@/store/store';
import { getHeaderCategories } from '@/services/categoryService';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Weave - Multi-Vendor E-commerce' }) => {
  const router = useRouter();
  const items = useSelector((state: RootState) => state?.cart?.items ?? []);
  const isAuthenticated = useSelector((state: RootState) => state?.user?.isAuthenticated ?? false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const cartItemCount = items?.length || 0;
  const token = getUserToken();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getHeaderCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching header categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Multi-vendor e-commerce platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div >
        <div className="bg-none bg-primary">
         <p className="text-accent text-center py-2 text-sm"> Shipping available across the globe!</p>
        </div>
        
        <header className="bg-white sticky top-0 z-40 border-b border-[#F0F0F0]">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-3 items-center h-20">
              <nav className="text-sm items-center gap-6 xl:gap-8 text-secondary flex">
                <div className="relative group">
                  <button className="flex items-center font-medium focus:outline-none text-secondary hover:text-bold">
                    Shop <span className="ml-1">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all">
                    <Link href="/products" className="block px-4 py-2 hover:bg-gray-100">All Products</Link>
                    {categories.length > 0 && categories.map((category) => (
                      <Link 
                        key={category?._id} 
                        href={`/products?category=${category.slug || category.name}`} 
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {category?.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/wholesale" className="font-medium text-secondary hover:text-bold transition-colors xl:hidden">
                  Wholesale
                </Link>
                <Link href="/wholesale" className="font-medium text-secondary hover:text-bold transition-colors hidden xl:inline">
                  Wholesale & Bulk Inquiry
                </Link>
                <Link href="/about" className="font-medium text-secondary hover:text-bold transition-colors">
                  About Us
                </Link>
                <Link href="/products" className="font-medium text-secondary hover:text-bold transition-colors">
                  Products
                </Link>
              </nav>

              <div className="justify-self-center">
                <Link href="/" className="flex flex-row items-center space-y-1 gap-1">
                  <img src="/landing/navLogo.png" alt="Weave Logo" className="h-9 w-auto" />
                  <img src="/landing/navImage.png" alt="Weave Logo" className="h-8 w-auto" />
                </Link>
              </div>

              <div className="items-center space-x-2 text-sm justify-end text-secondary flex">
                <Link href="/search" className="p-2 text-secondary hover:text-bold transition-colors">
                  <Search className="w-5 h-5" />
                </Link>
                <Link href="/user/cart" className="relative p-2 text-secondary hover:text-bold transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-accent text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link href="/user/wishlist" className="p-2 text-secondary hover:text-bold transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                {isAuthenticated && token ? (
                  <Link href="/user/settings" className="p-2 text-secondary hover:text-bold transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/login" className="p-2 text-secondary hover:text-bold transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile header */}
            <div className="md:hidden flex items-center justify-between h-14">
              <button
                aria-label="Open menu"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-primary"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex flex-row items-center gap-1">
                <img src="/landing/navLogo.png" alt="Weave Logo" className="h-7 w-auto" />
                <img src="/landing/navImage.png" alt="Weave Logo" className="h-6 w-auto" />
              </Link>

              <div className="flex items-center gap-3 text-primary">
                <Link href="/search" aria-label="Search" className="p-1">
                  <Search className="w-5 h-5" />
                </Link>
                <Link href="/user/cart" aria-label="Cart" className="relative p-1">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-accent text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated && token ? (
                  <Link href="/user/settings" aria-label="Account" className="p-1">
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/login" aria-label="Login" className="p-1">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <>
              {/* overlay */}
              <div
                className="md:hidden fixed inset-0 z-[50] bg-black/40"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* drawer */}
              <div className="md:hidden fixed inset-y-0 left-0 z-[60] bg-white h-screen w-[90%] overflow-y-auto shadow-lg transition-transform transform translate-x-0">
              <div className="flex items-center justify-between h-14 px-4 border-b">
                <button
                  aria-label="Close menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4">
                <button 
                  className="w-full flex items-center justify-between py-5 text-primary text-xl" 
                  onClick={() => { 
                    router.push('/products'); 
                    setIsMobileMenuOpen(false); 
                  }}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className="w-full flex items-center justify-between py-4 text-primary text-base pl-4"
                    onClick={() => {
                      router.push(`/products?category=${category.slug}`);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span>{category.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
                <button className="w-full flex items-center justify-between py-5 text-primary text-xl" onClick={() => { router.push({ pathname: '/products', query: { sort: '-discount' } }); setIsMobileMenuOpen(false); }}>
                  <span>Sale</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button className="w-full flex items-center justify-between py-5 text-primary text-xl" onClick={() => { router.push('/about'); setIsMobileMenuOpen(false); }}>
                  <span>About Us</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="w-full flex items-center justify-between py-5 text-primary text-xl" onClick={() => { router.push('/wholesale'); setIsMobileMenuOpen(false); }}>
                  <span>Wholesale & Export Inquiry</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="w-full flex items-center justify-between py-5 text-primary text-xl" onClick={() => { router.push(isAuthenticated && token ? '/user/settings' : '/login'); setIsMobileMenuOpen(false); }}>
                  <span>My Account</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute left-0 right-0 bottom-6 px-6">
                <Link href="/user/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-primary">
                  <Heart className="w-6 h-6" />
                  <span className="underline text-lg">View Wishlist</span>
                </Link>
              </div>
              </div>
            </>
          )}
        </header>
      </div>
    </>
  );
};

export default Header; 