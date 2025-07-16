import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { logout } from '../features/vendor/vendorSlice';
import { vendorLogout } from '../utils/vendorAuth';
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
  Menu,
  X,
  Sun,
  Moon,
  Star
} from 'lucide-react';

const sidebarSections = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/vendor/dashboard',
  },
  {
    label: 'Product',
    icon: Package,
    children: [
      { label: 'Analytics', icon: BarChart2, href: '/vendor/products/analytics' },
      { label: 'Drafts', icon: FileText, href: '/vendor/products/drafts' },
      { label: 'Released', icon: Send, href: '/vendor/products/released' },
      { label: 'Comments', icon: MessageCircle, href: '/vendor/products/comments' },
      { label: 'Scheduled', icon: Calendar, href: '/vendor/products/scheduled' },
    ],
  },
  {
    label: 'Reviews',
    icon: Star,
    href: '/vendor/reviews',
  },
  {
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'Customer Insights', icon: Users, href: '/vendor/customers/insights' },
      { label: 'Segments', icon: Users, href: '/vendor/customers/segments' },
    ],
  },
  {
    label: 'Store',
    icon: Store,
    children: [
      { label: 'Settings', icon: Settings, href: '/vendor/store/settings' },
      { label: 'Payments', icon: CreditCard, href: '/vendor/store/payments' },
      { label: 'Statements', icon: FileText, href: '/vendor/store/statements' },
    ],
  },
  {
    label: 'Revenue',
    icon: DollarSign,
    children: [
      { label: 'Earnings', icon: DollarSign, href: '/vendor/revenue/earnings' },
      { label: 'Refunds', icon: DollarSign, href: '/vendor/revenue/refunds' },
      { label: 'Payouts', icon: CreditCard, href: '/vendor/revenue/payouts' },
      { label: 'Statements', icon: FileText, href: '/vendor/revenue/statements' },
    ],
  },
  {
    label: 'Discount',
    icon: Percent,
    href: '/vendor/discount',
  },
];

const VendorLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [theme, setTheme] = useState('light');

  const handleLogout = () => {
    vendorLogout();
    dispatch(logout());
    router.push('/vendor/login');
  };

  const isActive = (href) => router.pathname === href;
  const isParentActive = (children) => children?.some((c) => isActive(c.href));

  const handleMenuToggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    // Optionally: add logic to update document class for dark mode
  };

  // Sidebar rendering
  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-200 rounded-xl shadow-sm">
      {/* Logo/Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Store className="h-8 w-8 text-[#5A9BD8] mr-2" />
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
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (hasChildren) handleMenuToggle(section.label);
                  else if (section.href) router.push(section.href);
                }}
                aria-expanded={open}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive(section.href) || isParentActive(section.children) ? 'text-white' : 'text-[#5A9BD8]'}`} />
                <span className="flex-1 text-left">{section.label}</span>
                {hasChildren && (
                  <svg className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                )}
              </button>
              {/* Submenu */}
              {hasChildren && open && (
                <div className="ml-7 mt-1 space-y-1">
                  {section.children.map((child) => {
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
                        <ChildIcon className={`h-4 w-4 mr-3 ${isActive(child.href) ? 'text-white' : 'text-[#5A9BD8]'}`} />
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
      {/* Theme toggle and logout */}
      <div className="mt-auto px-4 py-4 border-t border-gray-100 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <button
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${theme === 'light' ? 'bg-[#f4f8fb] text-gray-700 border-gray-200' : 'bg-gray-800 text-white border-gray-700'}`}
            onClick={handleThemeToggle}
          >
            {theme === 'light' ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col">
          {Sidebar}
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:sticky lg:top-0">
        {Sidebar}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Store className="h-6 w-6 text-[#5A9BD8] mr-2" />
              <span className="font-semibold text-gray-800">Vendor Panel</span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout; 