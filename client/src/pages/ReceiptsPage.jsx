import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Warehouse,
  RotateCcw
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState, ConfirmDialog } from '../components/common';
import ReceiptModal from '../components/receipts/ReceiptModal';
import ReceiptDetailModal from '../components/receipts/ReceiptDetailModal';
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  validateReceipt
} from '../services/receiptService';
import { getProducts } from '../services/productService';
import { getWarehouses } from '../services/warehouseService';

export const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Confirmation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [validatingReceipt, setValidatingReceipt] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Alerts
  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchReceiptsList();
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

  const fetchReceiptsList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getReceipts(params);
      setReceipts(data.receipts || []);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch receipts');
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReceiptsList();
  };

  const handleCreateReceipt = async (formData) => {
    setIsActionLoading(true);
    setServerError('');
    try {
      const newReceipt = await createReceipt({
        supplier: formData.supplier,
        warehouse: formData.warehouse,
        items: formData.items,
        notes: formData.notes,
        status: 'Draft'
      });

      if (formData.action === 'validate') {
        await validateReceipt(newReceipt._id);
        setNotification(`Receipt "${newReceipt.receiptNumber}" created and validated successfully.`);
      } else {
        setNotification(`Receipt "${newReceipt.receiptNumber}" saved as Draft.`);
      }

      setIsCreateModalOpen(false);
      fetchReceiptsList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to process receipt');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenValidateConfirm = (receipt, e) => {
    e?.stopPropagation();
    setValidatingReceipt(receipt);
  };

  const handleConfirmValidate = async () => {
    if (!validatingReceipt) return;
    setIsActionLoading(true);
    setServerError('');
    try {
      await validateReceipt(validatingReceipt._id);
      setNotification(`Receipt "${validatingReceipt.receiptNumber}" validated and stock increased successfully.`);
      setValidatingReceipt(null);
      setIsDetailOpen(false);
      fetchReceiptsList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Validation failed. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenDetails = async (receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailOpen(true);
    try {
      const detailed = await getReceiptById(receipt._id);
      if (detailed) setSelectedReceipt(detailed);
    } catch {
      // fallback to current row
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
      key: 'receiptNumber',
      header: 'Receipt #',
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
      key: 'supplier',
      header: 'Supplier',
      render: (val, row) => (
        <span className="font-semibold text-xs text-gray-900">
          {val || row.supplierName || '—'}
        </span>
      )
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <Warehouse className="w-3.5 h-3.5 text-gray-400" />
          <span>{row.warehouse?.name || 'Central Facility'}</span>
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
          (sum, item) => sum + (item.quantity || item.quantityReceived || 0),
          0
        );
        return (
          <span className="font-mono font-black text-xs text-emerald-700">
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
          {val || row.receivedDate ? new Date(val || row.receivedDate).toLocaleDateString() : 'Today'}
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
              title="View Details"
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
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            Inbound Receipts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Supplier purchase orders, inbound receiving verification, and inventory increments.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Receipt
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
              placeholder="Search by Receipt # or Supplier..."
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
              onClick={fetchReceiptsList}
            >
              Refresh
            </Button>
          </div>
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
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading receipts..." size="lg" />
        </div>
      ) : receipts.length > 0 ? (
        <div className="space-y-3">
          <Table columns={columns} data={receipts} keyExtractor={(row) => row._id} />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{receipts.length}</span> receipts
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Receipts Found"
          description={
            statusFilter || warehouseFilter || search
              ? 'No receipts matched your filter selection.'
              : 'Create your first inbound receipt to record incoming goods from suppliers.'
          }
          icon={ClipboardList}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Receipt
            </Button>
          }
        />
      )}

      {/* Create Receipt Modal */}
      <ReceiptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReceipt}
        products={products}
        warehouses={warehouses}
        isLoading={isActionLoading}
      />

      {/* Receipt Detail Modal */}
      <ReceiptDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        receipt={selectedReceipt}
        onValidate={(receipt) => setValidatingReceipt(receipt)}
        isValidating={isActionLoading}
      />

      {/* Confirmation Dialog before validating */}
      <ConfirmDialog
        isOpen={Boolean(validatingReceipt)}
        title="Validate Inbound Receipt"
        message="Are you sure you want to validate this operation? This will increase stock in the destination warehouse and record an audit entry in the stock ledger."
        confirmText="Validate & Increase Stock"
        confirmVariant="success"
        isLoading={isActionLoading}
        onConfirm={handleConfirmValidate}
        onCancel={() => setValidatingReceipt(null)}
      />
    </div>
  );
};

export default ReceiptsPage;
