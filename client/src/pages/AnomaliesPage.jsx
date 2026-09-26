import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ScrollText,
  Check,
  Search,
  Filter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Button, Badge } from '../components/common';
import { getAnomalies, reviewAnomaly } from '../services/intelligenceService';
import { useNavigate } from 'react-router-dom';

export const AnomaliesPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();

  const fetchAnomalies = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getAnomalies(activeTab);
      setAnomalies(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory anomalies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [activeTab]);

  const handleReview = async (id, status) => {
    try {
      setProcessingId(id);
      await reviewAnomaly(id, {
        status,
        reviewNotes: 'Reviewed and processed via Anomaly Management'
      });
      fetchAnomalies();
    } catch (err) {
      alert(err.message || 'Failed to update anomaly status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Inventory Anomaly Detection
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Statistical monitoring detecting unusual transaction spikes, excessive physical count adjustments, and erratic warehouse velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAnomalies}
            isLoading={isLoading}
          >
            Scan for Anomalies
          </Button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Anomalies
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OPEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OPEN'
                ? 'bg-amber-50 text-amber-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Active Alerts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVIEWED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REVIEWED'
                ? 'bg-emerald-50 text-emerald-800 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Resolved History
          </button>
        </div>

        <span className="text-xs text-gray-400 font-medium px-3">
          Rule-based statistical heuristics
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Anomalies List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing warehouse movement patterns...
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200 space-y-1">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Inventory Anomalies Found</h3>
            <p className="text-gray-400">All warehouse operations and physical ledger changes conform to standard baselines.</p>
          </div>
        ) : (
          anomalies.map((anom) => (
            <div
              key={anom._id}
              className={`p-5 rounded-2xl border transition-all space-y-4 bg-white shadow-2xs ${
                anom.status === 'OPEN' ? 'border-amber-200' : 'border-gray-200 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    anom.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {anom.product?.sku || 'SKU'}
                      </span>
                      <Badge variant={anom.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                        {anom.type.replace('_', ' ')}
                      </Badge>
                      {anom.status === 'REVIEWED' && (
                        <Badge variant="success">Reviewed</Badge>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 mt-1">
                      {anom.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Warehouse: <strong className="text-gray-700">{anom.warehouse?.name || 'Central Distribution Hub'}</strong> &bull; Product: <strong className="text-gray-700">{anom.product?.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Recorded Variance
                  </span>
                  <span className="text-base font-mono font-black text-rose-600">
                    {anom.detectedValue}
                  </span>
                </div>
              </div>

              {/* Baseline vs Actual Explanation */}
              <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Normal Baseline:</span>
                    <span className="font-semibold text-gray-800">{anom.normalBaseline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Anomaly Reason:</span>
                    <span className="font-semibold text-rose-700">{anom.reason}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs border-t border-amber-100 pt-2 leading-relaxed">
                  {anom.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Detected on {new Date(anom.createdAt).toLocaleString()}
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
                      onClick={() => handleReview(anom._id, 'REVIEWED')}
                    >
                      Acknowledge & Mark Reviewed
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

export default AnomaliesPage;
