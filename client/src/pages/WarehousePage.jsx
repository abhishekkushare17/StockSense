import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { Badge, Button, Loading, EmptyState, ConfirmDialog } from '../components/common';
import WarehouseModal from '../components/warehouse/WarehouseModal';
import WarehouseDetailModal from '../components/warehouse/WarehouseDetailModal';
import WarehouseRackVisualizer from '../components/warehouse/WarehouseRackVisualizer';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../services/warehouseService';
import { stockService } from '../services/stockService';

export const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('racks'); // 'racks' or 'facilities'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWarehouseDetail, setSelectedWarehouseDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [notification, setNotification] = useState('');
  const [serverError, setServerError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchWarehouseList();
  }, [statusFilter]);

  const fetchWarehouseList = async () => {
    try {
      setIsLoading(true);
      setServerError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const [list, stockData] = await Promise.all([
        getWarehouses(params),
        stockService.getStockLevels().catch(() => ({ stocks: [] }))
      ]);
      setWarehouses(list);
      setAllStocks(stockData.stocks || []);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch warehouses.');
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWarehouseList();
  };

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wh, e) => {
    e?.stopPropagation();
    setEditingWarehouse(wh);
    setIsModalOpen(true);
  };

  const handleOpenDetails = async (wh, e) => {
    e?.stopPropagation();
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const details = await getWarehouseById(wh._id);
      setSelectedWarehouseDetail(details);
    } catch (err) {
      setServerError(err.message || 'Failed to fetch warehouse details.');
      setSelectedWarehouseDetail(wh);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsActionLoading(true);
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse._id, formData);
        setNotification(`Warehouse "${formData.name}" updated successfully.`);
      } else {
        await createWarehouse(formData);
        setNotification(`Warehouse "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
      fetchWarehouseList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWarehouse) return;
    setIsActionLoading(true);
    try {
      await deleteWarehouse(deletingWarehouse._id);
      setNotification(`Warehouse "${deletingWarehouse.name}" deleted successfully.`);
      setDeletingWarehouse(null);
      fetchWarehouseList();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setServerError(err.message || 'Failed to delete warehouse.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // KPI Calculations
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(
    (w) => w.status === 'active' || w.isActive
  ).length;
  const totalStockUnits = warehouses.reduce(
    (acc, w) => acc + (w.totalQuantity || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Warehouse className="w-6 h-6 text-indigo-600" />
            Warehouse Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Storage locations, distribution centers, and facility inventory breakdown.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Add Warehouse
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Warehouses
          </p>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalWarehouses}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Active Facilities
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeWarehouses}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Total Stock Stored
          </p>
          <p className="text-2xl font-black text-indigo-900 mt-1">
            {totalStockUnits.toLocaleString()}{' '}
            <span className="text-xs font-normal text-indigo-600">units</span>
          </p>
        </div>
      </div>

      {/* Flash Notifications */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {notification}
        </div>
      )}

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

      {/* View Switcher: 2D Rack & Bay Layout vs Facility Directory */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('racks')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'racks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          2D Bay & Rack Layout Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('facilities')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'facilities'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Facility Directory ({warehouses.length})
        </button>
      </div>

      {activeTab === 'racks' && (
        <WarehouseRackVisualizer
          warehouses={warehouses}
          stocks={allStocks}
        />
      )}

      {/* Filters & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouse by name, code, location, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchWarehouseList}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading warehouses..." size="lg" />
        </div>
      ) : warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh._id}
              onClick={() => handleOpenDetails(wh)}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header inside card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-mono">
                      {wh.code?.slice(-3) || 'WH'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {wh.name}
                      </h3>
                      <p className="text-xs font-mono text-indigo-600">Code: {wh.code}</p>
                    </div>
                  </div>
                  <Badge
                    variant={wh.status === 'active' || wh.isActive ? 'success' : 'neutral'}
                    dot
                    size="sm"
                  >
                    {wh.status || (wh.isActive ? 'Active' : 'Inactive')}
                  </Badge>
                </div>

                {/* Facility Details */}
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {wh.location || wh.city || 'Standard Facility Zone'}
                    </span>
                  </div>
                  {wh.contactPerson && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-gray-400 flex items-center justify-center text-[10px] font-bold">
                        &bull;
                      </span>
                      <span className="truncate">Contact: {wh.contactPerson}</span>
                    </div>
                  )}
                  {wh.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{wh.phone}</span>
                    </div>
                  )}
                  {wh.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{wh.email}</span>
                    </div>
                  )}
                </div>

                {/* Stock Stats pill */}
                <div className="mt-4 p-2.5 rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-600" /> Stored Stock:
                  </span>
                  <span className="font-bold font-mono text-gray-900">
                    {wh.totalQuantity ?? 0} units
                  </span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                  onClick={(e) => handleOpenDetails(wh, e)}
                >
                  View Stock
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEdit(wh, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit Warehouse"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingWarehouse(wh);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No warehouses found"
          description={
            search || statusFilter
              ? 'No warehouse facilities matched your filter parameters.'
              : 'Add your primary storage warehouses or distribution facilities to start managing stock.'
          }
          icon={Warehouse}
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Add First Warehouse
            </Button>
          }
        />
      )}

      {/* Warehouse Add/Edit Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSubmit={handleCreateOrUpdate}
        warehouse={editingWarehouse}
        isLoading={isActionLoading}
      />

      {/* Warehouse Detail Modal */}
      <WarehouseDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedWarehouseDetail(null);
        }}
        warehouse={selectedWarehouseDetail}
        isLoading={isDetailLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingWarehouse}
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete "${deletingWarehouse?.name}" (${deletingWarehouse?.code})? Facilities with active stock cannot be deleted until inventory is transferred.`}
        confirmText="Delete Warehouse"
        confirmVariant="danger"
        isLoading={isActionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingWarehouse(null)}
      />
    </div>
  );
};

export default WarehousePage;
