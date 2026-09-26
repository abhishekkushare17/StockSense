import React from 'react';
import {
  X,
  ArrowRightLeft,
  ArrowDown,
  Warehouse,
  Package,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Badge, Button, Table, Loading } from '../common';

export const TransferDetailModal = ({
  isOpen,
  onClose,
  transfer,
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
      key: 'quantity',
      header: 'Transfer Quantity',
      render: (val, row) => (
        <span className="font-mono font-black text-xs text-amber-700">
          {val || 0} {row.product?.unitOfMeasure || 'units'}
        </span>
      )
    }
  ];

  const canValidate = transfer && !['Done', 'Canceled'].includes(transfer.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {transfer?.transferNumber || 'Transfer Details'}
                </h2>
                {getStatusBadge(transfer?.status)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Inter-facility relocation audit log</p>
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
              <Loading text="Loading transfer details..." size="md" />
            </div>
          ) : !transfer ? (
            <div className="py-8 text-center text-xs text-gray-500">
              Transfer records could not be retrieved.
            </div>
          ) : (
            <>
              {/* Route Card: Example Main Warehouse ↓ Production Rack */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-3">
                  Transfer Movement Flow
                </span>

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-full p-3 bg-white rounded-xl border border-amber-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Source Facility (Stock Decrement)
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {transfer.sourceWarehouse?.name || 'Origin Hub'}
                      </span>
                    </div>
                    {transfer.sourceWarehouse?.code && (
                      <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {transfer.sourceWarehouse.code}
                      </span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center">
                    <ArrowDown className="w-4 h-4" />
                  </div>

                  <div className="w-full p-3 bg-white rounded-xl border border-amber-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Destination Facility (Stock Increment)
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {transfer.destinationWarehouse?.name || 'Target Rack'}
                      </span>
                    </div>
                    {transfer.destinationWarehouse?.code && (
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {transfer.destinationWarehouse.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {transfer.notes && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Reason / Notes: </span>
                  {transfer.notes}
                </div>
              )}

              {/* Items Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  Transfer Items ({transfer.items?.length || 0})
                </h3>
                <Table
                  columns={itemColumns}
                  data={transfer.items || []}
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
              onClick={() => onValidate(transfer)}
            >
              Validate Transfer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferDetailModal;
