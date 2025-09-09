import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshCw, Eye } from 'lucide-react';

interface SalesTableProps {
  sales: any[];
  loading: boolean;
  onRefresh: () => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        title="No sales found"
        description="Start recording sales to see them here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale._id}>
              <TableCell>
                {new Date(sale.saleDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{sale.productId?.name}</p>
                  <p className="text-sm text-gray-500">{sale.productId?.category}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={sale.saleType === 'online' ? 'default' : 'secondary'}>
                  {sale.saleType}
                </Badge>
              </TableCell>
              <TableCell>
                {sale.customerName || 'N/A'}
              </TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell>₹{sale.totalAmount}</TableCell>
              <TableCell>
                <Badge variant="outline">{sale.paymentMethod}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                  {sale.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
