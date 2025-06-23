import Layout from '@/components/Layout';
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Link from 'next/link'
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';

export default function UserProfile() {
  useRequireUserAuth();
  const user = useSelector((state: RootState) => state.user)
  console.log('User Profile:', user);

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen text-black flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <span className="text-2xl mb-4">👤</span>
          <h1 className="text-2xl font-bold mb-2">{user.email}</h1>
          <div className="mb-2">Wishlist: <Link href="/user/wishlist" className="text-pink-500 underline">{user.wishlist.length} items</Link></div>
          <Link href="/user/orders" className="mt-4 bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">View Orders</Link>
        </div>
      </section>
    </Layout>
  )
} 