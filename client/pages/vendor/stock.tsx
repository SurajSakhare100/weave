import React from 'react';
import { GetServerSideProps } from 'next';
import VendorLayout from '@/components/Vendor/VendorLayout';
import StockDashboard from '@/components/Vendor/StockManagement/StockDashboard';
import { useRequireVendorAuth } from '@/hooks/useRequireVendorAuth';

const VendorStockPage = () => {
  
  return (
    <VendorLayout>
      <StockDashboard />
    </VendorLayout>
  );
};



export default VendorStockPage;
