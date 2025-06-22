import React from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { ServerId } from '../../../Config/Server'
import { useEditCategoryMutation, useGetCatgoriesQuery } from '../../../services/adminApi'

function EditCategory({ editModal, setEditModal, setCategories, editCategory, logOut }) {
    const [thumbPrev, setThumbPrev] = useState(ServerId + '/category/' + editCategory.uni_id1 + editCategory.uni_id2 + '/' + editCategory.file.originalname)
    const [thumb, setThumb] = useState()
    const [name, setName] = useState(editCategory.name)

    var modalRef = useRef()

    const [editCategoryMutation, { isLoading: editLoading }] = useEditCategoryMutation();
    const { data: catgoriesData, refetch: refetchCatgories } = useGetCatgoriesQuery();

    useEffect(() => {
        if (editModal.btn === true) {
            setEditModal({ ...editModal, btn: false })
        } else {
            window.addEventListener('click', closePopUpBody);
            function closePopUpBody(event) {
                if (!modalRef.current?.contains(event.target)) {
                    setEditModal({ ...editModal, active: false })
                }
            }
            return () => window.removeEventListener('click', closePopUpBody)
        }
    })

    async function formhandler(e) {
        e.preventDefault()
        let formData = new FormData()
        formData.append('name', name)
        formData.append('uni_id1', editCategory.uni_id1)
        formData.append('uni_id2', editCategory.uni_id2)
        formData.append('cateId', editCategory._id)
        formData.append('oldFile', JSON.stringify(editCategory.file))
        formData.append('image', thumb)
        const result = await editCategoryMutation(formData);
        if (result.error && result.error.data && result.error.data.login) {
            logOut();
        } else if (result.data && result.data.login) {
            logOut();
        } else {
            await refetchCatgories();
            if (catgoriesData) setCategories(catgoriesData);
            alert("Edited");
            setEditModal({
                ...editModal,
                btn: false,
                active: false,
            });
        }
    }

    return (
        <div className='CategoryModal'>
            <div className='inner'>
                <div className="innerMain" ref={modalRef}>
                    <div className='ExitDiv'>
                        <button onClick={() => {
                            setEditModal({
                                ...editModal,
                                btn: false,
                                active: false
                            })
                        }}>CLOSE</button>
                    </div>
                    <div className="row">
                        <form onSubmit={formhandler}>
                            <div className="col-12">
                                <label htmlFor="">Name</label>
                                <br />
                                <input value={name} type="text" onInput={(e) => {
                                    setName(e.target.value)
                                }} required />
                            </div>
                            {
                                thumbPrev && (
                                    <div className='col-12'>
                                        <img className='thumnail' src={thumbPrev} alt="" />
                                    </div>
                                )
                            }
                            <div className="col-12">
                                <label htmlFor="">Image</label>
                                <br />
                                <input type="file" onChange={(e) => {
                                    setThumb(e.target.files[0])
                                    setThumbPrev(URL.createObjectURL(e.target.files[0]))
                                }} accept='image/*' />
                            </div>
                            <div className="col-12">
                                <button className='submitBnt'>Edit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditCategory