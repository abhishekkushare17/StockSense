import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, Search, Filter } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const AdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdjustments();
  }, [statusFilter]);

  const fetchAdjustments = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/adjustments', { params });
      setAdjustments(res.data?.data?.adjustments || []);
    } catch (err) {
      setAdjustments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'adjustmentNumber',
      header: 'Adjustment #',
      render: (val) => <span className="font-mono font-bold text-xs text-indigo-700">{val}</span>,
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (val) => <span className="text-xs font-semibold text-gray-800">{val?.name || 'Central Hub'}</span>,
    },
    {
      key: 'items',
      header: 'Items Counted',
      render: (val) => (
        <span className="text-xs font-medium text-gray-700">
          {Array.isArray(val) ? val.length : 0} lines
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Reconciliation State',
      render: (val) => (
        <Badge variant={val === 'Done' ? 'success' : 'neutral'} dot size="sm">
          {val || 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Counted',
      render: (val) => (
        <span className="text-xs text-gray-500">
          {val ? new Date(val).toLocaleDateString() : 'Today'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-indigo-600" />
            Inventory Adjustments
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Physical cycle count reconciliation against system records with audit tracking.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Status:</span>
          {['', 'Draft', 'Done'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading adjustments..." size="lg" />
        </div>
      ) : adjustments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={adjustments} />
        </div>
      ) : (
        <EmptyState
          title="No Adjustments Recorded"
          message="No stock adjustments found for this filter."
          actionText="Clear Filter"
          onAction={() => setStatusFilter('')}
        />
      )}
    </div>
  );
};

export default AdjustmentsPage;
