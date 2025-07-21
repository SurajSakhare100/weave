import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onUnpublish: () => void;
}

export default function ProductActionBar({
  selectedCount,
  onDelete,
  onUnpublish
}: ProductActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="border-t p-4 flex items-center justify-between">
      <span className="text-sm text-gray-600">
        ✓ {selectedCount} products selected
      </span>
      <div className="flex items-center space-x-3">
        <Button
          variant="vendorSecondary"
          onClick={onDelete}
          className="flex items-center space-x-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
        <Button
          variant="vendorPrimary"
          onClick={onUnpublish}
        >
          Unpublish
        </Button>
      </div>
    </div>
  );
} 