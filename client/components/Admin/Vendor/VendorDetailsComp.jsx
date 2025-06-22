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
    <div className='AdminContainer'>
      <div className="VendorDetailsComp">
        <div className="row">
          <div className="col-md-6">
            <label>Name</label>
            <input value={data.adharName} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Adhar Number</label>
            <input value={data.adharNumber} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Email</label>
            <input value={data.email} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Number</label>
            <input value={data.number} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Pan Card Number</label>
            <input value={data.panNumber} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>GSTIN</label>
            <input value={data.gstin} type="text" readOnly disabled />
          </div>

          <div className="col-12">
            <hr />
          </div>

          <div className="col-md-6">
            <label>Locality</label>
            <input value={data.locality} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Pin Code</label>
            <input value={data.pinCode} type="text" readOnly disabled />
          </div>

          <div className="col-md-12">
            <label>Address</label>
            <textarea value={data.address} cols="30" rows="10" readOnly disabled></textarea>
          </div>

          <div className="col-md-6">
            <label>City/District/Town</label>
            <input value={data.city} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>State</label>
            <input value={data.state} type="text" readOnly disabled />
          </div>

          <div className="col-12">
            <hr />
          </div>

          <div className="col-md-6">
            <label>Account Owner Name</label>
            <input value={data.bankAccOwner} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Bank Name</label>
            <input value={data.bankName} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Account Number</label>
            <input value={data.bankAccNumber} type='text' readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>IFSC</label>
            <input value={data.bankIFSC} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Branch Name</label>
            <input value={data.bankBranchName} type="text" readOnly disabled />
          </div>

          <div className="col-md-6">
            <label>Branch Number</label>
            <input value={data.bankBranchNumber} type="text" readOnly disabled />
          </div>

        </div>
      </div>
    </div>
  )
}

export default VendorDetailsComp