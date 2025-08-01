import React, { Fragment, useEffect, useState } from 'react';
import EditCategory from './EditCategory';
import MainModal from './MainModal';
import ExtraModal from './ExtraModal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Image, 
    Tag, 
    Layers,
    FolderOpen,
    FolderTree
} from 'lucide-react';
import {
  useGetAllTypesCategoryQuery,
  useDeleteCategoryMutation,
  useDeleteMainSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetOneCategoryQuery
} from '../../../services/adminApi';

function CategoriesComp({ loaded = false, setLoaded }) {
    const navigate = useRouter();
    const logOut = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        navigate.push('/admin/login');
    };

    const [mainModal, setMainModal] = useState({
        btn: false,
        active: false,
    });

    const [extraModal, setExtraModal] = useState({
        btn: false,
        active: false,
        for: ''
    });

    const [editModal, setEditModal] = useState({
        btn: false,
        active: false,
    });

    const [page, setPage] = useState({
        category: true,
        mainSub: false,
        sub: false
    });

    const [editCategory, setEditCategory] = useState({});
    const [editCategoryId, setEditCategoryId] = useState(null);
    const { data: oneCategoryData, error: oneCategoryError } = useGetOneCategoryQuery(editCategoryId, { skip: !editCategoryId });

    // RTK Query hooks
    const { data, error, isLoading, refetch } = useGetAllTypesCategoryQuery();
    const [deleteCategory] = useDeleteCategoryMutation();
    const [deleteMainSubCategory] = useDeleteMainSubCategoryMutation();
    const [deleteSubCategory] = useDeleteSubCategoryMutation();

    // Local state for categories, mainSub, subCategory
    const [categories, setCategories] = useState([]);
    const [mainSub, setMainSub] = useState([]);
    const [subCategory, setSub] = useState([]);

    // Update local state when data changes
    useEffect(() => {
        if (data) {
            setCategories(data.categories || []);
            setMainSub(data.mainSub || []);
            setSub(data.subCategory || []);
        }
        if (setLoaded && typeof setLoaded === 'function') {
            setLoaded(true);
        }
    }, [data, setLoaded]);

    const handleDeleteCategory = async (category) => {
        if (window.confirm(`Do you want to delete "${category.name}"?`)) {
            try {
                const res = await deleteCategory({ id: category._id, folderId: category.uni_id1 + category.uni_id2 });
                if (res.data && res.data.login) {
                    logOut();
                } else {
                    toast.success('Category deleted successfully');
                    refetch();
                }
            } catch (err) {
                toast.error("Sorry, we're facing some error");
            }
        }
    };

    const handleDeleteMainSub = async (mainSubItem) => {
        if (window.confirm(`Do you want to delete "${mainSubItem.name}"?`)) {
            try {
                const res = await deleteMainSubCategory({ id: mainSubItem._id, ...mainSubItem });
                if (res.data && res.data.login) {
                    logOut();
                } else {
                    toast.success('Main sub-category deleted successfully');
                    refetch();
                }
            } catch (err) {
                toast.error("Sorry, we're facing some error");
            }
        }
    };

    const handleDeleteSub = async (subItem) => {
        if (window.confirm(`Do you want to delete "${subItem.name}"?`)) {
            try {
                const res = await deleteSubCategory({ id: subItem._id, ...subItem });
                if (res.data && res.data.login) {
                    logOut();
                } else {
                    toast.success('Sub-category deleted successfully');
                    refetch();
                }
            } catch (err) {
                toast.error("Sorry, we're facing some error");
            }
        }
    };

    const handleEditCategory = async (category) => {
        setEditCategoryId(category._id);
    };

    useEffect(() => {
        if (oneCategoryData) {
            if (oneCategoryData.login) {
                logOut();
            } else {
                setEditCategory(oneCategoryData);
                setEditModal({
                    ...editModal,
                    btn: true,
                    active: true
                });
            }
        }
        if (oneCategoryError) {
            toast.error('Facing an error');
        }
    }, [oneCategoryData, oneCategoryError]);

    if (!loaded) return <LoadingSpinner text="Loading categories..." />;

    return (
        <Fragment>
            {mainModal.active && (
                <MainModal
                    modal={mainModal}
                    setModal={setMainModal}
                    page={page}
                    setPage={setPage}
                    onCategoryCreated={refetch}
                />
            )}

            {extraModal.active && (
                <ExtraModal
                    modal={extraModal}
                    setModal={setExtraModal}
                    page={page}
                    setPage={setPage}
                />
            )}

            {editModal.active && (
                <EditCategory
                    modal={editModal}
                    setModal={setEditModal}
                    editCategory={editCategory}
                    setEditCategory={setEditCategory}
                />
            )}

            <div className="space-y-6">

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setPage({ category: true, mainSub: false, sub: false })}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                page.category
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Categories
                        </button>
                        <button
                            onClick={() => setPage({ category: false, mainSub: true, sub: false })}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                page.mainSub
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Main Sub-Categories
                        </button>
                        <button
                            onClick={() => setPage({ category: false, mainSub: false, sub: true })}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                page.sub
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Sub-Categories
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white shadow rounded-lg">
                    {/* Categories Tab */}
                    {page.category && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                                <button
                                    onClick={() => setMainModal({ ...mainModal, btn: true, active: true })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Category
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Slug
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Header
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categories.map((category) => (
                                                <tr key={category._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{category.description || 'No description'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{category.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            category.header
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {category.header ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Sub-Categories Tab */}
                    {page.mainSub && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Main Sub-Categories</h2>
                                <button
                                    onClick={() => setExtraModal({ ...extraModal, btn: true, active: true, for: 'mainSub' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Main Sub-Category
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading main sub-categories...</p>
                                </div>
                            ) : mainSub.length === 0 ? (
                                <div className="text-center py-8">
                                    <Layers className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No main sub-categories</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new main sub-category.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Slug
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mainSub.map((item) => (
                                                <tr key={item.uni_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteMainSub(item)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub-Categories Tab */}
                    {page.sub && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Sub-Categories</h2>
                                <button
                                    onClick={() => setExtraModal({ ...extraModal, btn: true, active: true, for: 'sub' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Sub-Category
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading sub-categories...</p>
                                </div>
                            ) : subCategory.length === 0 ? (
                                <div className="text-center py-8">
                                    <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sub-categories</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new sub-category.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Main Sub-Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Slug
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subCategory.map((item) => (
                                                <tr key={item.uni_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.mainSub}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.category}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{item.slug}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteSub(item)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}

export default CategoriesComp;