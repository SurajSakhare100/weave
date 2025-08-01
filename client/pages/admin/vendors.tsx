import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Admin/Header/Header';
import PendingVendors from '../../components/Admin/Vendor/PendingVendors';
import AdminProtected from '../../components/Admin/AdminProtected';

function AdminVendorsPage() {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  return (
    <AdminProtected>
      <div className="min-h-screen admin-bg-secondary">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold admin-text-primary">Vendor Management</h1>
            <p className="mt-2 admin-text-secondary">Manage all vendors and their approval status</p>
          </div>
          
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="text-xl font-semibold admin-text-primary">Pending Vendors</h2>
              <p className="text-sm admin-text-secondary">Review and approve new vendor applications</p>
            </div>
            <PendingVendors loaded={loaded} setLoaded={setLoaded} />
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}

export default AdminVendorsPage; 