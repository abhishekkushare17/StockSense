import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, AlertTriangle, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      // non-fatal
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data?.data?.products || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const columns = [
    {
      key: 'name',
      header: 'Product Details',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 block">{val}</span>
          <span className="text-xs font-mono text-gray-500">SKU: {row.sku}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => (
        <span className="text-xs font-medium text-gray-700">
          {val?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'unitOfMeasure',
      header: 'UoM',
      render: (val) => <span className="uppercase text-xs font-semibold text-gray-600">{val || 'pcs'}</span>,
    },
    {
      key: 'currentStock',
      header: 'In Stock',
      render: (val, row) => {
        const isLow = (row.currentStock || 0) <= (row.reorderLevel || 0);
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>
              {row.currentStock ?? 0}
            </span>
            {isLow && (
              <span title="Below reorder level">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (val) => <span className="text-xs text-gray-500">{val ?? 0}</span>,
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
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-600" />
            Products & Master Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage product items, SKU records, categories, and inventory reorder points.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading products..." size="lg" />
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={products} />
        </div>
      ) : (
        <EmptyState
          title="No Products Found"
          message="No items match your search or category filters."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setCategoryFilter('');
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;
