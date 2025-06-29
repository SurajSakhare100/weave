import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import Layout from "@/components/Layout"
import { getUserProfile, updateUserProfile } from "@/services/userService"

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await getUserProfile()
      if (data.success && data.data) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProfile}>Try Again</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <nav className="text-[#6c4323] mb-8">
            <span>Home</span>
            <span className="mx-2">{">"}</span>
            <span>Settings</span>
          </nav>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
            
            {profile && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Addresses</h2>
                  {profile.addresses && profile.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {profile.addresses.map((address: any, index: number) => (
                        <div key={address._id} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Address {index + 1}</h3>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                          <p className="text-gray-600">Phone: {address.phone}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No addresses found.</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button 
                    onClick={() => router.push('/user/profile')}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={() => router.push('/user/orders')}
                    variant="outline"
                  >
                    View Orders
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
