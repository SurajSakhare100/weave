import Layout from '@/components/Layout';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { login } from '../features/user/userSlice';
import { loginSuccess } from '../features/vendor/vendorSlice';
import { setVendorToken, setVendorProfile } from '../utils/vendorAuth';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'vendor') {
        // Handle vendor login
        // For now, simulate vendor login
        const vendorData = {
          token: 'vendor-token-' + Date.now(),
          vendor: {
            _id: 'vendor-id',
            name: name,
            email: name + '@vendor.com',
            accept: true,
            createdAt: new Date().toISOString()
          }
        };
        
        setVendorToken(vendorData.token);
        setVendorProfile(vendorData.vendor);
        dispatch(loginSuccess(vendorData));
        router.push('/vendor/dashboard');
      } else {
        // Handle user login
        dispatch(login({ name, role: 'user' }));
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Login</h1>
          <div className="mb-4 w-full">
            <label className="block mb-1 ">Name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='name'
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6 w-full">
            <label className="block mb-1 ">Role</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition w-full font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </section>
    </Layout>
  );
} 