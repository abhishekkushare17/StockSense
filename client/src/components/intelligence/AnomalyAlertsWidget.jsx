import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  ScrollText,
  Clock,
  Check,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Button, Badge } from '../common';
import { reviewAnomaly } from '../../services/intelligenceService';

export const AnomalyAlertsWidget = ({ anomalies = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState('OPEN');
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const openList = anomalies.filter((a) => a.status === 'OPEN');
  const reviewedList = anomalies.filter((a) => a.status !== 'OPEN');

  const displayedList = activeTab === 'OPEN' ? openList : reviewedList;

  const handleMarkReviewed = async (anomalyId) => {
    try {
      setProcessingId(anomalyId);
      await reviewAnomaly(anomalyId, {
        status: 'REVIEWED',
        reviewNotes: 'Reviewed and confirmed by inventory manager'
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to review anomaly');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              Inventory Anomaly Detection
            </h3>
            <p className="text-xs text-gray-500">
              Rule-based statistical movement spikes and abnormal adjustments
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            type="button"
            onClick={() => setActiveTab('OPEN')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'OPEN'
                ? 'bg-white text-amber-700 shadow-2xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Active Alerts ({openList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVIEWED')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'REVIEWED'
                ? 'bg-white text-gray-800 shadow-2xs font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Resolved History ({reviewedList.length})
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-800">
              {activeTab === 'OPEN' ? 'No Active Anomalies Detected' : 'No Resolved Anomalies'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              All warehouse transactions are conforming to standard statistical variance.
            </p>
          </div>
        ) : (
          displayedList.map((anom) => (
            <div
              key={anom._id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                anom.status === 'OPEN'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-gray-200 bg-gray-50/40 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 mt-0.5 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        ANOMALY DETECTED
                      </span>
                      <Badge
                        variant={anom.severity === 'CRITICAL' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {anom.type.replace('_', ' ')}
                      </Badge>
                      {anom.status === 'REVIEWED' && (
                        <Badge variant="success" size="sm">Reviewed</Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mt-1">
                      Product: {anom.product?.name || 'Product'} {anom.product?.sku ? `(${anom.product.sku})` : ''}
                    </h4>
                    <p className="text-xs text-gray-600">
                      Warehouse: <span className="font-semibold text-gray-800">{anom.warehouse?.name || 'Central Facility'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Recorded Variance
                  </span>
                  <span className="text-sm font-mono font-black text-rose-600">
                    {anom.detectedValue}
                  </span>
                </div>
              </div>

              {/* Normal vs Detected Metric Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-amber-100">
                <div>
                  <span className="text-gray-400 font-medium block text-[10px] uppercase">Normal Baseline:</span>
                  <span className="font-semibold text-gray-700">{anom.normalBaseline}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block text-[10px] uppercase">Reason:</span>
                  <span className="font-semibold text-rose-700">{anom.reason}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">
                  Detected {new Date(anom.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ScrollText}
                    onClick={() => navigate('/move-history')}
                  >
                    View Ledger
                  </Button>
                  {anom.status === 'OPEN' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      isLoading={processingId === anom._id}
                      onClick={() => handleMarkReviewed(anom._id)}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnomalyAlertsWidget;
