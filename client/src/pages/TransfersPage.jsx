import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Warehouse,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState, ConfirmDialog } from '../components/common';
import TransferModal from '../components/transfers/TransferModal';
import TransferDetailModal from '../components/transfers/TransferDetailModal';
import {
  getTransfers,
  getTransferById,
  createTransfer,
  validateTransfer
} from '../services/transferService';
import { getProducts } from '../services/productService';
import { getWarehouses } from '../services/warehouseService';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Confirmation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [validatingTransfer, setValidatingTransfer] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Alerts
  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchTransfersList();
  }, [statusFilter]);

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

  const fetchTransfersList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getTransfers(params);
      setTransfers(data.transfers || []);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch transfers');
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransfersList();
  };

  const handleCreateTransfer = async (formData) => {
    setIsActionLoading(true);
    setServerError('');
    try {
      const newTransfer = await createTransfer({
        sourceWarehouse: formData.sourceWarehouse,
        destinationWarehouse: formData.destinationWarehouse,
        items: [{ product: formData.product, quantity: formData.quantity }],
        notes: formData.notes,
        status: 'Draft'
      });

      if (formData.action === 'validate') {
        await validateTransfer(newTransfer._id);
        setNotification(`Transfer "${newTransfer.transferNumber}" executed and validated successfully.`);
      } else {
        setNotification(`Transfer "${newTransfer.transferNumber}" saved as Draft.`);
      }

      setIsCreateModalOpen(false);
      fetchTransfersList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to initiate transfer');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenValidateConfirm = (tr, e) => {
    e?.stopPropagation();
    setValidatingTransfer(tr);
  };

  const handleConfirmValidate = async () => {
    if (!validatingTransfer) return;
    setIsActionLoading(true);
    setServerError('');
    try {
      await validateTransfer(validatingTransfer._id);
      setNotification(`Transfer "${validatingTransfer.transferNumber}" validated successfully. Dual movements recorded in ledger.`);
      setValidatingTransfer(null);
      setIsDetailOpen(false);
      fetchTransfersList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Validation failed. Check available stock in origin facility.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDetails = async (tr) => {
    setSelectedTransfer(tr);
    setIsDetailOpen(true);
    try {
      const detailed = await getTransferById(tr._id);
      if (detailed) setSelectedTransfer(detailed);
    } catch {
      // fallback
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <Badge variant="success" dot size="sm">Done</Badge>;
      case 'Ready':
        return <Badge variant="purple" dot size="sm">Ready</Badge>;
      case 'Waiting':
        return <Badge variant="warning" dot size="sm">Waiting</Badge>;
      case 'Canceled':
        return <Badge variant="danger" dot size="sm">Canceled</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">{status || 'Draft'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'transferNumber',
      header: 'Transfer #',
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
      key: 'route',
      header: 'Movement Route (Origin &rarr; Destination)',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-gray-900">{row.sourceWarehouse?.name || 'Origin'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-semibold text-indigo-700">{row.destinationWarehouse?.name || 'Destination'}</span>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Products',
      render: (val, row) => {
        const items = val || row.items || [];
        if (items.length === 0) return <span className="text-xs text-gray-400">0 items</span>;
        const firstProdName = items[0]?.product?.name || 'Item';
        return (
          <div className="text-xs">
            <span className="font-semibold text-gray-800">{firstProdName}</span>
            {items.length > 1 && (
              <span className="text-[11px] text-gray-500 ml-1">+{items.length - 1} more</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (val, row) => {
        const total = (row.items || []).reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        return (
          <span className="font-mono font-black text-xs text-amber-700">
            {total} units
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => getStatusBadge(val)
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val, row) => (
        <span className="text-xs text-gray-500 font-medium">
          {val || row.createdAt ? new Date(val || row.createdAt).toLocaleDateString() : 'Today'}
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
              title="View Transfer Flow"
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
            <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            Internal Warehouse Transfers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Reallocate stock between facilities while maintaining total company inventory balance.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Initiate Transfer
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

      {/* Filters & Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transfer Number..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
            />
          </form>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={fetchTransfersList}
          >
            Refresh
          </Button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st || 'All Transfers'}
            </button>
          ))}
        </div>
      </div>

      {/* Transfers Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading transfer records..." size="lg" />
        </div>
      ) : transfers.length > 0 ? (
        <div className="space-y-3">
          <Table columns={columns} data={transfers} keyExtractor={(row) => row._id} />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{transfers.length}</span> transfers
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Internal Transfers Found"
          description={
            statusFilter || search
              ? 'No transfers matched your filter selection.'
              : 'Create your first internal transfer to move stock between storage locations.'
          }
          icon={ArrowRightLeft}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Initiate Transfer
            </Button>
          }
        />
      )}

      {/* Create Transfer Modal */}
      <TransferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTransfer}
        products={products}
        warehouses={warehouses}
        isLoading={isActionLoading}
      />

      {/* Transfer Detail Modal */}
      <TransferDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transfer={selectedTransfer}
        onValidate={(tr) => setValidatingTransfer(tr)}
        isValidating={isActionLoading}
      />

      {/* Confirmation Dialog before validating */}
      <ConfirmDialog
        isOpen={Boolean(validatingTransfer)}
        title="Validate Internal Transfer"
        message="Are you sure you want to validate this operation? This will transfer stock between the two facilities and register dual audit entries in the stock ledger while keeping overall company stock balanced."
        confirmText="Validate & Transfer Stock"
        confirmVariant="success"
        isLoading={isActionLoading}
        onConfirm={handleConfirmValidate}
        onCancel={() => setValidatingTransfer(null)}
      />
    </div>
  );
};

export default TransfersPage;
