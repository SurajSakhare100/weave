import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

interface StockMovementsTableProps {
  movements: any[];
}

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({ movements }) => {
  if (movements.length === 0) {
    return (
      <EmptyState
        title="No stock movements"
        description="Stock movements will appear here once you start updating inventory"
      />
    );
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
      case 'return':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
      case 'damage':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
      case 'return':
        return 'bg-green-100 text-green-800';
      case 'out':
      case 'damage':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Previous Stock</TableHead>
          <TableHead>New Stock</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement._id}>
            <TableCell>
              {new Date(movement.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{movement.productId?.name}</p>
                <p className="text-sm text-gray-500">{movement.productId?.category}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getMovementIcon(movement.movementType)}
                <Badge className={getMovementColor(movement.movementType)}>
                  {movement.movementType}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
              </span>
            </TableCell>
            <TableCell>{movement.previousStock}</TableCell>
            <TableCell className="font-medium">{movement.newStock}</TableCell>
            <TableCell>
              <div>
                <p className="text-sm">{movement.reason}</p>
                {movement.notes && (
                  <p className="text-xs text-gray-500">{movement.notes}</p>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockMovementsTable;
