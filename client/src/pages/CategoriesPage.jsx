import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState, ConfirmDialog } from '../components/common';
import CategoryModal from '../components/categories/CategoryModal';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryService';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      const list = await getCategories(params);
      setCategories(list);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch categories.');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategoryList();
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsActionLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
        setNotification(`Category "${formData.name}" updated successfully.`);
      } else {
        await createCategory(formData);
        setNotification(`Category "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategoryList();
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsActionLoading(true);
    try {
      await deleteCategory(deletingCategory._id);
      setNotification(`Category "${deletingCategory.name}" deleted successfully.`);
      setDeletingCategory(null);
      fetchCategoryList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to delete category.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Category Name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">{val}</span>
          <span className="text-[11px] text-gray-500 truncate max-w-xs block">
            {row.description || 'No description provided'}
          </span>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
          {val}
        </span>
      ),
    },
    {
      key: 'productCount',
      header: 'Products Assigned',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
          <Package className="w-3 h-3 text-indigo-600" />
          {val ?? 0} products
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'neutral'} dot size="sm">
          {val || 'active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingCategory(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCategory(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-600" />
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Organize products into classification groups, manage codes, and track product allocation.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError('')}
            className="text-rose-600 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by category name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Category Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading categories..." size="lg" />
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={categories} />
        </div>
      ) : (
        <EmptyState
          title="No Categories Found"
          message="No product categories match your query."
          actionText="Add Category"
          onAction={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCreateOrUpdate}
        category={editingCategory}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}" (${deletingCategory?.code})?`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default CategoriesPage;
