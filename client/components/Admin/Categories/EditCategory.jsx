import React, { useRef } from 'react'
import { useState } from 'react'
import { X, Upload, Image as ImageIcon, Save, Loader2, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

import { useUpdateCategoryMutation, useGetAllTypesCategoryQuery } from '../../../services/adminApi'
import BaseModal from '../../ui/BaseModal'

function EditCategory({ modal, setModal, editCategory, logOut }) {
    // Safety check for editCategory and modal
    if (!editCategory || !editCategory._id || !modal) {
        return null;
    }
    
    // Only render if modal is active
    if (!modal.active) {
        return null;
    }
    
    const [thumbPrev, setThumbPrev] = useState(editCategory.image || null)
    const [thumb, setThumb] = useState()
    const [name, setName] = useState(editCategory.name || '')
    const [description, setDescription] = useState(editCategory.description || '')
    const [header, setHeader] = useState(editCategory.header || false)
    const [dragActive, setDragActive] = useState(false)

    var modalRef = useRef()

    const [updateCategory, { isLoading: editLoading }] = useUpdateCategoryMutation();
    const { data: categoriesData, refetch: refetchCategories } = useGetAllTypesCategoryQuery();

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
                setThumb(file)
                setThumbPrev(URL.createObjectURL(file))
            }
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setThumb(file)
            setThumbPrev(URL.createObjectURL(file))
        }
    }

    async function formhandler(e) {
        e.preventDefault()
        
        if (!name.trim()) {
            toast.error('Please enter a category name')
            return
        }
        
        let formData = new FormData()
        formData.append('name', name.trim())
        formData.append('description', description || '')
        formData.append('header', header)
        formData.append('uni_id1', editCategory.uni_id1 || Date.now() + Math.random())
        formData.append('uni_id2', editCategory.uni_id2 || Date.now() + Math.random())
        
        // Only append image if a new one is selected
        if (thumb) {
            formData.append('image', thumb)
        }
        
        try {
            const result = await updateCategory({ id: editCategory._id, formData }).unwrap();
            if (result.success) {
                toast.success("Category updated successfully");
                await refetchCategories();
                if (setModal) {
                    setModal({
                        ...modal,
                        btn: false,
                        active: false,
                    });
                }
            } else {
                toast.error("Failed to update category");
            }
        } catch (err) {
            console.error('Error updating category:', err);
            if (err.data && err.data.login) {
                logOut();
            } else {
                toast.error("Error updating category");
            }
        }
    }

    const handleClose = () => {
        if (setModal) {
            setModal({ ...modal, active: false })
        }
    }

    return (
        <BaseModal
            isOpen={modal?.active || false}
            onClose={handleClose}
            title="Edit Category"
            size="md"
        >
            <form onSubmit={formhandler} className="space-y-6">
                {/* Category Name */}
                <div>
                    <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                    </label>
                    <input
                        id="editCategoryName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter category name"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="editCategoryDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="editCategoryDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Enter category description (optional)"
                    />
                </div>

                {/* Header Toggle */}
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={header}
                            onChange={(e) => setHeader(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                            Show in header navigation
                        </span>
                    </label>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image
                    </label>
                    
                    {/* Image Preview */}
                    {thumbPrev && (
                        <div className="mb-4">
                            <div className="relative inline-block">
                                <img 
                                    src={thumbPrev} 
                                    alt="Preview" 
                                    className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setThumb(null)
                                        setThumbPrev(null)
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                {thumb ? (
                                    <ImageIcon className="h-8 w-8 text-green-500" />
                                ) : (
                                    <Upload className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {thumb ? 'Image selected' : 'Upload new image'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {thumb 
                                        ? 'Click to change or drag a new image' 
                                        : 'Drag and drop or click to browse (optional)'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={editLoading || !name.trim()}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {editLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Category
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    )
}

export default EditCategory