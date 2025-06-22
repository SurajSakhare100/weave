import React, { Fragment, useEffect, useState } from 'react';
import EditCategory from './EditCategory';
import MainModal from './MainModal';
import ExtraModal from './ExtraModal';
import Loading from '../../../components/Loading';
import { useRouter } from 'next/router';
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

function CategoriesComp({ loaded, setLoaded }) {
    const navigate = useRouter();

    const logOut = () => {
        localStorage.removeItem("adminToken");
        setLoaded(true);
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

    useEffect(() => {
        if (data) {
            setCategories(data.categories);
            setMainSub(data.mainSub);
            setSub(data.subCategory);
            setLoaded(true);
        }
        if (isLoading) setLoaded(false);
        if (error) setLoaded(true);
    }, [data, isLoading, error, setLoaded]);

    const handleDeleteCategory = async (category) => {
        if (window.confirm(`Do you want to delete "${category.name}"?`)) {
            try {
                const res = await deleteCategory({ id: category._id, folderId: category.uni_id1 + category.uni_id2 });
                if (res.data && res.data.login) {
                    logOut();
                } else {
                    refetch();
                }
            } catch (err) {
                alert("Sorry, we're facing some error");
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
                    refetch();
                }
            } catch (err) {
                alert("Sorry, we're facing some error");
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
                    refetch();
                }
            } catch (err) {
                alert("Sorry, we're facing some error");
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
            alert('Facing an error');
        }
    }, [oneCategoryData, oneCategoryError]);

    if (!loaded) return <Loading />;

    return (
        <Fragment>
            {mainModal.active && (
                <MainModal
                    mainModal={mainModal}
                    setMainModal={setMainModal}
                    setCategories={setCategories}
                    logOut={logOut}
                />
            )}
            {editModal.active && (
                <EditCategory
                    editModal={editModal}
                    setEditModal={setEditModal}
                    setCategories={setCategories}
                    editCategory={editCategory}
                    logOut={logOut}
                />
            )}
            {extraModal.active && (
                <ExtraModal
                    extraModal={extraModal}
                    setExtraModal={setExtraModal}
                    setCategories={setCategories}
                    setMainSub={setMainSub}
                    setSub={setSub}
                    logOut={logOut}
                />
            )}

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <Tag className="h-8 w-8 text-primary-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                                <p className="text-gray-600">Manage your product categories and subcategories</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <button
                                onClick={() => setMainModal({ ...mainModal, btn: true, active: true })}
                                className="btn-primary flex items-center justify-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Category</span>
                            </button>
                            <button
                                onClick={() => setExtraModal({ ...extraModal, btn: true, active: true, for: 'mainSub' })}
                                className="btn-outline flex items-center justify-center space-x-2"
                            >
                                <Layers size={20} />
                                <span>Add Main Sub</span>
                            </button>
                            <button
                                onClick={() => setExtraModal({ ...extraModal, btn: true, active: true, for: 'sub' })}
                                className="btn-outline flex items-center justify-center space-x-2"
                            >
                                <FolderTree size={20} />
                                <span>Add Sub</span>
                            </button>
                            <button
                                onClick={() => setExtraModal({ ...extraModal, btn: true, active: true, for: 'header' })}
                                className="btn-outline flex items-center justify-center space-x-2"
                            >
                                <FolderOpen size={20} />
                                <span>Add Header</span>
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-soft">
                            <button
                                onClick={() => {
                                    refetch();
                                    setPage({ ...page, category: true, mainSub: false, sub: false });
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    page.category
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => {
                                    refetch();
                                    setPage({ ...page, category: false, mainSub: true, sub: false });
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    page.mainSub
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Main Sub
                            </button>
                            <button
                                onClick={() => {
                                    refetch();
                                    setPage({ ...page, category: false, mainSub: false, sub: true });
                                }}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    page.sub
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Sub Categories
                            </button>
                        </div>
                    </div>

                    {/* Categories Table */}
                    {page.category && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center">
                                                    <Image size={16} className="mr-2" />
                                                    Image
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Header
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category, key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <img
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                        src={`${ServerId}/category/${category.uni_id1}${category.uni_id2}/${category.file.filename}`}
                                                        alt={category.name}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {category.header}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="btn-outline text-xs"
                                                    >
                                                        <Edit size={14} className="mr-1" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category)}
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
                            </div>
                        </div>
                    )}

                    {/* Main Sub Categories Table */}
                    {page.mainSub && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mainSub.map((item, key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteMainSub(item)}
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
                            </div>
                        </div>
                    )}

                    {/* Sub Categories Table */}
                    {page.sub && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Main Sub
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subCategory.map((item, key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.mainSub}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteSub(item)}
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}

export default CategoriesComp;