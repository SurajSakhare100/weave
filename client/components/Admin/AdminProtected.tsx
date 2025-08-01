import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useRouter } from 'next/router';

interface AdminProtectedProps {
  children: React.ReactNode;
}

const AdminProtected: React.FC<AdminProtectedProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="admin-spinner mx-auto mb-4"></div>
          <p className="admin-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default AdminProtected; 