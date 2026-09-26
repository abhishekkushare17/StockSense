import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Warehouse,
  Package,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import { getAllStock } from '../services/stockService';
import { getWarehouses } from '../services/warehouseService';
import { getCategories } from '../services/categoryService';

export const StockPage = () => {
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalQuantity: 0,
    totalReserved: 0,
    totalAvailable: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  // Dropdown options
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // '', 'in_stock', 'low_stock', 'out_of_stock'

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [selectedWarehouse, selectedCategory, selectedStatus]);

  const loadFilterOptions = async () => {
    try {
      const [whList, catList] = await Promise.all([
        getWarehouses({ status: 'active' }).catch(() => []),
        getCategories().catch(() => [])
      ]);
      setWarehouses(whList);
      setCategories(catList);
    } catch {
      // ignore
    }
  };

  const fetchStockData = async () => {
    try {
      setIsLoading(true);
      setServerError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedWarehouse) params.warehouse = selectedWarehouse;
      if (selectedCategory) params.category = selectedCategory;

      if (selectedStatus === 'low_stock') {
        params.lowStock = 'true';
      } else if (selectedStatus === 'out_of_stock') {
        params.outOfStock = 'true';
      }

      const result = await getAllStock(params);
      let list = result.stocks || [];

      // If user selected "in_stock", filter out low/out
      if (selectedStatus === 'in_stock') {
        list = list.filter((s) => !s.lowStock && !s.outOfStock);
      }

      setStocks(list);
      setSummary(
        result.summary || {
          totalRecords: list.length,
          totalQuantity: list.reduce((a, b) => a + (b.quantity || 0), 0),
          totalReserved: list.reduce((a, b) => a + (b.reservedQuantity || 0), 0),
          totalAvailable: list.reduce((a, b) => a + (b.availableQuantity || 0), 0)
        }
      );
    } catch (err) {
      setServerError(err.message || 'Failed to fetch stock records.');
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStockData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedWarehouse('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // Table Columns
  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (val, row) => (
        <div>
          <div className="font-bold text-gray-900 text-xs">
            {row.product?.name || 'Unnamed Product'}
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-indigo-600 bg-indigo-50/80 px-1 rounded text-[10px]">
              {row.product?.sku || 'N/A'}
            </span>
            {row.product?.category?.name && (
              <span className="text-gray-400">
                &bull; {row.product.category.name}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          {row.product?.sku || '—'}
        </span>
      )
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <Warehouse className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-semibold text-xs text-gray-800">
            {row.warehouse?.name || 'Standard Warehouse'}
          </span>
          {row.warehouse?.code && (
            <span className="text-[10px] font-mono text-gray-400">
              ({row.warehouse.code})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'availableQuantity',
      header: 'Available Quantity',
      render: (val, row) => {
        const available = row.availableQuantity ?? Math.max(0, row.quantity - (row.reservedQuantity || 0));
        const unit = row.product?.unitOfMeasure || 'units';

        return (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`font-black font-mono text-xs ${
                  row.outOfStock
                    ? 'text-rose-600'
                    : row.lowStock
                    ? 'text-amber-600'
                    : 'text-gray-900'
                }`}
              >
                {available}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">{unit}</span>
            </div>
            {row.reservedQuantity > 0 && (
              <div className="text-[10px] text-gray-400 font-mono">
                ({row.reservedQuantity} reserved / {row.quantity} total)
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (val, row) => (
        <span className="font-mono text-xs text-gray-600 font-medium">
          {row.product?.reorderLevel ?? '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => {
        if (row.outOfStock || row.quantity === 0) {
          return (
            <Badge variant="danger" size="sm" dot>
              Out of Stock
            </Badge>
          );
        }
        if (row.lowStock || row.quantity <= (row.product?.reorderLevel || 10)) {
          return (
            <Badge variant="warning" size="sm" dot>
              Low Stock
            </Badge>
          );
        }
        return (
          <Badge variant="success" size="sm" dot>
            In Stock
          </Badge>
        );
      }
    }
  ];

  const lowStockCount = stocks.filter((s) => s.lowStock && !s.outOfStock).length;
  const outOfStockCount = stocks.filter((s) => s.outOfStock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Stock Availability
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time stock levels, warehouse allocations, and reorder thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={fetchStockData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Available
          </p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {(summary.totalAvailable ?? 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-gray-500">units</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">
            Total Reserved
          </p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {(summary.totalReserved ?? 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-purple-500">units</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Low Stock Alerts
          </p>
          <p className="text-2xl font-black text-amber-700 mt-1">{lowStockCount}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Out of Stock
          </p>
          <p className="text-2xl font-black text-rose-700 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            {serverError}
          </div>
          <button
            onClick={() => setServerError('')}
            className="text-xs font-bold text-rose-600 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Multi-factor Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Product or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
              />
            </form>
          </div>

          {/* Warehouse Filter */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh._id} value={wh._id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (At / below reorder)</option>
              <option value="out_of_stock">Out of Stock (Zero quantity)</option>
            </select>

            {(search || selectedWarehouse || selectedCategory || selectedStatus) && (
              <button
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

      {/* Stock Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading stock balances..." size="lg" />
        </div>
      ) : stocks.length > 0 ? (
        <div className="space-y-3">
          <Table
            columns={columns}
            data={stocks}
            keyExtractor={(row) => row._id || `${row.product?._id}-${row.warehouse?._id}`}
          />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{stocks.length}</span> stock entries
          </div>
        </div>
      ) : (
        <EmptyState
          title="No stock records found"
          description={
            search || selectedWarehouse || selectedCategory || selectedStatus
              ? 'No inventory matched your filter selection. Try resetting or adjusting filters.'
              : 'No stock recorded in the system yet. Receive products to establish stock balances.'
          }
          icon={Boxes}
          action={
            (search || selectedWarehouse || selectedCategory || selectedStatus) && (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default StockPage;
