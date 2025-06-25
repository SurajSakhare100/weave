import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBag, User, Search, Heart, ChevronDown, Building, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { isVendorAuthenticated, vendorLogout } from '../utils/vendorAuth';
import { logout } from '../features/user/userSlice';
import { logout as vendorLogoutAction } from '../features/vendor/vendorSlice';
import { useRouter } from 'next/router';

const Header = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { profile, isAuthenticated } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);
  const isVendor = isVendorAuthenticated();
  const dispatch = useDispatch();
  const router = useRouter();

  // Calculate cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    if (isVendor) {
      vendorLogout();
      dispatch(vendorLogoutAction());
      router.push('/');
    } else {
      dispatch(logout());
      router.push('/');
    }
  };

  return (
    <header className="bg-white text-[#6b4f4f]">
      <div className="bg-[#5d4037]  py-2 ">
      <p className="text-center text-sm text-white ">
      Shipping available across the globe!
      </p>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6 relative">
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative" onMouseEnter={() => setIsShopOpen(true)} onMouseLeave={() => setIsShopOpen(false)}>
              <button className="flex items-center hover:text-pink-500 transition-colors">
                Shop <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isShopOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-2 w-48 z-10">
                  <Link href="/products"  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Products</Link>
                  <Link href="/products?category=category-1"  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Category 1</Link>
                  <Link href="/products?category=category-2"  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Category 2</Link>
                </div>
              )}
            </div>
            <Link href="/wholesale"  className="hover:text-pink-500 transition-colors">Wholesale & Bulk Inquiry</Link>
            <Link href="/about"  className="hover:text-pink-500 transition-colors">About Us</Link>
            <Link href="/products"  className="hover:text-pink-500 transition-colors">Products</Link>
            
            {/* Vendor Navigation */}
            {isVendor && (
              <div className="relative" onMouseEnter={() => setIsVendorOpen(true)} onMouseLeave={() => setIsVendorOpen(false)}>
                <button className="flex items-center hover:text-pink-500 transition-colors">
                  <Building className="h-4 w-4 mr-1" />
                  Vendor <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {isVendorOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-2 w-48 z-10">
                    <Link href="/vendor/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                    <Link href="/vendor/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Products</Link>
                    <Link href="/vendor/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                    <Link href="/vendor/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href={isVendor ? "/vendor/dashboard" : "/"}  className='cursor-pointer flex items-center gap-2'>
               <div  className='flex gap-2 items-center'>
               <Image src="/landing/navLogo.png" alt="Weave Logo" width={40} height={40} />
               <Image src="/landing/navImage.png" alt="Weave Logo" width={100} height={40} />
               </div>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/search"  className="hover:text-pink-500">
              <Search className="h-6 w-6" />
            </Link>
            {!isVendor && (
              <>
                <Link href="/cart" className="hover:text-pink-500 relative">
                    <ShoppingBag className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                </Link>
                <Link href="/user/wishlist"  className="hover:text-pink-500">
                    <Heart className="h-6 w-6" />
                </Link>
              </>
            )}
            
            {/* User Menu */}
            <div className="relative" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
              <Link href={isVendor ? "/vendor/profile" : (isAuthenticated ? "/user/profile" : "/login")}  className="hover:text-pink-500">
                  <User className="h-6 w-6" />
              </Link>
              {(isAuthenticated || isVendor) && isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md py-2 w-48 z-10">
                  <Link href={isVendor ? "/vendor/profile" : "/user/profile"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  {!isVendor && (
                    <>
                      <Link href="/user/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Orders
                      </Link>
                      <Link href="/user/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Wishlist
                      </Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 