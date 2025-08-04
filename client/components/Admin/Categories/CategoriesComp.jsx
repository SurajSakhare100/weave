import React, { Fragment, useEffect, useState } from 'react';
import EditCategory from './EditCategory';
import MainModal from './MainModal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Image, 
    Tag, 
    FolderOpen
} from 'lucide-react';
import {
  useGetAllTypesCategoryQuery,
  useDeleteCategoryMutation,
  useGetOneCategoryQuery
} from '../../../services/adminApi';
import { useAdminLogout } from '../../../hooks/useAdminLogout';

function CategoriesComp({ loaded = false, setLoaded }) {
    const navigate = useRouter();
    const { logout } = useAdminLogout();

    const [mainModal, setMainModal] = useState({
        btn: false,
        active: false,
    });

    const [editModal, setEditModal] = useState({
        btn: false,
        active: false,
    });

    const [editCategory, setEditCategory] = useState({});
    const [editCategoryId, setEditCategoryId] = useState(null);
    const { data: oneCategoryData, error: oneCategoryError } = useGetOneCategoryQuery(editCategoryId, { skip: !editCategoryId });

    // RTK Query hooks
    const { data, error, isLoading, refetch } = useGetAllTypesCategoryQuery();
    const [deleteCategory] = useDeleteCategoryMutation();

    // Local state for categories
    const [categories, setCategories] = useState([]);

    // Update local state when data changes
    useEffect(() => {
        if (data) {
            setCategories(data.categories || []);
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
                    logout();
                } else {
                    toast.success('Category deleted successfully');
                    refetch();
                }
            } catch (err) {
                toast.error("Sorry, we're facing some error");
            }
        }
    };

    const handleEditCategory = async (category) => {
        setEditCategory(category);
        setEditCategoryId(category._id);
        setEditModal({ ...editModal, btn: true, active: true });
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600">Error loading categories</div>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <Fragment>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Categories</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage your product categories
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white shadow rounded-lg">
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
                </div>
            </div>

            {/* Modals */}
            {mainModal.active && (
                <MainModal
                    modal={mainModal}
                    setModal={setMainModal}
                    refetch={refetch}
                />
            )}

            {editModal.active && (
                <EditCategory
                    modal={editModal}
                    setModal={setEditModal}
                    category={editCategory}
                    categoryData={oneCategoryData}
                    refetch={refetch}
                />
            )}
        </Fragment>
    );
}

export default CategoriesComp;