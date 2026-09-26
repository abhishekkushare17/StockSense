import React, { useState, useEffect } from 'react';
import {
  History,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Warehouse,
  User,
  ArrowRightLeft,
  SlidersHorizontal,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import { getMoves } from '../services/moveService';
import { getWarehouses } from '../services/warehouseService';

export const MoveHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  // Filters
  const [opTypeFilter, setOpTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [opTypeFilter, warehouseFilter, page]);

  const loadWarehouses = async () => {
    try {
      const list = await getWarehouses({ status: 'active' });
      setWarehouses(list || []);
    } catch {
      // ignore
    }
  };

  const fetchLedger = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {
        page,
        limit: 30
      };
      if (opTypeFilter) params.operationType = opTypeFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getMoves(params);
      setEntries(data.entries || []);
      setPagination(data.pagination || { total: (data.entries || []).length, page: 1, totalPages: 1 });
    } catch (err) {
      setServerError(err.message || 'Failed to fetch move history');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLedger();
  };

  const handleResetFilters = () => {
    setOpTypeFilter('');
    setWarehouseFilter('');
    setSearch('');
    setPage(1);
  };

  const getOpBadge = (type) => {
    const norm = (type || '').toUpperCase();
    switch (norm) {
      case 'RECEIPT':
        return (
          <Badge variant="success" size="sm" dot>
            RECEIPT
          </Badge>
        );
      case 'DELIVERY':
        return (
          <Badge variant="danger" size="sm" dot>
            DELIVERY
          </Badge>
        );
      case 'TRANSFER_IN':
        return (
          <Badge variant="purple" size="sm" dot>
            TRANSFER IN
          </Badge>
        );
      case 'TRANSFER_OUT':
        return (
          <Badge variant="warning" size="sm" dot>
            TRANSFER OUT
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge variant="info" size="sm" dot>
            ADJUSTMENT
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{type || 'MOVEMENT'}</Badge>;
    }
  };

  // Table Columns as specified:
  // Date, Product, Operation, Warehouse, Before, Change, After, User
  const columns = [
    {
      key: 'timestamp',
      header: 'Date',
      render: (val, row) => {
        const dateObj = new Date(val || row.createdAt || Date.now());
        return (
          <div>
            <span className="text-xs font-semibold text-gray-900 block">
              {dateObj.toLocaleDateString()}
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      key: 'product',
      header: 'Product',
      render: (val) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">{val?.name || 'Stock Item'}</span>
          <span className="text-[11px] font-mono text-indigo-600 font-semibold">{val?.sku || 'SKU'}</span>
        </div>
      )
    },
    {
      key: 'operationType',
      header: 'Operation',
      render: (val, row) => getOpBadge(val || row.transactionType)
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Warehouse className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium">{val?.name || 'Central Facility'}</span>
          {val?.code && <span className="text-[10px] font-mono text-gray-400">({val.code})</span>}
        </div>
      )
    },
    {
      key: 'quantityBefore',
      header: 'Before',
      render: (val) => (
        <span className="font-mono font-medium text-xs text-gray-600">
          {val ?? 0}
        </span>
      )
    },
    {
      key: 'quantityChange',
      header: 'Change',
      render: (val, row) => {
        const change = val ?? row.quantityChanged ?? 0;
        const isPos = change > 0;
        const isZero = change === 0;
        return (
          <span
            className={`font-mono font-black text-xs inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
              isPos
                ? 'bg-emerald-50 text-emerald-700'
                : isZero
                ? 'bg-gray-100 text-gray-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {isPos ? `+${change}` : change}
          </span>
        );
      }
    },
    {
      key: 'quantityAfter',
      header: 'After',
      render: (val, row) => (
        <span className="font-mono font-black text-xs text-gray-900">
          {val ?? row.balanceAfter ?? 0}
        </span>
      )
    },
    {
      key: 'user',
      header: 'User',
      render: (val, row) => {
        const userObj = val || row.createdBy;
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate max-w-[120px] font-medium">
              {userObj?.name || 'System Auto'}
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            Stock Ledger & Move History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Immutable audit trail tracking every receipt, dispatch, internal transfer, and count adjustment.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={fetchLedger}
        >
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Product Name, SKU, Reference Document #..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            {(opTypeFilter || warehouseFilter || search) && (
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

        {/* Operation Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Operation:
          </span>
          {[
            { id: '', label: 'All Operations' },
            { id: 'RECEIPT', label: 'Receipts (+)' },
            { id: 'DELIVERY', label: 'Deliveries (-)' },
            { id: 'TRANSFER_IN', label: 'Transfer In (+)' },
            { id: 'TRANSFER_OUT', label: 'Transfer Out (-)' },
            { id: 'ADJUSTMENT', label: 'Adjustments (&plusmn;)' }
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => {
                setOpTypeFilter(op.id);
                setPage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                opTypeFilter === op.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading stock ledger entries..." size="lg" />
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-3">
          <Table columns={columns} data={entries} keyExtractor={(row) => row._id} />

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-2 text-xs text-gray-500">
            <span>
              Total records: <strong className="text-gray-900">{pagination.total || entries.length}</strong>
            </span>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page || page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Move History Records"
          description={
            opTypeFilter || warehouseFilter || search
              ? 'No movement audit records match your selected filter criteria.'
              : 'Complete receipts, deliveries, transfers, or adjustments to see audit logs populated.'
          }
          icon={History}
          action={
            (opTypeFilter || warehouseFilter || search) && (
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

export default MoveHistoryPage;
