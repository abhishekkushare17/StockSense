import React, { useState, useEffect } from 'react';
import {
  Truck,
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
import DeliveryModal from '../components/deliveries/DeliveryModal';
import DeliveryProcessModal from '../components/deliveries/DeliveryProcessModal';
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  validateDelivery
} from '../services/deliveryService';
import { getProducts } from '../services/productService';
import { getWarehouses } from '../services/warehouseService';

export const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Process
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [validatingDelivery, setValidatingDelivery] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Alerts
  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchDeliveriesList();
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

  const fetchDeliveriesList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (warehouseFilter) params.warehouse = warehouseFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getDeliveries(params);
      setDeliveries(data.deliveries || []);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch deliveries');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDeliveriesList();
  };

  const handleCreateDelivery = async (formData) => {
    setIsActionLoading(true);
    setServerError('');
    try {
      const newDelivery = await createDelivery(formData);
      setNotification(`Delivery order "${newDelivery.deliveryNumber}" created successfully.`);
      setIsCreateModalOpen(false);
      fetchDeliveriesList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to create delivery order');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenProcess = async (del) => {
    setSelectedDelivery(del);
    setIsProcessModalOpen(true);
    try {
      const detailed = await getDeliveryById(del._id);
      if (detailed) setSelectedDelivery(detailed);
    } catch {
      // fallback
    }
  };

  const handleStatusUpdate = async (del, nextStatus) => {
    setIsActionLoading(true);
    setServerError('');
    try {
      const updated = await updateDelivery(del._id, { status: nextStatus });
      setSelectedDelivery(updated);
      setNotification(`Delivery "${del.deliveryNumber}" status updated to ${nextStatus}.`);
      fetchDeliveriesList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to update order status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenValidateConfirm = (del, e) => {
    e?.stopPropagation();
    setValidatingDelivery(del);
  };

  const handleConfirmValidate = async () => {
    if (!validatingDelivery) return;
    setIsActionLoading(true);
    setServerError('');
    try {
      await validateDelivery(validatingDelivery._id);
      setNotification(`Delivery order "${validatingDelivery.deliveryNumber}" validated and stock deducted successfully.`);
      setValidatingDelivery(null);
      setIsProcessModalOpen(false);
      fetchDeliveriesList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Validation failed. Check available stock in source warehouse.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <Badge variant="success" dot size="sm">Done</Badge>;
      case 'Ready':
        return <Badge variant="purple" dot size="sm">Ready (Packed)</Badge>;
      case 'Waiting':
        return <Badge variant="warning" dot size="sm">Waiting (Picking)</Badge>;
      case 'Canceled':
        return <Badge variant="danger" dot size="sm">Canceled</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">{status || 'Draft'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'deliveryNumber',
      header: 'Delivery #',
      render: (val, row) => (
        <button
          onClick={() => handleOpenProcess(row)}
          className="font-mono font-bold text-xs text-indigo-600 hover:text-indigo-800 hover:underline text-left"
        >
          {val}
        </button>
      )
    },
    {
      key: 'customer',
      header: 'Customer / Reference',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-gray-900 block">
            {val || row.customerName || '—'}
          </span>
          {row.notes && (
            <span className="text-[11px] text-gray-400 truncate max-w-xs block">
              {row.notes}
            </span>
          )}
        </div>
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
          (sum, item) => sum + (item.quantity || item.quantityDelivered || 0),
          0
        );
        return (
          <span className="font-mono font-black text-xs text-purple-700">
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
      key: 'deliveryDate',
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
        const isDone = row.status === 'Done';
        const isReady = row.status === 'Ready';
        const isWaiting = row.status === 'Waiting';
        const isDraft = row.status === 'Draft' || !row.status;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenProcess(row)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Process Order"
            >
              <Eye className="w-4 h-4" />
            </button>

            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(row, 'Waiting')}
              >
                Pick
              </Button>
            )}

            {isWaiting && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(row, 'Ready')}
              >
                Pack
              </Button>
            )}

            {isReady && (
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
            <Truck className="w-6 h-6 text-purple-600" />
            Outbound Delivery Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pick, pack, and validate customer shipments while managing stock deductions.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Delivery Order
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
              placeholder="Search by Delivery # or Customer Reference..."
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
              onClick={fetchDeliveriesList}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lifecycle:
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
              {st ? (st === 'Waiting' ? 'Pick (Waiting)' : st === 'Ready' ? 'Pack (Ready)' : st) : 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Table */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading deliveries..." size="lg" />
        </div>
      ) : deliveries.length > 0 ? (
        <div className="space-y-3">
          <Table columns={columns} data={deliveries} keyExtractor={(row) => row._id} />
          <div className="text-right text-xs text-gray-500 px-2">
            Showing <span className="font-semibold text-gray-900">{deliveries.length}</span> orders
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Delivery Orders Found"
          description={
            statusFilter || warehouseFilter || search
              ? 'No delivery orders matched your filter parameters.'
              : 'Create your first delivery order to dispatch inventory to customers.'
          }
          icon={Truck}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Delivery Order
            </Button>
          }
        />
      )}

      {/* Create Delivery Modal */}
      <DeliveryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDelivery}
        products={products}
        warehouses={warehouses}
        isLoading={isActionLoading}
      />

      {/* Process / Lifecycle Stepper Modal */}
      <DeliveryProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        delivery={selectedDelivery}
        onStatusUpdate={handleStatusUpdate}
        onValidate={(del) => setValidatingDelivery(del)}
        isActionLoading={isActionLoading}
      />

      {/* Confirmation Dialog before validating */}
      <ConfirmDialog
        isOpen={Boolean(validatingDelivery)}
        title="Validate Delivery Order"
        message="Are you sure you want to validate this operation? This will deduct the required quantities from the source warehouse and log an audit entry in the stock ledger."
        confirmText="Validate & Deduct Stock"
        confirmVariant="danger"
        isLoading={isActionLoading}
        onConfirm={handleConfirmValidate}
        onCancel={() => setValidatingDelivery(null)}
      />
    </div>
  );
};

export default DeliveriesPage;
