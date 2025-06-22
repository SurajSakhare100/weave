import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import {
  useGetOneVendorProductsQuery,
  useDeleteProductMutation
} from '../../../services/adminApi';
import { 
    Package, 
    Eye, 
    Edit, 
    Trash2, 
    DollarSign,
    Tag
} from 'lucide-react'

function VendorProduct({ vendorId, loaded, setLoaded }) {
  let router = useRouter()
  const logOut = () => {
    localStorage.removeItem("adminToken")
    setLoaded(true)
    router.push('/admin/login')
  }
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [products, setProducts] = useState([])
  // RTK Query hooks
  const { data, error, isLoading, refetch } = useGetOneVendorProductsQuery({ vendorId, search, skip: 0 }, { skip: !vendorId });
  const [deleteProduct] = useDeleteProductMutation();
  useEffect(() => {
    if (data) {
      setProducts(data.products)
      setTotal(data.total)
      setLoaded(true)
    }
    if (isLoading) setLoaded(false)
    if (error) setLoaded(true)
  }, [data, isLoading, error, setLoaded])

  const handleDeleteProduct = async (obj) => {
    if (window.confirm(`Do You Want Delete ${obj.name}`)) {
      try {
        const res = await deleteProduct({ id: obj._id, folderId: obj.uni_id_1 + obj.uni_id_2 });
        if (res.data && res.data.login) {
          logOut();
        } else {
          setLoaded(false);
          alert("Product Deleted");
          refetch();
        }
      } catch (err) {
        alert("Sorry Server Has Some Problem");
      }
    }
  }

  return (
    <>
      {
        loaded ? (
          <div className='VendorProduct AdminContainer pb-3'>
            <div className="BtnsSections text-center pt-3">
              <div className="row">
                <div className="col-12 col-md-4 pb-2">
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    setLoaded(false)
                    refetch()
                  }}>
                    <input type="text" value={search} onInput={(e) => {
                      setSearch(e.target.value)
                    }} placeholder='Search Name' name="" id="" />
                  </form>
                </div>

              </div>
            </div>

            <div className='MainTable text-center'>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Mrp</th>
                    <th>Discount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    products.map((obj, key) => {
                      return (
                        <tr key={key}>
                          <td>
                            <img
                              src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                              alt={obj.name}
                            />
                          </td>
                          <td className='oneLineTxtMax-300'>
                            {obj.name}
                          </td>
                          <td>
                            {obj.category}
                          </td>
                          <td>
                            ₹{obj.price}
                          </td>
                          <td>
                            ₹{obj.mrp}
                          </td>
                          <td>
                            {obj.discount} %
                          </td>
                          <td>
                            <button className="ActionBtn" onClick={() => {
                              window.open(`/p/${obj.slug}/${obj._id}`, '_blank')
                            }}>view</button>
                            <button className="ActionBtn" onClick={() => {
                              handleDeleteProduct(obj)
                            }}>delete</button>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>

            {
              total !== products.length && <div>
                <button data-for="loadMore" onClick={() => {
                  refetch()
                }}>Load More</button>
              </div>
            }

          </div>
        ) : <Loading />
      }
    </>
  )
}

export default VendorProduct