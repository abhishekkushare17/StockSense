import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Warehouse,
  Layers,
  XCircle,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState, ConfirmDialog } from '../components/common';
import ProductModal from '../components/products/ProductModal';
import ProductDetailModal from '../components/products/ProductDetailModal';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getWarehouses } from '../services/warehouseService';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [stockStateFilter, setStockStateFilter] = useState(''); // '', 'lowStock', 'outOfStock'

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailProductId, setDetailProductId] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load Categories & Warehouses on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch product list when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 250); // slight debounce for smooth filter switching
    return () => clearTimeout(timer);
  }, [search, categoryFilter, warehouseFilter, stockStateFilter]);

  const fetchMetadata = async () => {
    try {
      const [cats, whs] = await Promise.all([
        getCategories().catch(() => []),
        getWarehouses().catch(() => [])
      ]);
      setCategories(cats);
      setWarehouses(whs);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchProductList = async () => {
    try {
      setIsLoading(true);
      setServerError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (stockStateFilter === 'lowStock') params.lowStock = true;
      if (stockStateFilter === 'outOfStock') params.outOfStock = true;

      const data = await getProducts(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setServerError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProductList();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setWarehouseFilter('');
    setStockStateFilter('');
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsActionLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        setNotification(`Product "${formData.name}" updated successfully.`);
      } else {
        await createProduct(formData);
        setNotification(`Product "${formData.name}" created successfully.`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchProductList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Operation failed. Please check SKU uniqueness.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsActionLoading(true);
    try {
      await deleteProduct(deletingProduct._id);
      setNotification(`Product "${deletingProduct.name}" deleted successfully.`);
      setDeletingProduct(null);
      fetchProductList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to delete product.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">{val}</span>
          <span className="text-[11px] text-gray-500 truncate max-w-xs block">
            {row.description || 'No description provided'}
          </span>
        </div>
      )
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (val) => (
        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
          {val}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => (
        <span className="text-xs font-semibold text-gray-700">
          {val?.name || 'Raw Materials'}
        </span>
      )
    },
    {
      key: 'unitOfMeasure',
      header: 'Unit',
      render: (val) => (
        <span className="text-xs uppercase font-medium text-gray-500">
          {val || 'pcs'}
        </span>
      )
    },
    {
      key: 'totalStock',
      header: 'Stock',
      render: (val, row) => {
        const stock = val ?? row.currentStock ?? 0;
        const isOut = stock === 0 || row.outOfStock;
        const isLow = row.lowStock || stock <= (row.reorderLevel ?? 0);

        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono font-extrabold text-xs ${
                isOut
                  ? 'text-rose-600'
                  : isLow
                  ? 'text-amber-600'
                  : 'text-gray-900'
              }`}
            >
              {stock}
            </span>
            {isOut ? (
              <XCircle className="w-3.5 h-3.5 text-rose-500" title="Out of stock" />
            ) : isLow ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Below reorder level" />
            ) : null}
          </div>
        );
      }
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val, row) => {
        const whName =
          row.stocks?.[0]?.warehouse?.name ||
          (warehouses.length > 0 ? warehouses[0].name : 'Central Hub');
        return <span className="text-xs text-gray-600">{whName}</span>;
      }
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (val) => <span className="text-xs font-mono text-gray-500">{val ?? 10}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'neutral'} dot size="sm">
          {val || 'active'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDetailProductId(row._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(row);
              setIsProductModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingProduct(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const hasActiveFilters = Boolean(
    search || categoryFilter || warehouseFilter || stockStateFilter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Maintain product catalog records, SKU codes, categories, units of measure, and safety reorder triggers.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStockStateFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            stockStateFilter === ''
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Products
        </button>
        <button
          type="button"
          onClick={() => setStockStateFilter('lowStock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            stockStateFilter === 'lowStock'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Low Stock Only
        </button>
        <button
          type="button"
          onClick={() => setStockStateFilter('outOfStock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            stockStateFilter === 'outOfStock'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Out of Stock Only
        </button>
      </div>

      {/* Notifications and Alerts */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Product Name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Filter */}
          <div className="flex items-center gap-2">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading products..." size="lg" />
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-3">
          <Table
            columns={columns}
            data={products}
            keyExtractor={(row) => row._id}
          />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> products
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Products Found"
          description={
            hasActiveFilters
              ? 'No products matched your active filters. Try searching for a different keyword or reset filters.'
              : 'Start by creating your first product item in the inventory catalog.'
          }
          icon={Package}
          action={
            hasActiveFilters ? (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
              >
                Add Product
              </Button>
            )
          }
        />
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        categories={categories}
        warehouses={warehouses}
        isLoading={isActionLoading}
      />

      {/* Product Details Modal */}
      <ProductDetailModal
        isOpen={Boolean(detailProductId)}
        onClose={() => setDetailProductId(null)}
        productId={detailProductId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onCancel={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete product "${deletingProduct?.name}" (${deletingProduct?.sku})? Products with active stock cannot be deleted until inventory is zeroed.`}
        confirmText="Delete Product"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default ProductsPage;
