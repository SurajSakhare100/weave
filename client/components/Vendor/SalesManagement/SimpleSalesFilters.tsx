import React from 'react';

interface SimpleSalesFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

const SimpleSalesFilters: React.FC<SimpleSalesFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-1">Sale Type</label>
        <select
          value={filters.saleType}
          onChange={(e) => onFilterChange({ saleType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Sales</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium mb-1">End Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={() => onFilterChange({ saleType: 'all', startDate: '', endDate: '' })}
        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
};

export default SimpleSalesFilters;
