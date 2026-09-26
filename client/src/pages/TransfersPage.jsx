import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, Search, Filter } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/transfers', { params });
      setTransfers(res.data?.data?.transfers || []);
    } catch (err) {
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const columns = [
    {
      key: 'transferNumber',
      header: 'Transfer #',
      render: (val) => <span className="font-mono font-bold text-xs text-indigo-700">{val}</span>,
    },
    {
      key: 'sourceWarehouse',
      header: 'Route (Origin &rarr; Destination)',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-gray-900">{val?.name || 'Main Facility'}</span>
          <span className="text-gray-400">&rarr;</span>
          <span className="font-medium text-indigo-700">{row.destinationWarehouse?.name || 'Secondary Facility'}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (val) => (
        <span className="text-xs font-semibold text-gray-700">
          {Array.isArray(val) ? val.length : 0} items
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'createdAt',
      header: 'Created',
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
            <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            Internal Transfers
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Inter-warehouse stock movements with dual-entry audit logging.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-700">Status:</span>
          {['', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'].map((st) => (
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
          <Loading text="Loading transfers..." size="lg" />
        </div>
      ) : transfers.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={transfers} />
        </div>
      ) : (
        <EmptyState
          title="No Internal Transfers"
          message="No transfers found matching your status filter."
          actionText="Clear Filter"
          onAction={() => setStatusFilter('')}
        />
      )}
    </div>
  );
};

export default TransfersPage;
