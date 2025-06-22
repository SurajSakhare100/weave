import Loading from '../../../components/Loading'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import { adminAxios, ServerId } from '../../../Config/Server'
import ExtraModals from './ExtraModals'
import SectionMadals from './SectionMadals'
import { 
    Layout, 
    Plus, 
    Image, 
    Trash2, 
    Eye, 
    Settings,
    Sliders,
    Monitor,
    FileText
} from 'lucide-react'

function LayoutsComp({ setLoaded, loaded }) {

  const navigate = useRouter()

  const logOut = () => {
    localStorage.removeItem('adminToken');
    setLoaded(true);
    navigate.push('/admin/login');
  }

  const [activeSecModal, setActiveSecModal] = useState({
    btn: false,
    active: false,
  })

  const [activeExtraModal, setActiveExtraModal] = useState({
    btn: false,
    active: false,
    for: ''
  })

  const [sectionOne, setSectionOne] = useState({
    title: '',
    subTitle: '',
    items: []
  })

  const [sectionTwo, setSectionTwo] = useState({
    title: '',
    subTitle: '',
    items: [],
    items2: []
  })

  const [sectionThree, setSectionThree] = useState({
    title: '',
    subTitle: '',
    items: [],
    items2: []
  })

  const [sectionFour, setSectionFour] = useState({
    title: '',
    subTitle: '',
    items: []
  })

  const [sliderOne, setSliderOne] = useState({
    items: []
  })

  const [sliderTwo, setSliderTwo] = useState({
    items: []
  })

  const [banner, setBanner] = useState({
    file: '',
    link: ''
  })

  const [currTable, setCurrTable] = useState('sectionone')

  const getAllLayouts = async () => {
    setLoaded(false)
    try {
      const layout = await adminAxios((server) =>
        server.get('/admin/getLayouts')
      )
      
      if (layout.data.login) {
        logOut()
      } else {
        setSectionOne(layout.data.sectionone)
        setSectionFour(layout.data.sectionfour)
        setSectionTwo(layout.data.sectiontwo)
        setSectionThree(layout.data.sectionthree)

        if (layout.data.sliderOne !== null) {
          setSliderOne(layout.data.sliderOne)
        }

        if (layout.data.sliderTwo !== null) {
          setSliderTwo(layout.data.sliderTwo)
        }

        if (layout.data.banner !== null) {
          setBanner(layout.data.banner)
        }
      }
      setLoaded(true)
    } catch (err) {
      console.error('Error fetching layouts:', err)
      setLoaded(true)
    }
  }

  const handleDeleteSlider = async (forType, item) => {
    const confirmMessage = forType === 'sliderTwo' ? 'Do you want to remove this item?' : `Do you want to remove ${item.title}`
    
    if (window.confirm(confirmMessage)) {
      try {
        const res = await adminAxios((server) =>
          server.put('/admin/removeSlider', {
            for: forType,
            item: item
          })
        )
        
        if (res.data.login) {
          logOut()
        } else {
          getAllLayouts()
        }
      } catch (err) {
        alert("We are facing an error")
      }
    }
  }

  useEffect(() => {
    getAllLayouts()
  }, [])

  if (!loaded) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Layout className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Layouts</h1>
              <p className="text-gray-600">Manage website sections, sliders, and banners</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setActiveExtraModal({ ...activeExtraModal, btn: true, active: true, for: 'slider' })}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Sliders size={20} />
              <span>Add Slider</span>
            </button>
            <button
              onClick={() => setActiveExtraModal({ ...activeExtraModal, btn: true, active: true, for: 'slidertwo' })}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Monitor size={20} />
              <span>Add Slider 2</span>
            </button>
            <button
              onClick={() => setActiveExtraModal({ ...activeExtraModal, btn: true, active: true, for: 'banner' })}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Image size={20} />
              <span>Add Banner</span>
            </button>
            <button
              onClick={() => setActiveSecModal({ ...activeSecModal, btn: true, active: true })}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <FileText size={20} />
              <span>Add Section Items</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sliderOne'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sliderOne'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Slider 1
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sliderTwo'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sliderTwo'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Slider 2
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('banner'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'banner'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Banner
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sectionone'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sectionone'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Section 1
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sectiontwo'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sectiontwo'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Section 2
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sectionthree'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sectionthree'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Section 3
            </button>
            <button
              onClick={() => { getAllLayouts(); setCurrTable('sectionfour'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currTable === 'sectionfour'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Section 4
            </button>
          </div>
        </div>

        {/* Content Tables */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {currTable === 'sliderOne' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Button</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sliderOne.items?.map((obj, key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={`${ServerId}/${sliderOne.for}/${obj.uni_id}/${obj.file.filename}`}
                          alt={obj.title}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{obj.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: obj.content }}></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => window.open(obj.btnLink, '_blank')}
                          className="btn-outline text-xs"
                        >
                          {obj.btn}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{obj.subContent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteSlider('sliderOne', obj)}
                          className="bg-error-600 hover:bg-error-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {currTable === 'sliderTwo' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sliderTwo.items?.map((obj, key) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          className="h-32 w-full rounded-lg object-cover cursor-pointer"
                          src={`${ServerId}/${sliderTwo.for}/${obj.uni_id}/${obj.file.filename}`}
                          onClick={() => window.open(obj.link, '_blank')}
                          alt="slider"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteSlider('sliderTwo', obj)}
                          className="bg-error-600 hover:bg-error-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {currTable === 'banner' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banner.file && banner.file.length !== 0 && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          className="h-32 w-full rounded-lg object-cover"
                          src={`${ServerId}/banner/${banner.file}`}
                          alt="banner"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.open(banner.link, '_blank')}
                          className="btn-outline text-xs mr-2"
                        >
                          <Eye size={14} className="mr-1" />
                          View Link
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Add similar tables for sections */}
            {['sectionone', 'sectiontwo', 'sectionthree', 'sectionfour'].includes(currTable) && (
              <div className="p-6 text-center text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">Section Management</p>
                <p className="text-gray-600">Use the "Add Section Items" button to manage this section</p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {activeSecModal.active && (
          <SectionMadals
            setActiveModal={setActiveSecModal}
            activeModal={activeSecModal}
            sectionOneDetails={sectionOne}
            setSectionOneDetails={setSectionOne}
            sectionFourDetails={sectionFour}
            setSectionFourDetails={setSectionFour}
            setSectionTwoDetails={setSectionTwo}
            sectionTwoDetails={sectionTwo}
            setSectionThreeDetails={setSectionThree}
            sectionThreeDetails={sectionThree}
            logOut={logOut}
          />
        )}

        {activeExtraModal.active && (
          <ExtraModals
            setActiveModal={setActiveExtraModal}
            activeModal={activeExtraModal}
            setSliderOne={setSliderOne}
            setSliderTwo={setSliderTwo}
            setBannerPage={setBanner}
            logOut={logOut}
          />
        )}
      </div>
    </div>
  )
}

export default LayoutsComp