import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Calendar, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

import AdminLayout from '../../../components/Admin/AdminLayout';
import AdminProtected from '../../../components/Admin/AdminProtected';
import { 
  useGetVendorDetailsQuery, 
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation 
} from '../../../services/adminApi';
import { 
  formatCurrency, 
  formatDate, 
  getVendorStatusColor 
} from '../../../utils/adminUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function VendorDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  // State for time range and sorting
  const [timeRange, setTimeRange] = useState('12');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

  // Fetch vendor details
  const { 
    data: vendorDetails, 
    error, 
    isLoading 
  } = useGetVendorDetailsQuery(id as string, {
    // Skip the query if id is undefined
    skip: !id
  });

  // Mutations for vendor actions
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  // State for dropdown menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate monthly sales with time range and sorting
  const monthlySales = useMemo(() => {
    if (!vendorDetails?.sales) return [];
    
    // Convert sales object to sorted array of sales
    const salesArray = Object.entries(vendorDetails.sales)
      .map(([monthYear, saleData]) => ({
        month: monthYear.split(' ')[0], // Extract month name
        year: monthYear.split(' ')[1], // Extract year
        ...(typeof saleData === 'object' && saleData !== null
          ? saleData
          : {
              totalSales: 0,
              totalQuantity: 0,
              uniqueOrders: 0,
              products: [],
            }),
      }))
      .sort((a, b) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        
        // First sort by year (descending)
        if (a.year !== b.year) {
          return parseInt(b.year) - parseInt(a.year);
        }
        
        // Then sort by month (descending)
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      })
      .filter((_, index) => {
        switch(timeRange) {
          case '3': return index < 3;
          case '6': return index < 6;
          case '12': return index < 12;
          default: return true;
        }
      });

    // Apply additional sorting based on sortBy
    return salesArray.sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          // Already sorted from newest to oldest
          return 0;
        case 'oldest':
          // Reverse the existing sorting
          const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
          const yearDiff = parseInt(a.year) - parseInt(b.year);
          if (yearDiff !== 0) return yearDiff;
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        case 'highest':
          return b.totalSales - a.totalSales;
        case 'lowest':
          return a.totalSales - b.totalSales;
        default:
          return 0;
      }
    });
  }, [vendorDetails?.sales, timeRange, sortBy]);

  // Calculate total sales for the selected period
  const periodTotalSales = useMemo(() => {
    return monthlySales.reduce((sum, sale) => sum + sale.totalSales, 0);
  }, [monthlySales]);

  // Handle vendor status update
  const handleStatusUpdate = async (status: string) => {
    try {
      await updateVendorStatus({ 
        vendorId: id as string, 
        status: status as 'pending' | 'approved' | 'suspended'  
      }).unwrap();
      toast.success(`Vendor status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update vendor status');
    }
  };

  // Handle vendor deletion
  const handleDeleteVendor = async () => {
    try {
      await deleteVendor(id as string).unwrap();
      toast.success('Vendor deleted successfully');
      router.push('/admin/vendors');
    } catch (err) {
      toast.error('Failed to delete vendor');
    }
  };

  // Render loading state
  if (isLoading) return <LoadingSpinner />;
  
  // Render error state
  if (error) return <div>Error loading vendor details</div>;

  // Render vendor details
  return (
    <AdminProtected>
      <AdminLayout 
        title={`Vendor Details: ${vendorDetails?.name || 'Unknown'}`} 
        description="Comprehensive vendor information and performance metrics"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className='flex flex-col gap-4'>
            {/* Vendor Basic Information */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Vendor Profile</CardTitle>
              <div className="absolute top-4 right-4">
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => router.push(`/admin/vendor/edit/${vendorDetails?._id}`)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Vendor
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDeleteVendor} 
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Vendor
                    </DropdownMenuItem>
                    {vendorDetails?.status !== 'approved' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate('approved')} 
                        className="cursor-pointer"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Vendor
                      </DropdownMenuItem>
                    )}
                    {vendorDetails?.status !== 'suspended' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate('suspended')} 
                        className="text-warning cursor-pointer"
                      >
                        <Ban className="mr-2 h-4 w-4" /> Suspend Vendor
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p>{vendorDetails?.businessName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{vendorDetails?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{vendorDetails?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{vendorDetails?.address ? `${vendorDetails.address}, ${vendorDetails.city}, ${vendorDetails.state} ${vendorDetails.pinCode}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span 
                    className={`px-2 py-1 rounded text-xs ${getVendorStatusColor(vendorDetails?.status)}`}
                  >
                    {vendorDetails?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Performance Metrics */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="font-semibold">
                      {formatCurrency(vendorDetails?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="font-semibold">
                      {vendorDetails?.totalProducts || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined On</p>
                    <p className="font-semibold">
                      {formatDate(vendorDetails?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Revenue Analytics */}
          <Card className="md:col-span-2 h-fit">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Revenue Breakdown</CardTitle>
                <div className="flex space-x-2">
                  {/* Time Range Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {timeRange} Months <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTimeRange('3')}>
                        Last 3 Months
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeRange('6')}>
                        Last 6 Months
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeRange('12')}>
                        Last 12 Months
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sorting Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="mr-2 h-4 w-4" /> 
                        Sort: {
                          sortBy === 'newest' ? 'Newest' :
                          sortBy === 'oldest' ? 'Oldest' :
                          sortBy === 'highest' ? 'Highest Sales' :
                          sortBy === 'lowest' ? 'Lowest Sales' : 'Sort'
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('newest')}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('highest')}>
                        Highest Sales
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('lowest')}>
                        Lowest Sales
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-800 font-medium">Total Revenue</p>
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(vendorDetails?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-green-800 font-medium">Average Monthly Revenue</p>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(
                      monthlySales.length > 0 
                        ? monthlySales.reduce((sum, sale) => sum + sale.totalSales, 0) / monthlySales.length 
                        : 0
                    )}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-purple-800 font-medium">Best Month</p>
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {monthlySales.length > 0 
                      ? `${monthlySales.reduce((max, sale) => 
                          sale.totalSales > max.totalSales ? sale : max
                        ).month} (${formatCurrency(monthlySales.reduce((max, sale) => 
                          sale.totalSales > max.totalSales ? sale : max
                        ).totalSales)})` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Detailed Revenue Table */}
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Percentage of Period Revenue</TableHead>
                      <TableHead className="text-right">Total Quantity</TableHead>
                      <TableHead className="text-right">Unique Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlySales.map((sale, index) => {
                      const percentageOfPeriodRevenue = periodTotalSales > 0 
                        ? (sale.totalSales / periodTotalSales) * 100 
                        : 0;
                      
                      return (
                        <TableRow key={`${sale.month}-${sale.year}`}>
                          <TableCell>{`${sale.month} ${sale.year}`}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(sale.totalSales)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span 
                              className={`font-medium ${
                                percentageOfPeriodRevenue > 10 
                                  ? 'text-green-600' 
                                  : percentageOfPeriodRevenue < 5 
                                    ? 'text-red-600' 
                                    : 'text-gray-600'
                              }`}
                            >
                              {percentageOfPeriodRevenue.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {sale.totalQuantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {sale.uniqueOrders}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}
