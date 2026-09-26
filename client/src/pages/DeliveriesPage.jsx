import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter } from 'lucide-react';
import { Badge, Button, Table, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/deliveries', { params });
      setDeliveries(res.data?.data?.deliveries || []);
    } catch (err) {
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <Badge variant="success" dot size="sm">Done</Badge>;
      case 'Ready':
        return <Badge variant="purple" dot size="sm">Ready (Packed)</Badge>;
      case 'Waiting':
        return <Badge variant="warning" dot size="sm">Waiting (Picking)</Badge>;
      case 'Canceled':
        return <Badge variant="danger" dot size="sm">Canceled</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">{status || 'Draft'}</Badge>;
    }
  };

  const columns = [
    {
      key: 'deliveryNumber',
      header: 'Delivery Order #',
      render: (val) => <span className="font-mono font-bold text-xs text-indigo-700">{val}</span>,
    },
    {
      key: 'customer',
      header: 'Customer Destination',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{val || row.customerName || 'N/A'}</span>
          <span className="text-[11px] text-gray-500">Source: {row.warehouse?.name || 'Central Hub'}</span>
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
      header: 'Fulfillment State',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'createdAt',
      header: 'Date',
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
            <Truck className="w-6 h-6 text-purple-600" />
            Outbound Delivery Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pick &rarr; Pack &rarr; Validate workflow with strict negative-stock guards.
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
          <Loading text="Loading delivery orders..." size="lg" />
        </div>
      ) : deliveries.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <Table columns={columns} data={deliveries} />
        </div>
      ) : (
        <EmptyState
          title="No Deliveries Found"
          message="No outbound delivery orders found for this status."
          actionText="Clear Filter"
          onAction={() => setStatusFilter('')}
        />
      )}
    </div>
  );
};

export default DeliveriesPage;
