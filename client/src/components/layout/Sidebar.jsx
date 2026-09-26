import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ClipboardList,
  Truck,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Settings,
  User,
  LogOut,
  ChevronDown,
  X,
  Shield,
  BarChart2,
  FileSpreadsheet,
  ScrollText,
  QrCode,
  ShieldAlert,
  TrendingDown,
  Radar
} from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { Logo } from '../common';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Keep Operations group open if current route is within operations
  const isOperationsActive = [
    '/receipts',
    '/deliveries',
    '/transfers',
    '/adjustments',
    '/move-history'
  ].some((path) => location.pathname.startsWith(path));

  const [operationsOpen, setOperationsOpen] = useState(true);

  // Close sidebar on route change on mobile
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/35 border border-purple-400/40 font-bold'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-purple-500/20 text-purple-200 font-semibold border-l-2 border-purple-400 shadow-sm shadow-purple-900/40'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#0B0F17] border-r border-purple-500/15 w-64 select-none relative overflow-hidden text-slate-200">
      {/* Ambient Purple Light Blooms */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-16 w-44 h-44 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10">
        <div className="h-16 flex items-center justify-between px-5 border-b border-purple-500/15 bg-slate-950/40 backdrop-blur-md">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size="md" subtitle="Inventory OS" lightText={true} />
          </NavLink>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] [scrollbar-width:thin] [scrollbar-color:#3b2d54_transparent] hover:[scrollbar-color:#6b21a8_transparent]">
          {/* Main Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overview
            </p>
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/products" className={navItemClass}>
              <Package className="w-4 h-4 shrink-0" />
              <span>Products</span>
            </NavLink>
            <NavLink to="/categories" className={navItemClass}>
              <Layers className="w-4 h-4 shrink-0" />
              <span>Categories</span>
            </NavLink>
            <NavLink to="/warehouse" className={navItemClass}>
              <Warehouse className="w-4 h-4 shrink-0" />
              <span>Warehouse</span>
            </NavLink>
            <NavLink to="/stock" className={navItemClass}>
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Stock Levels</span>
            </NavLink>
            <NavLink to="/scanner" className={navItemClass}>
              <QrCode className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Barcode Scanner</span>
            </NavLink>
          </div>

          {/* Operations Group (Expandable) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              <span>Operations</span>
              <button
                type="button"
                onClick={() => setOperationsOpen(!operationsOpen)}
                className="text-slate-400 hover:text-white"
                aria-label="Toggle operations menu"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    operationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {operationsOpen && (
              <div className="space-y-1 pl-2 border-l border-purple-500/20 ml-3">
                <NavLink to="/receipts" className={subNavItemClass}>
                  <ClipboardList className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Receipts</span>
                </NavLink>
                <NavLink to="/deliveries" className={subNavItemClass}>
                  <Truck className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span>Deliveries</span>
                </NavLink>
                <NavLink to="/transfers" className={subNavItemClass}>
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Internal Transfers</span>
                </NavLink>
                <NavLink to="/adjustments" className={subNavItemClass}>
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span>Adjustments</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* StockSense Intelligence Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center justify-between">
              <span>Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400 animate-pulse" />
            </p>
            <NavLink to="/forecast" className={navItemClass}>
              <TrendingDown className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Stock Forecast</span>
            </NavLink>
            <NavLink to="/risk-radar" className={navItemClass}>
              <Radar className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Risk Radar</span>
            </NavLink>
            <NavLink to="/anomalies" className={navItemClass}>
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Anomalies</span>
            </NavLink>
            <NavLink to="/simulator" className={navItemClass}>
              <Layers className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>What-If Simulator</span>
            </NavLink>
          </div>

          {/* Intelligence & Audit Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Auditing & Reports
            </p>
            <NavLink to="/move-history" className={navItemClass}>
              <ScrollText className="w-4 h-4 shrink-0" />
              <span>Stock Ledger</span>
            </NavLink>
            <NavLink to="/analytics" className={navItemClass}>
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/reports" className={navItemClass}>
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/audit-logs" className={navItemClass}>
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Audit Log</span>
            </NavLink>
          </div>

          {/* System & Profile Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              System
            </p>
            <NavLink to="/settings" className={navItemClass}>
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </NavLink>
            <NavLink to="/profile" className={navItemClass}>
              <User className="w-4 h-4 shrink-0" />
              <span>My Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* User Footer Card & Logout */}
      <div className="p-3 border-t border-purple-500/15 bg-slate-950/60 backdrop-blur-md relative z-10">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/20 shadow-lg shadow-black/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-500/30 shrink-0">
              {(user?.name || 'U')[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate leading-tight">
                {user?.name || 'Staff User'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-medium text-purple-300/80 truncate">
                  {user?.role || 'Staff'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer with Backdrop Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
