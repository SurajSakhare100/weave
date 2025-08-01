import React, { useState, useRef, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
    Plus, 
    Upload, 
    X, 
    Package,
    Tag,
    DollarSign,
    Percent,
    FileText,
    Image
} from 'lucide-react'
import { useGetOneProductQuery, useGetCategoriesQuery, useEditProductMutation } from '../../../services/adminApi';

// Dynamic import for JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading editor...</div>
});

// Dynamic import for ObjectId to avoid SSR issues
const ObjectId = dynamic(() => import('bson-objectid'), {
    ssr: false
});

function EditProduct() {
    const navigate = useRouter()

    const logOut = async () => {
        try {
            // Call logout endpoint to clear cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate.push('/admin/login')
    }

    // RTK Query hooks
    const { data: productData, isLoading: productLoading, error: productError } = useGetOneProductQuery(navigate.query.proId, { skip: !navigate.query.proId });
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
    const [editProduct, { isLoading: editLoading }] = useEditProductMutation();

    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [serverImg, setServerImg] = useState([])
    const [delImages, setDelImg] = useState([])
    const [uplodImages, setUploadImg] = useState([])
    const editor = useRef(null);
    const [productDetails, setProductDetails] = useState({
        name: '', price: '', mrp: '', available: 'true', cancellation: 'true',
        category: '', categorySlug: '', srtDescription: '', description: '',
        seoDescription: '', seoTitle: '', seoKeyword: '', return: 'true', variant: []
    })

    // Set product details and images when productData changes
    useEffect(() => {
        if (productData && productData.files) {
            setProductDetails(productData)
            var files = productData.files
            var ImagesServer = files.map((ele, key) => {
                var location = (process.env.ServerId || '') + '/product/' + productData.uni_id_1 + productData.uni_id_2 + '/' + files[key].filename
                return location
            })
            setImages(ImagesServer)
            setServerImg(files)
        }
    }, [productData])

    // Set categories when categoriesData changes
    useEffect(() => {
        if (categoriesData && Array.isArray(categoriesData)) {
            setCategories(categoriesData)
        }
    }, [categoriesData])

    async function FormSubmit(e) {
        e.preventDefault();
        let formData = new FormData();
        formData.append("uni_id_1", productDetails.uni_id_1)
        formData.append("uni_id_2", productDetails.uni_id_2)
        formData.append("_id", productDetails._id)
        formData.append("name", productDetails.name)
        formData.append("price", productDetails.price)
        formData.append("mrp", productDetails.mrp)
        formData.append("variant", JSON.stringify(productDetails.variant))
        formData.append("available", productDetails.available)
        formData.append("cancellation", productDetails.cancellation)
        formData.append("category", productDetails.category)
        formData.append("categorySlug", productDetails.categorySlug)
        formData.append("srtDescription", productDetails.srtDescription)
        formData.append("description", productDetails.description)
        formData.append("seoDescription", productDetails.seoDescription)
        formData.append("seoKeyword", productDetails.seoKeyword)
        formData.append("seoTitle", productDetails.seoTitle)
        formData.append("return", productDetails.return)
        formData.append('deleteImg', JSON.stringify(delImages));
        formData.append('serverImg', JSON.stringify(serverImg));
        if (uplodImages.length !== 0) {
            for (var i = 0; i < images.length; i++) {
                formData.append('images', uplodImages[i]);
            }
        }
        const result = await editProduct({ proId: productDetails._id, formData });
        if (result.error && result.error.data && result.error.data.login) {
            logOut();
        } else if (result.data && result.data.login) {
            logOut();
        } else {
            navigate.push('/admin/products')
        }
    }

    if (productLoading || categoriesLoading) return <div>Loading...</div>;
    if (productError) return <div>Error loading product</div>;
    if (categoriesError) return <div>Error loading categories</div>;

    return (
        <div className='AdminContainer AddProduct'>
            <div className="innerDiv">
                <div className='ExitDiv'>
                    <button onClick={() => {
                        navigate.push('/admin/products')
                    }}>CLOSE</button>
                </div>
                <form onSubmit={FormSubmit}>

                    <div className="row">
                        <div className='col-12'>
                            <label >Product Name</label><br />
                            <input value={productDetails.name} type="text" required onInput={(e) => {
                                setProductDetails({ ...productDetails, name: e.target.value })
                            }} />
                        </div>

                        <div className='col-6'>
                            <label >Price</label><br />
                            <input value={productDetails.price} type="number" onInput={(e) => {
                                setProductDetails({ ...productDetails, price: e.target.value })
                            }} disabled={productDetails.variant && productDetails.variant.length > 0 ? true : false}
                                required={!productDetails.variant || productDetails.variant.length === 0 ? true : false} />
                        </div>

                        <div className='col-6'>
                            <label >MRP</label><br />
                            <input value={productDetails.mrp} type="number" onInput={(e) => {
                                setProductDetails({ ...productDetails, mrp: e.target.value })
                            }} disabled={productDetails.variant && productDetails.variant.length > 0 ? true : false}
                                required={!productDetails.variant || productDetails.variant.length === 0 ? true : false} />
                        </div>

                        <div className='col-12'>
                            <label>Cancellation</label><br />
                            <select value={productDetails.cancellation} onInput={(e) => {
                                setProductDetails({ ...productDetails, cancellation: e.target.value })
                            }} >
                                <option value="true">Available</option>
                                <option value="false">Not Available</option>
                            </select>
                        </div>

                        <div className='col-md-6'>
                            <label>Available</label><br />
                            <select value={productDetails.available} onInput={(e) => {
                                setProductDetails({ ...productDetails, available: e.target.value })
                            }} >
                                <option value="true">Available</option>
                                <option value="false">Not Available</option>
                            </select>
                        </div>

                        <div className='col-md-6'>
                            <label>Return</label><br />
                            <select value={productDetails.return} onInput={(e) => {
                                setProductDetails({ ...productDetails, return: e.target.value })
                            }} >
                                <option value="true">Available</option>
                                <option value="false">Not Available</option>
                            </select>
                        </div>

                        <div className="col-md-12">
                            <label>Variants</label><br />
                            {
                                productDetails['variant'] && productDetails['variant'].length > 0 && (
                                    <>
                                        {
                                            productDetails['variant'].map((obj, key) => {
                                                return (
                                                    <div key={key} className='variantBox' >
                                                        <div className='row' >
                                                            <div className="col-md-3">
                                                                <label>Size</label>
                                                                <select value={obj.size} onChange={(e) => {
                                                                    var newArr = [...productDetails['variant']]
                                                                    newArr[key].size = e.target.value
                                                                    setProductDetails({
                                                                        ...productDetails,
                                                                        variant: newArr
                                                                    })
                                                                }} required >
                                                                    <option>S</option>
                                                                    <option>M</option>
                                                                    <option>L</option>
                                                                    <option>XL</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <label>Price</label>
                                                                <input type="number" value={obj.price} onChange={(e) => {
                                                                    var newArr = [...productDetails['variant']]
                                                                    newArr[key].price = e.target.value
                                                                    setProductDetails({
                                                                        ...productDetails,
                                                                        variant: newArr
                                                                    })
                                                                }} required />
                                                            </div>
                                                            <div className="col-md-3">
                                                                <label>MRP</label>
                                                                <input type="number" value={obj.mrp} onChange={(e) => {
                                                                    var newArr = [...productDetails['variant']]
                                                                    newArr[key].mrp = e.target.value
                                                                    setProductDetails({
                                                                        ...productDetails,
                                                                        variant: newArr
                                                                    })
                                                                }} required />
                                                            </div>
                                                            <div className="col-md-3">
                                                                <div className="row">
                                                                    <div className="col-9 col-md-6">
                                                                        <label>Details</label>
                                                                        <input type="text" value={obj.details} onChange={(e) => {
                                                                            var newArr = [...productDetails['variant']]
                                                                            newArr[key].details = e.target.value
                                                                            setProductDetails({
                                                                                ...productDetails,
                                                                                variant: newArr
                                                                            })
                                                                        }} required />
                                                                    </div>
                                                                    <div className="col-3 col-md-6">
                                                                        <label>Action</label><br />
                                                                        <button type='button' onClick={() => {
                                                                            setProductDetails({
                                                                                ...productDetails,
                                                                                variant: productDetails['variant'].filter((old) => {
                                                                                    return old.id !== obj.id
                                                                                })
                                                                            })
                                                                        }} >X</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </>
                                )
                            }
                            <button data-for="variantAdd" type='button' onClick={() => {
                                if (productDetails['variant']) {
                                    setProductDetails({
                                        ...productDetails,
                                        variant: [...productDetails.variant, {
                                            size: 'S',
                                            price: productDetails.price,
                                            mrp: productDetails.mrp,
                                            details: '',
                                            id: new ObjectId().toHexString()
                                        }]
                                    })
                                } else {
                                    setProductDetails({
                                        ...productDetails,
                                        variant: [{
                                            size: 'S',
                                            price: productDetails.price,
                                            mrp: productDetails.mrp,
                                            details: '',
                                            id: new ObjectId().toHexString()
                                        }]
                                    })
                                }
                            }} >Add Variant</button>
                        </div>

                        <div className='col-md-12'>
                            <label>Category</label><br />
                            <select onInput={(e) => {
                                var category = JSON.parse(e.target.value)

                                setProductDetails({
                                    ...productDetails,
                                    category: category.name,
                                    categorySlug: category.slug
                                })

                            }} required >

                                <option value={JSON.stringify({ name: productDetails.category, slug: productDetails.categorySlug })}>{productDetails.category}</option>

                                {
                                    categories.map((obj, key) => {
                                        var mainSub = obj.mainSub
                                        var sub = obj.sub
                                        return (
                                            <Fragment key={key}>
                                                <option value={JSON.stringify(obj)}>{obj.name}</option>
                                                {
                                                    mainSub.map((obj2, key2) => {
                                                        return (
                                                            <option key={key2} value={JSON.stringify({
                                                                name: `${obj.name} > ${obj2.name}`,
                                                                slug: obj2.slug
                                                            })
                                                            }> {obj.name}{' > '}{obj2.name}</option>
                                                        )
                                                    })
                                                }

                                                {
                                                    sub.map((obj3, key3) => {
                                                        return (
                                                            <option key={key3} value={JSON.stringify({
                                                                name: `${obj.name} > ${obj3.mainSub} > ${obj3.name}`,
                                                                slug: obj3.slug
                                                            })}>{obj.name}{' > '}{obj3.mainSub}{' > '}{obj3.name}</option>
                                                        )
                                                    })
                                                }
                                            </Fragment>
                                        )
                                    })
                                }

                            </select>
                        </div>

                        <div className='col-12'>
                            <label>Images</label><br />
                        </div>

                        {
                            images.map((obj, key) => {

                                return (
                                    <div className='col-12 col-md-6' key={key}>
                                        <div className="imagesProductDiv">
                                            <img src={obj} alt="" />
                                        </div>
                                        <input accept='image/*' onChange={(e) => {

                                            var serverimg = [...serverImg]
                                            var oldArray = [...images]
                                            oldArray[key] = URL.createObjectURL(e.target.files[0])
                                            setImages(oldArray)

                                            var Uplimgs = [...uplodImages]
                                            Uplimgs.push(e.target.files[0])
                                            setUploadImg(Uplimgs)

                                            var DeleteImgs = [...delImages]
                                            DeleteImgs.push(serverimg[key].filename)
                                            setDelImg(DeleteImgs)

                                            serverimg[key].filename = productDetails.uni_id_1 + e.target.files[0].name
                                            setServerImg(serverimg)
                                        }} type="file" name="" id="" />
                                    </div>
                                )
                            })
                        }

                        <div className='col-12'>
                            <label>SEO Title</label><br />
                            <input value={productDetails.seoTitle} type="text" onInput={(e) => {
                                setProductDetails({
                                    ...productDetails,
                                    seoTitle: e.target.value
                                })
                            }} required />
                        </div>

                        <div className='col-12'>
                            <label>SEO Keyword</label><br />
                            <input value={productDetails.seoKeyword} type="text" onInput={(e) => {
                                setProductDetails({
                                    ...productDetails,
                                    seoKeyword: e.target.value
                                })
                            }} required />
                        </div>

                        <div className='col-12'>
                            <label>SEO Description</label><br />
                            <textarea value={productDetails.seoDescription} onInput={(e) => {
                                setProductDetails({
                                    ...productDetails,
                                    seoDescription: e.target.value
                                })
                            }} cols="30" rows="10" required></textarea>
                        </div>

                        <div className='col-12'>
                            <label>Short Description</label><br />
                            <JoditEditor
                                ref={editor}
                                value={productDetails.srtDescription}
                                tabIndex={1}
                                onBlur={newContent => setProductDetails({
                                    ...productDetails,
                                    srtDescription: newContent
                                })}
                                onChange={newContent => { }}
                            />
                            <br />
                        </div>

                        <div className='col-12'>
                            <label>Description</label><br />
                            <JoditEditor
                                ref={editor}
                                value={productDetails.description}
                                tabIndex={1}
                                onBlur={newContent => setProductDetails({
                                    ...productDetails,
                                    description: newContent
                                })}
                                onChange={newContent => { }}
                            />
                        </div>

                        <div className='col-12'>
                            <button className='submitBnt'>Edit Product</button>
                        </div>

                    </div>

                </form>
            </div>
        </div>
    )
}

export default EditProduct