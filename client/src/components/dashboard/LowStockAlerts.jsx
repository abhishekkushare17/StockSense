import React from 'react';
import { AlertTriangle, ArrowRight, Package, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Table } from '../common';

export const LowStockAlerts = ({ items = [], isLoading = false }) => {
  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block truncate">
            {row.product?.name || row.name || 'Stock Item'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            SKU: {row.product?.sku || row.sku || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Current Stock',
      render: (val, row) => {
        const qty = val ?? row.currentStock ?? 0;
        return (
          <span className="font-extrabold text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
            {qty} units
          </span>
        );
      },
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (val, row) => (
        <span className="text-xs font-semibold text-gray-700">
          {row.product?.reorderLevel ?? row.reorderLevel ?? 0} units
        </span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val, row) => (
        <span className="text-xs text-gray-600">
          {row.warehouse?.name || 'Central Distribution Hub'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Quick Action',
      render: (val, row) => (
        <Link
          to="/receipts"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          Reorder <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Low Stock Items
              {items.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[11px] font-bold">
                  {items.length} Critical
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Products that have breached minimum safety stock thresholds.
            </p>
          </div>
        </div>

        <Link
          to="/products?lowStock=true"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading stock alerts...</div>
      ) : items.length > 0 ? (
        <div className="overflow-x-auto">
          <Table columns={columns} data={items.slice(0, 5)} />
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-gray-800">Inventory Levels Optimum</h4>
          <p className="text-xs text-gray-400 mt-0.5">No products currently below reorder levels.</p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
