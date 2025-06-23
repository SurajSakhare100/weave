import Layout from '@/components/Layout';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { login as loginAction } from '../features/user/userSlice';
import { login as loginService } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginService({ email, password });
      dispatch(loginAction({ email: data.email, password:data.password}));
      const redirectUrl = router.query.redirect as string || '/';
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] text-black min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Login</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          <div className="mb-4 w-full">
            <label className="block mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='email'
              type="email"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6 w-full">
            <label className="block mb-1">Password</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='password'
              type="password"
              required
              disabled={loading}
            />
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