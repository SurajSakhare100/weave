import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import { useGetSpecificVendorQuery } from '../../../services/adminApi';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Building,
    CheckCircle,
    XCircle
} from 'lucide-react'

function VendorDetailsComp({ vendorId, loaded, setLoaded }) {
  let router = useRouter()
  const [data, setData] = useState({})
  // RTK Query hook
  const { data: vendorData, error, isLoading } = useGetSpecificVendorQuery({ vendorId }, { skip: !vendorId });

  const logOut = () => {
    localStorage.removeItem("adminToken")
    router.push('/admin/login')
  }

  useEffect(() => {
    if (vendorData) {
      setData(vendorData)
      setLoaded(true)
    }
    if (isLoading) setLoaded(false)
    if (error) setLoaded(true)
  }, [vendorData, isLoading, error, setLoaded])

  if (!loaded) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-8 w-8 text-[#5A9BD8]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Details</h1>
              <p className="text-gray-600">Complete vendor information and documentation</p>
            </div>
          </div>
        </div>

        {/* Vendor Details Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-[#5A9BD8] mr-2" />
                Personal Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                value={data.adharName || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adhar Number</label>
              <input 
                value={data.adharNumber || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                value={data.email || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input 
                value={data.number || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pan Card Number</label>
              <input 
                value={data.panNumber || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
              <input 
                value={data.gstin || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            {/* Address Section */}
            <div className="md:col-span-2">
              <hr className="my-6 border-gray-200" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-[#5A9BD8] mr-2" />
                Address Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
              <input 
                value={data.locality || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code</label>
              <input 
                value={data.pinCode || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
              <textarea 
                value={data.address || ''} 
                cols="30" 
                rows="4" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8] resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City/District/Town</label>
              <input 
                value={data.city || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input 
                value={data.state || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            {/* Bank Information Section */}
            <div className="md:col-span-2">
              <hr className="my-6 border-gray-200" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 text-[#5A9BD8] mr-2" />
                Bank Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Owner Name</label>
              <input 
                value={data.bankAccOwner || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input 
                value={data.bankName || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input 
                value={data.bankAccNumber || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input 
                value={data.bankIFSC || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
              <input 
                value={data.bankBranchName || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch Number</label>
              <input 
                value={data.bankBranchNumber || ''} 
                type="text" 
                readOnly 
                disabled 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A9BD8] focus:border-[#5A9BD8]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDetailsComp