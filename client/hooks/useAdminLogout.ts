import { useRouter } from 'next/router';
import { adminLogout } from '../utils/adminUtils';

export const useAdminLogout = () => {
  const router = useRouter();
  
  const logout = async () => {
    await adminLogout(router);
  };
  
  return { logout };
}; 