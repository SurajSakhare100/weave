import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface SalesFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-1">Sale Type</label>
        <Select
          value={filters.saleType}
          onValueChange={(value) => onFilterChange({ saleType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sales</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium mb-1">End Date</label>
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
        />
      </div>

      <Button
        variant="outline"
        onClick={() => onFilterChange({ saleType: 'all', startDate: '', endDate: '' })}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
};

export default SalesFilters;
