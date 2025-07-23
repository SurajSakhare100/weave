import React from 'react';
import { ChevronRight, ChevronUp, User, MapPin, CreditCard, ShoppingBag, Settings } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SettingsLayout({ children, activeSection, onSectionChange }: SettingsLayoutProps) {
  const navigationItems = [
    { id: 'edit-profile', label: 'Edit Profile' },
    { id: 'profile', label: 'Profile', hasSubItem: true, subItem: 'Settings' },
    { id: 'addresses', label: 'Addresses', hasSubItem: true, subItem: 'Edit & add new address' },
    { id: 'payments', label: 'Payments & Refunds' },
    { id: 'past-orders', label: 'Past Orders' },
  ];

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl   p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">Profile</h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const isAddressesActive = item.id === 'addresses' && isActive;
                  const isProfileActive = item.id === 'profile' && isActive;
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-[#faf5f2] text-primary border border-primary/20' 
                            : 'text-[#6b7280] hover:bg-gray-50 hover:text-primary'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.hasSubItem ? (
                          (isAddressesActive || isProfileActive) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      {item.hasSubItem && (isAddressesActive || isProfileActive) && (
                        <div className="ml-4 mt-2">
                          <div className="text-sm text-[#EE346C] font-medium px-3 py-2">
                            {item.subItem}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1 max-w-4xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 