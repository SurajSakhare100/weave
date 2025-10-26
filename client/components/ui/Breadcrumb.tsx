import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const router = useRouter();

  const handleClick = (item: BreadcrumbItem) => {
    if (item.href && !item.isCurrent) {
      router.push(item.href);
    }
  };

  return (
    <nav className={`flex items-center space-x-2  ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span
            className={`transition-colors  text-lg  ${
              item.isCurrent
                ? 'text-primary font-medium'
                : item.href
                ? 'text-primary hover:text-secondary cursor-pointer'
                : 'text-primary'
            } `}
            onClick={() => handleClick(item)}
          >
            {item.label}
          </span>
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-primary" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb; 