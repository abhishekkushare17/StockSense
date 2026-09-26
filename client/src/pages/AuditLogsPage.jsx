import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge, Modal } from '../components/common';
import { auditLogService } from '../services/auditLogService';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Inspector modal state
  const [activeLog, setActiveLog] = useState(null);

  useEffect(() => {
    loadAuditLogs(1);
  }, [selectedModule, selectedAction, startDate, endDate]);

  const loadAuditLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 15,
        search: searchQuery.trim() || undefined,
        module: selectedModule || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const data = await auditLogService.getAuditLogs(params);
      setLogs(data.logs || []);
      setPagination(data.pagination || { page, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAuditLogs(1);
  };

  const resetFilters = () => {
    setSelectedModule('');
    setSelectedAction('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    loadAuditLogs(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            System Audit Log & Compliance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Immutable tracking of user activities, data modifications, and operational transactions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadAuditLogs(pagination.page)}
          isLoading={isLoading}
          icon={RefreshCw}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search actions or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">All System Modules</option>
            <option value="Auth">Auth & Security</option>
            <option value="Products">Products</option>
            <option value="Receipts">Receipts</option>
            <option value="Deliveries">Deliveries</option>
            <option value="Transfers">Internal Transfers</option>
            <option value="Adjustments">Stock Adjustments</option>
            <option value="Warehouses">Warehouses</option>
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">All Action Types</option>
            <option value="Login">Login</option>
            <option value="Product Created">Product Created</option>
            <option value="Product Updated">Product Updated</option>
            <option value="Product Deleted">Product Deleted</option>
            <option value="Receipt Created">Receipt Created</option>
            <option value="Receipt Validated">Receipt Validated</option>
            <option value="Delivery Created">Delivery Created</option>
            <option value="Delivery Validated">Delivery Validated</option>
            <option value="Transfer Created">Transfer Created</option>
            <option value="Adjustment Created">Adjustment Created</option>
            <option value="Warehouse Updated">Warehouse Updated</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </form>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Found {pagination.total} audit events</span>
          <button
            type="button"
            onClick={resetFilters}
            className="font-medium text-indigo-600 hover:text-indigo-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record ID / Ref</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {log.user?.name || 'System Auto'}
                      {log.user?.role && (
                        <span className="block text-[10px] font-normal text-gray-400">
                          {log.user.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="indigo" size="sm">
                        {log.module}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                      {log.recordId || log.entityId || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setActiveLog(log)}
                        className="py-1 px-2 text-xs"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => loadAuditLogs(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadAuditLogs(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Detail Inspector Modal */}
      {activeLog && (
        <Modal
          isOpen={!!activeLog}
          onClose={() => setActiveLog(null)}
          title={`Audit Record: ${activeLog.action}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">User</span>
                <span className="font-bold text-gray-900">{activeLog.user?.name || 'System Operator'}</span>
                <span className="text-gray-500 block text-[11px]">{activeLog.user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Timestamp</span>
                <span className="font-semibold text-gray-900">{new Date(activeLog.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Module</span>
                <span className="font-bold text-indigo-600">{activeLog.module}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Record ID</span>
                <span className="font-mono text-gray-800">{activeLog.recordId || 'N/A'}</span>
              </div>
            </div>

            {activeLog.newValue && (
              <div>
                <span className="font-semibold text-gray-700 block mb-1">State Mutation Data:</span>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(activeLog.newValue, null, 2)}
                </pre>
              </div>
            )}

            {activeLog.details && Object.keys(activeLog.details).length > 0 && (
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Context Details:</span>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(activeLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setActiveLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsPage;
