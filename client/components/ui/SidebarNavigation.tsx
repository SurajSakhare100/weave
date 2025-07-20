import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

interface SidebarNavigationProps {
  items: NavigationItem[];
  className?: string;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ items, className = '' }) => {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (label: string) => {
    setOpenItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.label];
    const Icon = item.icon;

    return (
      <div key={item.label}>
        <div
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            level === 0 
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-gray-600 hover:bg-gray-50 ml-4'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.label);
            } else if (item.href) {
              window.location.href = item.href;
            }
          }}
        >
          {Icon && <Icon className="h-4 w-4 mr-3" />}
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {hasChildren && isOpen && (
          <div className="ml-4">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`space-y-1 ${className}`}>
      {items.map(item => renderItem(item))}
    </nav>
  );
};

export default SidebarNavigation; 