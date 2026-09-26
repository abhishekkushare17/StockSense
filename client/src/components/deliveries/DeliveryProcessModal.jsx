import React from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  PackageCheck,
  ClipboardList,
  Layers,
  ArrowRight,
  Warehouse,
  AlertTriangle
} from 'lucide-react';
import { Badge, Button, Table, Loading } from '../common';

export const DeliveryProcessModal = ({
  isOpen,
  onClose,
  delivery,
  onStatusUpdate,
  onValidate,
  isActionLoading = false
}) => {
  if (!isOpen || !delivery) return null;

  const currentStatus = delivery.status || 'Draft';

  const getStepStatus = (stepName) => {
    const steps = ['Draft', 'Waiting', 'Ready', 'Done'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(stepName);

    if (currentStatus === 'Canceled') return 'canceled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const itemColumns = [
    {
      key: 'product',
      header: 'Product Item',
      render: (val, row) => (
        <div>
          <span className="font-bold text-xs text-gray-900 block">
            {row.product?.name || 'Unnamed Item'}
          </span>
          <span className="text-[11px] font-mono text-gray-500">
            SKU: {row.product?.sku || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity to Deliver',
      render: (val, row) => (
        <span className="font-mono font-black text-xs text-purple-700">
          {val || row.quantityDelivered || 0} {row.product?.unitOfMeasure || 'units'}
        </span>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  {delivery.deliveryNumber}
                </h2>
                <Badge
                  variant={
                    currentStatus === 'Done'
                      ? 'success'
                      : currentStatus === 'Ready'
                      ? 'purple'
                      : currentStatus === 'Waiting'
                      ? 'warning'
                      : currentStatus === 'Canceled'
                      ? 'danger'
                      : 'neutral'
                  }
                  size="sm"
                  dot
                >
                  {currentStatus}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Outbound order fulfillment workflow (Pick &rarr; Pack &rarr; Validate)
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

        {/* Stepper Progress Bar */}
        <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {/* Step 1: Draft */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  getStepStatus('Draft') === 'completed' || getStepStatus('Draft') === 'current'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-semibold mt-1 text-gray-700">Order Draft</span>
            </div>

            <div className="h-0.5 flex-1 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all ${
                  ['Waiting', 'Ready', 'Done'].includes(currentStatus) ? 'bg-indigo-600' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Step 2: Pick */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  getStepStatus('Waiting') === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : getStepStatus('Waiting') === 'current'
                    ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-semibold mt-1 text-gray-700">Pick (Picking)</span>
            </div>

            <div className="h-0.5 flex-1 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all ${
                  ['Ready', 'Done'].includes(currentStatus) ? 'bg-indigo-600' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Step 3: Pack */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  getStepStatus('Ready') === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : getStepStatus('Ready') === 'current'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-semibold mt-1 text-gray-700">Pack (Packed)</span>
            </div>

            <div className="h-0.5 flex-1 bg-gray-200 mx-2">
              <div
                className={`h-full transition-all ${
                  currentStatus === 'Done' ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            </div>

            {/* Step 4: Validate */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStatus === 'Done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                4
              </div>
              <span className="text-[11px] font-semibold mt-1 text-gray-700">Validate (Done)</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[calc(85vh-12rem)] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Customer / Reference
              </span>
              <span className="text-xs font-bold text-gray-900">
                {delivery.customer || delivery.customerName || 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Source Warehouse
              </span>
              <span className="text-xs font-bold text-gray-900">
                {delivery.warehouse?.name || 'Central Facility'}
              </span>
              {delivery.warehouse?.code && (
                <span className="text-[10px] font-mono text-gray-400 block">
                  ({delivery.warehouse.code})
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Order Date
              </span>
              <span className="text-xs font-bold text-gray-900">
                {delivery.deliveryDate || delivery.createdAt
                  ? new Date(delivery.deliveryDate || delivery.createdAt).toLocaleDateString()
                  : 'Today'}
              </span>
            </div>
          </div>

          {delivery.notes && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Dispatch Notes: </span>
              {delivery.notes}
            </div>
          )}

          {/* Items Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-purple-600" />
              Delivery Line Items ({delivery.items?.length || 0})
            </h3>
            <Table
              columns={itemColumns}
              data={delivery.items || []}
              keyExtractor={(row, idx) => row._id || idx}
            />
          </div>
        </div>

        {/* Process Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isActionLoading}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {/* Action 1: If Draft -> Start Picking */}
            {currentStatus === 'Draft' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isActionLoading}
                onClick={() => onStatusUpdate(delivery, 'Waiting')}
              >
                Start Picking (Pick)
              </Button>
            )}

            {/* Action 2: If Waiting -> Complete Packing */}
            {currentStatus === 'Waiting' && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isActionLoading}
                onClick={() => onStatusUpdate(delivery, 'Ready')}
              >
                Complete Packing (Pack)
              </Button>
            )}

            {/* Action 3: If Ready -> Validate & Ship */}
            {currentStatus === 'Ready' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                isLoading={isActionLoading}
                onClick={() => onValidate(delivery)}
              >
                Validate & Decrease Stock
              </Button>
            )}

            {currentStatus === 'Done' && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Order Fulfilled & Stock Deducted
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProcessModal;
