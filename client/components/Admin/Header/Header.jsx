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
    const handleLogout = async () => {
        try {
            // Call logout endpoint to clear cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include' // Include cookies
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
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
            <header className="admin-bg-primary admin-shadow-sm border-b admin-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link 
                            href="/admin/dashboard" 
                            className="flex items-center space-x-2 text-xl font-bold admin-text-primary"
                        >
                            <BarChart3 size={24} className="admin-text-primary" />
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
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg admin-text-secondary hover:admin-text-primary hover:admin-bg-secondary transition-colors duration-200"
                                    >
                                        <Icon size={18} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            
                            <Link
                                href="/admin/login"
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg admin-text-danger hover:admin-text-danger-dark hover:admin-bg-danger-light transition-colors duration-200"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Logout</span>
                            </Link>
                        </nav>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="p-2 rounded-lg admin-text-secondary hover:admin-text-primary hover:admin-bg-secondary transition-colors duration-200"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t admin-border-primary">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center space-x-3 px-3 py-2 rounded-lg admin-text-secondary hover:admin-text-primary hover:admin-bg-secondary transition-colors duration-200"
                                    >
                                        <Icon size={20} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                            
                            <Link
                                href="/admin/login"
                                onClick={handleLogout}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg admin-text-danger hover:admin-text-danger-dark hover:admin-bg-danger-light transition-colors duration-200"
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