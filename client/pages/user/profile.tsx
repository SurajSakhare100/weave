import Layout from '@/components/Layout';
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Link from 'next/link'

export default function UserProfile() {
  const user = useSelector((state: RootState) => state.user)

  if (!user.isAuthenticated) {
    return <Layout><div className="max-w-md mx-auto py-12">Please log in to view your profile.</div></Layout>
  }

  return (
    <Layout>
      <section className="py-16 bg-[#faf5f2] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <span className="text-6xl mb-4">👤</span>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <div className="mb-2 text-gray-600">Role: <span className="font-semibold">{user.role}</span></div>
          <div className="mb-2">Wishlist: <Link href="/user/wishlist" className="text-pink-500 underline">{user.wishlist.length} items</Link></div>
          <Link href="/user/orders" className="mt-4 bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">View Orders</Link>
        </div>
      </section>
    </Layout>
  )
} 