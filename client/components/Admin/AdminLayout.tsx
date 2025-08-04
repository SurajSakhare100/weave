import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
    Menu,
    X,
    Settings,
    User,
    Bell,
    Search
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Admin Panel", description = "Manage your application" }) => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/categories', label: 'Categories', icon: Tags },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/vendors', label: 'Vendors', icon: Users },
    ];

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            toast.success('Logged out successfully');
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isActive = (href: string) => router.pathname === href;

    return (
        <div className="min-h-screen flex admin-bg-secondary">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <Link 
                            href="/admin/dashboard" 
                            className="flex items-center space-x-2 text-xl font-bold text-gray-900"
                        >
                            <BarChart3 size={24} className="text-blue-600" />
                            <span>Admin Panel</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                        isActive(item.href)
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex items-center w-full space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                            <LogOut size={18} />
                            <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Page Title */}
                        <div className="flex-1 lg:flex-none">
                            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">{title}</h1>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} />
                            </button>

                            {/* User menu */}
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        <p className="mt-2 text-gray-600">{description}</p>
                    </div>

                    {/* Content */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 