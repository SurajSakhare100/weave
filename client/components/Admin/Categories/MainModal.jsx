import React, { useState } from 'react'
import { useCreateCategoryMutation } from '../../../services/adminApi'
import { Upload, Image as ImageIcon, Plus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import BaseModal from '../../ui/BaseModal'

function MainModal({ modal, setModal, page, setPage, onCategoryCreated }) {
    const [thumbPrev, setThumbPrev] = useState()
    const [thumb, setThumb] = useState()
    const [dragActive, setDragActive] = useState(false)

    const [category, setCategory] = useState({
        uni_id1: Date.now() + Math.random(),
        name: ''
    })

    // Reset form when modal closes
    React.useEffect(() => {
        if (!modal || !modal.active) {
            setCategory({
                uni_id1: Date.now() + Math.random(),
                name: ''
            })
            setThumb(null)
            setThumbPrev(null)
            setDragActive(false)
        }
    }, [modal?.active])

    const [createCategory, { isLoading, error }] = useCreateCategoryMutation()

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

        if (!category.name.trim()) {
            toast.error('Please enter a category name')
            return
        }

        // Image is optional, so we don't need to validate it

        let formData = new FormData()
        formData.append('uni_id1', category.uni_id1)
        formData.append('uni_id2', Date.now() + Math.random())
        formData.append('name', category.name.trim())
        if (thumb) {
            formData.append('image', thumb)
        }
        formData.append('description', '') // Add empty description if needed

        try {
            const result = await createCategory(formData).unwrap()
            if (result.success) {
                toast.success('Category added successfully')
                setModal({ ...modal, active: false })
                // Call the callback to refresh the categories list
                if (onCategoryCreated) {
                    onCategoryCreated()
                }
            } else {
                toast.error('Failed to add category')
            }
        } catch (err) {
            console.error('Error adding category:', err)
            toast.error('Error adding category')
        }
    }

    const handleClose = () => {
        setModal({ ...modal, active: false })
    }

    return (
        <BaseModal
            isOpen={modal?.active || false}
            onClose={handleClose}
            title="Add New Category"
            size="md"
        >
            <form onSubmit={formhandler} className="space-y-6">
                {/* Category Name */}
                <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                    </label>
                    <input
                        id="categoryName"
                        type="text"
                        value={category.name}
                        onChange={(e) => {
                            setCategory({
                                ...category,
                                name: e.target.value
                            })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter category name"
                        required
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image (Optional)
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
                                    {thumb ? 'Image selected' : 'Upload image'}
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

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                            {error.error || 'Failed to add category'}
                        </p>
                    </div>
                )}

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
                        disabled={isLoading || !category.name.trim()}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    )
}

export default MainModal