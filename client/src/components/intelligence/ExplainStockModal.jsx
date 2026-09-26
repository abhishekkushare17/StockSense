import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ScrollText,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  ArrowRightLeft,
  Calendar,
  User,
  Clock,
  Warehouse as WarehouseIcon,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge } from '../common';
import { explainStockNumber } from '../../services/intelligenceService';

export const ExplainStockModal = ({ isOpen, onClose, productId, warehouseId = null }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchExplanation = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await explainStockNumber(productId, warehouseId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to explain stock calculation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, productId, warehouseId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Explain This Stock Number
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  Audit Traceability
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Transparent math breakdown derived from the immutable Stock Ledger.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading && (
            <div className="text-center py-12 text-xs text-gray-500 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Reconciling transaction ledger timeline...</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {!isLoading && data && (
            <div className="space-y-6">
              {/* Product Info & Why is Stock X Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                      {data.product.sku}
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900">
                      {data.product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Why is the current physical stock <strong className="text-indigo-700 text-sm">{data.currentStock} {data.product.unitOfMeasure}</strong>?
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Balance</span>
                  <span className="text-3xl font-black text-indigo-600">
                    {data.currentStock}
                  </span>
                  <span className="text-[10px] text-gray-400 block">{data.product.unitOfMeasure} verified</span>
                </div>
              </div>

              {/* Math Reconciliation Formula Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-white/10 flex items-center justify-between">
                  <span>Ledger Reconciliation Formula</span>
                  <span className="text-emerald-400">Exact Ledger Match</span>
                </div>

                <div className="space-y-1.5 py-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Starting Baseline Stock:</span>
                    <span className="font-bold">{data.explanation.startingStock}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>+ Inbound Receipts:</span>
                    <span className="font-bold">+{data.explanation.receipts}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>- Outbound Deliveries:</span>
                    <span className="font-bold">-{data.explanation.deliveries}</span>
                  </div>
                  {data.explanation.netAdjustment !== 0 && (
                    <div className="flex justify-between text-indigo-300">
                      <span>&plusmn; Physical Count Adjustments:</span>
                      <span className="font-bold">
                        {data.explanation.netAdjustment > 0 ? `+${data.explanation.netAdjustment}` : data.explanation.netAdjustment}
                      </span>
                    </div>
                  )}
                  {data.explanation.transfersIn > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>+ Transfers Inbound:</span>
                      <span className="font-bold">+{data.explanation.transfersIn}</span>
                    </div>
                  )}
                  {data.explanation.transfersOut > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>- Transfers Outbound:</span>
                      <span className="font-bold">-{data.explanation.transfersOut}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-black text-white">
                  <span>Current Physical Stock:</span>
                  <span className="text-indigo-400 text-base">{data.currentStock} {data.product.unitOfMeasure}</span>
                </div>
              </div>

              {/* Step-by-Step Ledger Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ScrollText className="w-3.5 h-3.5 text-indigo-500" />
                  Chronological Transaction Audit Trail ({data.timeline.length} movements):
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {data.timeline.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No ledger transactions on record.</p>
                  ) : (
                    data.timeline.map((event, idx) => {
                      const isPositive = event.change > 0;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  event.operation === 'RECEIPT' || event.operation === 'TRANSFER_IN'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : event.operation === 'DELIVERY' || event.operation === 'TRANSFER_OUT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {event.operation}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-gray-700">
                                #{event.referenceNumber}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 block">
                              {event.warehouseName} &bull; User: {event.userName} {event.notes ? `• ${event.notes}` : ''}
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`font-mono font-black text-sm block ${
                                isPositive ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isPositive ? `+${event.change}` : event.change}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              Bal: {event.quantityAfter}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExplainStockModal;
