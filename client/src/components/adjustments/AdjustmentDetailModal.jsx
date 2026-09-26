import React from 'react';
import {
  X,
  SlidersHorizontal,
  Warehouse,
  Package,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Badge, Button, Table, Loading } from '../common';

export const AdjustmentDetailModal = ({
  isOpen,
  onClose,
  adjustment,
  onValidate,
  isValidating = false,
  isLoading = false
}) => {
  if (!isOpen) return null;

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

  const itemColumns = [
    {
      key: 'product',
      header: 'Product Item',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">
            {row.product?.name || 'Stock Item'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            SKU: {row.product?.sku || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'recordedQuantity',
      header: 'Recorded Quantity',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs text-gray-700">
          {val ?? row.oldQuantity ?? 0}
        </span>
      )
    },
    {
      key: 'physicalQuantity',
      header: 'Physical Count',
      render: (val, row) => (
        <span className="font-mono font-black text-xs text-indigo-700">
          {val ?? row.newQuantity ?? 0}
        </span>
      )
    },
    {
      key: 'difference',
      header: 'Difference',
      render: (val, row) => {
        const diff = val !== undefined ? val : (row.physicalQuantity || 0) - (row.recordedQuantity || 0);
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
      key: 'reason',
      header: 'Reason',
      render: (val) => (
        <span className="text-xs text-gray-500 italic">
          {val || 'Reconciliation'}
        </span>
      )
    }
  ];

  const canValidate = adjustment && !['Done', 'Canceled'].includes(adjustment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {adjustment?.adjustmentNumber || 'Adjustment Details'}
                </h2>
                {getStatusBadge(adjustment?.status)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Physical count reconciliation audit record</p>
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
        <div className="p-6 space-y-5 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loading text="Loading adjustment details..." size="md" />
            </div>
          ) : !adjustment ? (
            <div className="py-8 text-center text-xs text-gray-500">
              Adjustment records could not be retrieved.
            </div>
          ) : (
            <>
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Warehouse Facility
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {adjustment.warehouse?.name || 'Central Facility'}
                  </span>
                  {adjustment.warehouse?.code && (
                    <span className="text-[10px] font-mono text-gray-400 block">
                      ({adjustment.warehouse.code})
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Count Date
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {adjustment.adjustmentDate || adjustment.createdAt
                      ? new Date(adjustment.adjustmentDate || adjustment.createdAt).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Audited Items Count
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {adjustment.items?.length || 0} line item(s)
                  </span>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Count Lines & Discrepancies ({adjustment.items?.length || 0})
                </h3>
                <Table
                  columns={itemColumns}
                  data={adjustment.items || []}
                  keyExtractor={(row, idx) => row._id || idx}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {canValidate && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              isLoading={isValidating}
              onClick={() => onValidate(adjustment)}
            >
              Validate & Adjust Stock
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdjustmentDetailModal;
