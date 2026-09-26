import React from 'react';
import {
  X,
  Warehouse,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../common';

export const WarehouseDetailModal = ({ isOpen, onClose, warehouse, isLoading = false }) => {
  if (!isOpen) return null;

  const stockColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-gray-900 text-xs">
            {row.product?.name || 'Unnamed Product'}
          </div>
          <div className="text-[11px] font-mono text-gray-500">
            SKU: {row.product?.sku || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Available Stock',
      render: (val, row) => {
        const reorderLevel = row.product?.reorderLevel || 10;
        const qty = row.quantity || 0;
        const isOutOfStock = qty <= 0;
        const isLowStock = qty > 0 && qty <= reorderLevel;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-bold font-mono text-xs ${
                isOutOfStock
                  ? 'text-rose-600'
                  : isLowStock
                  ? 'text-amber-600'
                  : 'text-gray-900'
              }`}
            >
              {qty} {row.product?.unitOfMeasure || 'units'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (val, row) => (
        <span className="text-xs text-gray-600 font-mono">
          {row.product?.reorderLevel ?? '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Stock Status',
      render: (val, row) => {
        const qty = row.quantity || 0;
        const reorderLevel = row.product?.reorderLevel || 10;
        if (qty <= 0) {
          return (
            <Badge variant="danger" size="sm" dot>
              Out of Stock
            </Badge>
          );
        }
        if (qty <= reorderLevel) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-gray-900">
                  {warehouse?.name || 'Warehouse Details'}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold">
                  {warehouse?.code || 'WH'}
                </span>
                <Badge
                  variant={
                    warehouse?.status === 'active' || warehouse?.isActive
                      ? 'success'
                      : 'neutral'
                  }
                  size="sm"
                  dot
                >
                  {warehouse?.status || (warehouse?.isActive ? 'active' : 'inactive')}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Facility metrics and active inventory storage breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loading text="Loading facility data..." size="md" />
            </div>
          ) : !warehouse ? (
            <div className="py-8 text-center text-xs text-gray-500">
              Facility details could not be loaded.
            </div>
          ) : (
            <>
              {/* Facility Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Location
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    {warehouse.location || warehouse.city || 'Standard Industrial Area'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {[warehouse.address, warehouse.city, warehouse.state, warehouse.postalCode]
                      .filter(Boolean)
                      .join(', ') || 'No street address specified'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Point of Contact
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    {warehouse.contactPerson || 'Not assigned'}
                  </div>
                  {warehouse.phone && (
                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" /> {warehouse.phone}
                    </div>
                  )}
                  {warehouse.email && (
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-gray-400" /> {warehouse.email}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/60">
                  <div className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-indigo-600" /> Stock Metrics
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-900">
                      {warehouse.totalQuantity ?? (warehouse.stocks?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0)}
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold">total units</span>
                  </div>
                  <div className="text-[11px] text-indigo-600/80 mt-1">
                    {warehouse.stocks?.length || warehouse.totalProducts || 0} distinct product SKUs stored
                  </div>
                </div>
              </div>

              {warehouse.description && (
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Description: </span>
                  {warehouse.description}
                </div>
              )}

              {/* Available Stock Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    Available Inventory Breakdown ({warehouse.stocks?.length || 0})
                  </h3>
                </div>

                {warehouse.stocks && warehouse.stocks.length > 0 ? (
                  <Table
                    columns={stockColumns}
                    data={warehouse.stocks}
                    keyExtractor={(row) => row._id || row.product?._id}
                  />
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">No stock stored in this warehouse</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Create a receipt or transfer to stock items in this facility.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetailModal;
