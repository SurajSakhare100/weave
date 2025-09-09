import React from 'react';
import VendorLayout from '@/components/Vendor/VendorLayout';
import SalesDashboard from '@/components/Vendor/SalesManagement/SalesDashboard';

const VendorSalesPage = () => {
  
  return (
    <VendorLayout>
      <SalesDashboard />
    </VendorLayout>
  );
};

export default VendorSalesPage;
