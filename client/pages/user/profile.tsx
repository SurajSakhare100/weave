import MainLayout from '@/components/layout/MainLayout';
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Link from 'next/link'
import { useRequireUserAuth } from '../../hooks/useRequireUserAuth';

export default function UserProfile() {
  useRequireUserAuth();
  const user = useSelector((state: RootState) => state.user)

  return (
    <MainLayout>
      <section className="py-16 bg-[#faf5f2] min-h-screen text-black flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center w-full max-w-md">
          <span className="text-2xl mb-4">👤</span>
          <h1 className="text-2xl font-bold mb-2">{user.email}</h1>
          <div className="mb-2">Wishlist: <Link href="/user/wishlist" className="text-pink-500 underline">{user.wishlist.length} items</Link></div>
          <div className="flex flex-col gap-3 mt-4 w-full">
            <Link href="/user/orders" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition text-center">
              View Orders
            </Link>
            <Link href="/user/addresses" className="bg-[#6c4323] text-white px-6 py-2 rounded hover:bg-[#6c4323]/90 transition text-center">
              Manage Addresses
            </Link>
            <Link href="/" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition text-center">
              Back to Home
            </Link>
            <Link href="/products" className="bg-[#cf1a53] text-white px-6 py-2 rounded hover:bg-[#cf1a53]/90 transition text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  )
} 