import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/vendor/vendorSlice';
import { vendorLogout } from '@/services/vendorService';
import {
  LayoutDashboard,
  Package,
  BarChart2,
  FileText,
  Send,
  MessageCircle,
  Calendar,
  Users,
  Store,
  Settings,
  CreditCard,
  DollarSign,
  Percent,
  LogOut,
  PackageCheck
} from 'lucide-react';

interface SidebarSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
  }>;
}

const sidebarSections: SidebarSection[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/vendor/dashboard',
  },
  {
    label: 'Product',
    icon: Package,
    children: [
      { label: 'All Products', icon: Package, href: '/vendor/products' },
      { label: 'Drafts', icon: FileText, href: '/vendor/products/drafts' },
      { label: 'Released', icon: Send, href: '/vendor/products/released' },
      { label: 'Reviews', icon: MessageCircle, href: '/vendor/products/reviews' },
      { label: 'Scheduled', icon: Calendar, href: '/vendor/products/scheduled' },
    ],
  },
  
  {
    label: 'Orders',
    icon: PackageCheck,
    children: [
      { label: 'All Orders', icon: PackageCheck, href: '/vendor/orders' },
      // { label: 'Pending', icon: PackageCheck, href: '/vendor/orders/pending' },
      // { label: 'Delivered', icon: PackageCheck, href: '/vendor/orders/delivered' },
      // { label: 'Cancelled', icon: PackageCheck, href: '/vendor/orders/cancelled' },
    ],
  },
  // {
  //   label: 'Store',
  //   icon: Store,
  //   children: [
  //     { label: 'Settings', icon: Settings, href: '/vendor/store/settings' },
  //     { label: 'Payments', icon: CreditCard, href: '/vendor/store/payments' },
  //     { label: 'Statements', icon: FileText, href: '/vendor/store/statements' },
  //   ],
  // },
  {
    label: 'Revenue',
    icon: DollarSign,
    children: [
      { label: 'Earnings', icon: DollarSign, href: '/vendor/revenue/earnings' },
      // { label: 'Refunds', icon: DollarSign, href: '/vendor/revenue/refunds' },
      // { label: 'Payouts', icon: CreditCard, href: '/vendor/revenue/payouts' },
      // { label: 'Statements', icon: FileText, href: '/vendor/revenue/statements' },
    ],
  },
  // {
  //   label: 'Discount',
  //   icon: Percent,
  //   href: '/vendor/discount',
  // },
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleLogout = async () => {
    try {
      await vendorLogout();
      dispatch(logout());
      router.push('/vendor/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch(logout());
      router.push('/vendor/login');
    }
  };

  const isActive = (href?: string) => href ? router.pathname === href : false;
  const isParentActive = (children?: Array<{ href: string }>) => 
    children?.some((c) => isActive(c.href)) || false;

  const handleMenuToggle = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };



  // Sidebar rendering
  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-200 p-2 rounded-xl shadow-sm">
      {/* Logo/Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Store className="h-8 w-8 vendor-text-secondary mr-2" />
        <span className="text-lg font-semibold text-gray-800">Vendor Panel</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {sidebarSections.map((section) => {
          const Icon = section.icon;
          const hasChildren = !!section.children;
          const open = openMenus[section.label] || isParentActive(section.children);
          return (
            <div key={section.label} className="mb-1">
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    (isActive(section.href) || isParentActive(section.children))
                      ? 'bg-[#5A9BD8] text-white shadow'
                      : 'vendor-text-secondary hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (hasChildren) handleMenuToggle(section.label);
                  else if (section.href) router.push(section.href);
                }}
                aria-expanded={open}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive(section.href) || isParentActive(section.children) ? 'text-white' : ''}`} />
                <span className="flex-1 text-left font-semiboldy">{section.label}</span>
                {hasChildren && (
                  <svg className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                )}
              </button>
              {/* Submenu */}
              {hasChildren && open && (
                <div className="ml-7 mt-1 space-y-1">
                  {section?.children?.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <button
                        key={child.label}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive(child.href)
                            ? 'bg-[#5A9BD8] text-white shadow'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
                        `}
                        onClick={() => router.push(child.href)}
                      >
                        <ChildIcon className={`h-4 w-4 mr-3 ${isActive(child.href) ? 'text-white' : 'vendor-text-secondary'}`} />
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="mt-auto px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen vendor-bg-primary vendor-text-primary">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {Sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {Sidebar}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        {/* <div className="sticky top-0 z-30 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#5A9BD8] lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div> */}

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout; 