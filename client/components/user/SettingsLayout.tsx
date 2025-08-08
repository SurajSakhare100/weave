import React from 'react';
import { ChevronRight, ChevronUp } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SettingsLayout({ children, activeSection, onSectionChange }: SettingsLayoutProps) {
  const navigationItems = [
    { id: 'edit-profile', label: 'Edit Profile' },
    { id: 'profile', label: 'My Account', hasSubItem: false },
    { id: 'addresses', label: 'Addresses', hasSubItem: true, subItem: 'Edit & add new address' },
    { id: 'payments', label: 'Payments & Refunds' },
    { id: 'past-orders', label: 'Past Orders' },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 sm:px-8 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="rounded-2xl p-0">
              <h2 className="text-xl font-semibold text-[#6c4323] mb-4">Profile</h2>
              <nav className="divide-y divide-[#E7D9CC] border-b border-[#E7D9CC]">
                {navigationItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const isAddressesActive = item.id === 'addresses' && isActive;

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => onSectionChange(item.id)}
                        className={`w-full flex items-center justify-between py-4 text-left transition-colors ${
                          isActive ? 'text-[#6c4323]' : 'text-[#6c4323]'
                        } px-0`}
                      >
                        <span className={`text-lg ${item.hasSubItem && isAddressesActive ? 'text-primary' : ''}`}>
                          {item.label}
                        </span>
                        {item.hasSubItem ? (
                          isAddressesActive ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {item.hasSubItem && isAddressesActive && (
                        <div className="py-3 pl-0">
                          <div className="text-base text-[#8b7355]">
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