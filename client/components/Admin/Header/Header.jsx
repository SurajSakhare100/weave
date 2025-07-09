import React, { Fragment } from 'react';
import Link from 'next/link';
import { 
    BarChart3, 
    Package, 
    Tags, 
    Layout, 
    Gift, 
    ShoppingCart, 
    Users, 
    LogOut,
    Menu
} from 'lucide-react';

function Header() {
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
    };

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
        { href: '/admin/layouts', label: 'Layouts', icon: Layout },
        { href: '/admin/cupons', label: 'Coupons', icon: Gift },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/vendors', label: 'Vendors', icon: Users },
    ];

    return (
        <Fragment>
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link 
                            href="/admin/dashboard" 
                            className="flex items-center space-x-2 text-xl font-bold text-[#5A9BD8]"
                        >
                            <BarChart3 size={24} className="text-[#5A9BD8]" />
                            <span>Admin Panel</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-[#5A9BD8] hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            
                            <Link
                                href="/admin/login"
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Logout</span>
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="p-2 rounded-lg text-gray-700 hover:text-[#5A9BD8] hover:bg-blue-50 transition-colors duration-200"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-[#5A9BD8] hover:bg-blue-50 transition-colors duration-200"
                                    >
                                        <Icon size={20} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            
                            <Link
                                href="/admin/login"
                                onClick={handleLogout}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                                <LogOut size={20} />
                                <span className="text-sm font-medium">Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </Fragment>
    );
}

export default Header;