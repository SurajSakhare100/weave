import { useState, useEffect } from 'react'
import Modal from './Modal'
import { adminAxios } from '../../../Config/Server'
import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { 
    Gift, 
    Plus, 
    Trash2, 
    Percent, 
    DollarSign,
    Tag
} from 'lucide-react'

function Cupons({ loaded, setLoaded }) {
  const [mainModal, setMainModal] = useState({
    btn: false,
    active: false,
  })

  const navigate = useRouter()

  const logOut = () => {
    localStorage.removeItem('adminToken');
    setLoaded(true);
    navigate.push('/admin/login');
  }

  const [cupons, setCupons] = useState([])

  const getCupons = async () => {
    setLoaded(false)
    try {
      const res = await adminAxios((server) =>
        server.get('/admin/getCupons')
      )
      
      if (res.data.login) {
        logOut()
      } else {
        setCupons(res.data)
        setLoaded(true)
      }
    } catch (err) {
      console.error('Error fetching coupons:', err)
      setLoaded(true)
    }
  }

  const handleDeleteCupon = async (cupon) => {
    if (window.confirm(`Do you want to delete coupon "${cupon.code}"?`)) {
      try {
        const res = await adminAxios((server) =>
          server.delete('/admin/deleteCupon', {
            data: { Id: cupon._id }
          })
        )
        
        if (res.data.login) {
          logOut()
        } else {
          alert("Coupon deleted successfully")
          getCupons()
        }
      } catch (err) {
        alert("Error deleting coupon")
      }
    }
  }

  useEffect(() => {
    getCupons()
  }, [])

  if (!loaded) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
              <p className="text-gray-600">Manage discount coupons and promotional offers</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{cupons.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-success-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Average Discount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {cupons.length > 0 
                      ? Math.round(cupons.reduce((sum, c) => sum + c.discount, 0) / cupons.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-warning-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Min Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{cupons.length > 0 
                      ? Math.min(...cupons.map(c => c.min))
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setMainModal({ ...mainModal, active: true, btn: true })}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Coupon</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2" />
                      Coupon Code
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-2" />
                      Minimum Order
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Percent size={16} className="mr-2" />
                      Discount
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cupons.length > 0 ? (
                  cupons.map((cupon, key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Gift size={16} className="text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {cupon.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{cupon.min}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          {cupon.discount}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCupon(cupon)}
                          className="bg-error-600 hover:bg-error-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Gift className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No coupons found</p>
                        <p className="text-gray-600">Create your first coupon to start offering discounts</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {mainModal.active && (
          <Modal
            MainModal={mainModal}
            getCupons={getCupons}
            setMainModal={setMainModal}
            logOut={logOut}
          />
        )}
      </div>
    </div>
  )
}

export default Cupons