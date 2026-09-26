import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  PackagePlus,
  CheckCircle2,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { Badge, Button } from '../common';
import { getSmartReorderRecommendations } from '../../services/dashboardService';

export const SmartReorderWidget = ({ initialData = null }) => {
  const [recommendations, setRecommendations] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialData) {
      loadRecommendations();
    } else {
      setRecommendations(initialData);
    }
  }, [initialData]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await getSmartReorderRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load smart reorder recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Smart Reorder Recommendations
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                Rule-Based Algorithm
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Deterministic reorder calculations based on consumption velocity and safety buffer
            </p>
          </div>
        </div>

        <Link
          to="/products?lowStock=true"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          View Low Stock SKUs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{rec.productName}</h4>
                      <p className="text-[11px] text-gray-500 font-mono">
                        SKU: {rec.sku} &bull; {rec.category}
                      </p>
                    </div>
                    <Badge
                      variant={
                        rec.urgency === 'CRITICAL'
                          ? 'danger'
                          : rec.urgency === 'HIGH'
                          ? 'warning'
                          : 'purple'
                      }
                      size="sm"
                    >
                      {rec.urgency}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-gray-100 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Current</span>
                      <span className={`font-bold ${rec.currentStock === 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                        {rec.currentStock} {rec.unitOfMeasure}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Reorder Lvl</span>
                      <span className="font-semibold text-gray-700">{rec.reorderLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Est. Usage</span>
                      <span className="font-semibold text-gray-700">{rec.averageUsage}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/50 text-[11px] text-amber-900 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{rec.reason}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-xs">
                    <span className="text-gray-400">Recommended Order:</span>{' '}
                    <span className="font-black text-indigo-600">
                      +{rec.recommendedQuantity} {rec.unitOfMeasure}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={PackagePlus}
                    onClick={() => navigate('/receipts')}
                    className="text-xs py-1 px-2.5"
                  >
                    Receive Stock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-gray-800 text-sm">All Stock Levels Healthy</p>
            <p className="text-gray-400 mt-1 max-w-sm mx-auto">
              No products currently breach safety replenishment criteria. Stock buffers are balanced across facilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartReorderWidget;
