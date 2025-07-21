import React from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DraftsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export default function DraftsHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange
}: DraftsHeaderProps) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search product"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 text-[#3475A6] placeholder:text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'list' ? 'vendorPrimary' : 'vendorSecondary'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'vendorPrimary' : 'vendorSecondary'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Grid
        </Button>
      </div>
      </div>
    </div>
  );
} 