import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Warehouse,
  RotateCcw,
  Calculator
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState, ConfirmDialog } from '../components/common';
import AdjustmentModal from '../components/adjustments/AdjustmentModal';
import AdjustmentDetailModal from '../components/adjustments/AdjustmentDetailModal';
import {
  getAdjustments,
  getAdjustmentById,
  createAdjustment,
  validateAdjustment
} from '../services/adjustmentService';
import { getProducts } from '../services/productService';
import { getWarehouses } from '../services/warehouseService';

export const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Confirmation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [validatingAdjustment, setValidatingAdjustment] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Alerts
  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchAdjustmentsList();
  }, [statusFilter, warehouseFilter]);

  const loadMetadata = async () => {
    try {
      const [prodRes, whList] = await Promise.all([
        getProducts({ limit: 100 }).catch(() => ({ products: [] })),
        getWarehouses({ status: 'active' }).catch(() => [])
      ]);
      setProducts(prodRes.products || []);
      setWarehouses(whList || []);
    } catch {
      // ignore
    }
  };

  const fetchAdjustmentsList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getAdjustments(params);
      setAdjustments(data.adjustments || []);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch adjustments');
      setAdjustments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdjustmentsList();
  };

  const handleCreateAdjustment = async (formData) => {
    setIsActionLoading(true);
    setServerError('');
    try {
      const newAdj = await createAdjustment({
        warehouse: formData.warehouse,
        items: [
          {
            product: formData.product,
            recordedQuantity: formData.recordedQuantity,
            physicalQuantity: formData.physicalQuantity,
            difference: formData.difference,
            reason: formData.reason
          }
        ],
        status: 'Draft'
      });

      if (formData.action === 'validate') {
        await validateAdjustment(newAdj._id);
        setNotification(`Adjustment "${newAdj.adjustmentNumber}" created and applied to stock successfully.`);
      } else {
        setNotification(`Adjustment "${newAdj.adjustmentNumber}" saved as Draft.`);
      }

      setIsCreateModalOpen(false);
      fetchAdjustmentsList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to record adjustment');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenValidateConfirm = (adj, e) => {
    e?.stopPropagation();
    setValidatingAdjustment(adj);
  };

  const handleConfirmValidate = async () => {
    if (!validatingAdjustment) return;
    setIsActionLoading(true);
    setServerError('');
    try {
      await validateAdjustment(validatingAdjustment._id);
      setNotification(`Adjustment "${validatingAdjustment.adjustmentNumber}" validated and applied to inventory balances.`);
      setValidatingAdjustment(null);
      setIsDetailOpen(false);
      fetchAdjustmentsList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Validation failed. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDetails = async (adj) => {
    setSelectedAdjustment(adj);
    setIsDetailOpen(true);
    try {
      const detailed = await getAdjustmentById(adj._id);
      if (detailed) setSelectedAdjustment(detailed);
    } catch {
      // fallback
    }
  };

  const columns = [
    {
      key: 'adjustmentNumber',
      header: 'Adjustment #',
      render: (val, row) => (
        <button
          onClick={() => handleOpenDetails(row)}
          className="font-mono font-bold text-xs text-indigo-600 hover:text-indigo-800 hover:underline text-left"
        >
          {val}
        </button>
      )
    },
    {
      key: 'warehouse',
      header: 'Warehouse Facility',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Warehouse className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">{row.warehouse?.name || 'Central Facility'}</span>
        </div>
      )
    },
    {
      key: 'product',
      header: 'Product Item',
      render: (val, row) => {
        const item = row.items?.[0];
        const prodName = item?.product?.name || 'Stock Item';
        return (
          <div>
            <span className="font-bold text-xs text-gray-900 block">{prodName}</span>
            {row.items?.length > 1 && (
              <span className="text-[11px] text-gray-500">+{row.items.length - 1} more items</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'recordedQuantity',
      header: 'Recorded',
      render: (val, row) => {
        const rec = row.items?.[0]?.recordedQuantity ?? row.items?.[0]?.oldQuantity ?? 0;
        return <span className="font-mono font-bold text-xs text-gray-600">{rec}</span>;
      }
    },
    {
      key: 'physicalQuantity',
      header: 'Physical',
      render: (val, row) => {
        const phys = row.items?.[0]?.physicalQuantity ?? row.items?.[0]?.newQuantity ?? 0;
        return <span className="font-mono font-black text-xs text-indigo-700">{phys}</span>;
      }
    },
    {
      key: 'difference',
      header: 'Difference',
      render: (val, row) => {
        const item = row.items?.[0];
        const diff = item?.difference !== undefined
          ? item.difference
          : (item?.physicalQuantity ?? item?.newQuantity ?? 0) - (item?.recordedQuantity ?? item?.oldQuantity ?? 0);
        const isNeg = diff < 0;
        const isPos = diff > 0;
        return (
          <span
            className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
              isNeg
                ? 'bg-rose-50 text-rose-700'
                : isPos
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isPos ? `+${diff}` : diff}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge
          variant={val === 'Done' ? 'success' : val === 'Canceled' ? 'danger' : 'neutral'}
          dot
          size="sm"
        >
          {val || 'Draft'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val, row) => (
        <span className="text-xs text-gray-500 font-medium">
          {val || row.adjustmentDate ? new Date(val || row.adjustmentDate).toLocaleDateString() : 'Today'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => {
        const canValidate = !['Done', 'Canceled'].includes(row.status);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDetails(row)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View Reconciliation"
            >
              <Eye className="w-4 h-4" />
            </button>
            {canValidate && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => handleOpenValidateConfirm(row, e)}
              >
                Validate
              </Button>
            )}
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
            <SlidersHorizontal className="w-6 h-6 text-indigo-600" />
            Inventory Adjustments
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Reconcile physical inventory counts against system records and register discrepancy adjustments.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Count Adjustment
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
          <button
            onClick={() => setServerError('')}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Adjustment # or Product..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={fetchAdjustmentsList}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Adjustments Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading adjustments..." size="lg" />
        </div>
      ) : adjustments.length > 0 ? (
        <div className="space-y-3">
          <Table columns={columns} data={adjustments} keyExtractor={(row) => row._id} />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{adjustments.length}</span> adjustments
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Inventory Adjustments Found"
          description={
            statusFilter || warehouseFilter || search
              ? 'No adjustment records matched your active filters.'
              : 'Create a stock adjustment to reconcile discrepancies found during physical inventory counts.'
          }
          icon={SlidersHorizontal}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Count Adjustment
            </Button>
          }
        />
      )}

      {/* Create Adjustment Modal */}
      <AdjustmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAdjustment}
        products={products}
        warehouses={warehouses}
        isLoading={isActionLoading}
      />

      {/* Adjustment Detail Modal */}
      <AdjustmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        adjustment={selectedAdjustment}
        onValidate={(adj) => setValidatingAdjustment(adj)}
        isValidating={isActionLoading}
      />

      {/* Confirmation Dialog before validating */}
      <ConfirmDialog
        isOpen={Boolean(validatingAdjustment)}
        title="Validate Inventory Adjustment"
        message="Are you sure you want to validate this operation? This will synchronize the warehouse stock with the physical count and record an audit entry in the stock ledger."
        confirmText="Validate & Adjust Stock"
        confirmVariant="success"
        isLoading={isActionLoading}
        onConfirm={handleConfirmValidate}
        onCancel={() => setValidatingAdjustment(null)}
      />
    </div>
  );
};

export default AdjustmentsPage;
