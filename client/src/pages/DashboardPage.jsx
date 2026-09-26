import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Badge, Button, Modal, ConfirmDialog, Table } from '../components/common';
import {
  Boxes,
  Database,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { ROLES } from '../utils/constants';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;

  // Demo table data to verify common Table component works
  const sampleModules = [
    {
      _id: 'mod-1',
      name: 'Authentication & Session',
      lead: 'Lead Architecture',
      status: 'Ready (Integrated)',
      badgeVariant: 'success',
    },
    {
      _id: 'mod-2',
      name: 'Products & Categories',
      lead: 'Catalog Team Member',
      status: 'Ready to Plug In',
      badgeVariant: 'info',
    },
    {
      _id: 'mod-3',
      name: 'Inbound Receipts',
      lead: 'Receiving Team Member',
      status: 'Ready to Plug In',
      badgeVariant: 'info',
    },
    {
      _id: 'mod-4',
      name: 'Outbound Deliveries',
      lead: 'Shipping Team Member',
      status: 'Ready to Plug In',
      badgeVariant: 'info',
    },
    {
      _id: 'mod-5',
      name: 'Transfers & Adjustments',
      lead: 'Operations Team Member',
      status: 'Ready to Plug In',
      badgeVariant: 'info',
    },
  ];

  const tableColumns = [
    {
      key: 'name',
      header: 'Subsystem / Module',
      render: (val) => <span className="font-semibold text-gray-900">{val}</span>,
    },
    { key: 'lead', header: 'Owner / Assignee' },
    {
      key: 'status',
      header: 'Integration Status',
      render: (val, row) => (
        <Badge variant={row.badgeVariant} dot>
          {val}
        </Badge>
      ),
    },
  ];

  const handleConfirmDemo = () => {
    setIsConfirmOpen(false);
    setActionNotice('Action confirmed! The ConfirmDialog and Modal components executed cleanly.');
    setTimeout(() => setActionNotice(''), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/40 text-indigo-100 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Core Architecture Initialized
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            You are signed in as an{' '}
            <span className="font-semibold text-white underline underline-offset-2">
              {user?.role}
            </span>
            . The StockSense core architecture, database foundations, and authentication
            middleware are active and ready for modular team integration.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Boxes className="w-64 h-64 text-white" />
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* System Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Core Backend API
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">Standardized</div>
          <div className="text-xs text-gray-500 mt-1">CORS, JWT & Error Handlers</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              MongoDB Models
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">10 Prepared</div>
          <div className="text-xs text-gray-500 mt-1">Clean schema definitions ready</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Role Access Control
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">RBAC Active</div>
          <div className="text-xs text-gray-500 mt-1">Manager & Staff Permissions</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              UI Design System
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">9 Components</div>
          <div className="text-xs text-gray-500 mt-1">Reusable Tailwind primitives</div>
        </div>
      </div>

      {/* Modular Integration Slots for other developers */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Modular Integration Surface
            </h2>
            <p className="text-sm text-gray-500">
              Team members can mount their specific modules directly into these prepared architecture slots.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDemoModalOpen(true)}
            >
              Test Modal UI
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
            >
              Test ConfirmDialog UI
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Products Slot */}
          <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Products & Catalog</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Product SKU master data, categorization, and threshold alarms.
            </p>
            <Badge variant="neutral" size="sm">Slot: /products</Badge>
          </div>

          {/* Receipts Slot */}
          <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Inbound Receipts</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Supplier purchase orders, inbound goods inspection, and stock increments.
            </p>
            <Badge variant="neutral" size="sm">Slot: /receipts</Badge>
          </div>

          {/* Deliveries Slot */}
          <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Outbound Deliveries</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Customer order fulfillment, picking/packing verification, and dispatch.
            </p>
            <Badge variant="neutral" size="sm">Slot: /deliveries</Badge>
          </div>

          {/* Transfers & Adjustments Slot */}
          <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Transfers & Adjustments</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Inter-warehouse movements, manual cycle counts, and reconciliation ledger.
            </p>
            <Badge variant="neutral" size="sm">Slot: /transfers</Badge>
          </div>
        </div>
      </div>

      {/* Reusable Table Component Integration Demo */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">
          Subsystem Readiness Matrix
        </h2>
        <Table columns={tableColumns} data={sampleModules} />
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Reusable Modal Component"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsDemoModalOpen(false)}>
            Close Preview
          </Button>
        }
      >
        <p className="text-gray-600">
          This is the common StockSense modal dialog component. It features smooth backdrop dismissal,
          ESC key detection, and accessible focus isolation. Other developers can import this directly:
        </p>
        <pre className="mt-3 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-x-auto">
          {"import { Modal, Button } from '../components/common';"}
        </pre>
      </Modal>

      {/* Demo ConfirmDialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDemo}
        title="Confirm Test Action"
        message="This is a test of the reusable ConfirmDialog component. Confirming will close this modal and flash a success banner."
        confirmText="Proceed"
        variant="primary"
      />
    </div>
  );
};

export default DashboardPage;
