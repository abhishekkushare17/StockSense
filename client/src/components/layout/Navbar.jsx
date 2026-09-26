import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge, Logo } from '../common';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Warehouse,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ExternalLink,
  ArrowRightLeft,
  Truck,
  Package,
  Layers,
  X,
  Loader2,
  BarChart2,
  Sun,
  Moon,
  QrCode
} from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { searchGlobal } from '../../services/dashboardService';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Dropdown states
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notificationCategory, setNotificationCategory] = useState('ALL');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Load notifications
  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await searchGlobal(searchQuery.trim());
        setSearchResults(data);
        setSearchDropdownOpen(true);
      } catch (err) {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchDropdownOpen(false);
  };

  const handleNavigateAndClose = (url) => {
    clearSearch();
    setNotificationDropdownOpen(false);
    navigate(url);
  };

  const markAllNotificationsRead = () => {
    setUnreadCount(0);
  };

  const isInventoryManager = user?.role === ROLES.INVENTORY_MANAGER;
  const userInitials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    if (notificationCategory === 'ALL') return true;
    if (notificationCategory === 'STOCK') return item.type === 'LOW_STOCK' || item.type === 'OUT_OF_STOCK';
    if (notificationCategory === 'RECEIPTS') return item.type === 'RECEIPT_PENDING';
    if (notificationCategory === 'DELIVERIES') return item.type === 'DELIVERY_PENDING';
    if (notificationCategory === 'TRANSFERS') return item.type === 'TRANSFER_UPDATE';
    return true;
  });

  const hasSearchResults =
    searchResults &&
    (searchResults.products?.length > 0 ||
      searchResults.receipts?.length > 0 ||
      searchResults.deliveries?.length > 0 ||
      searchResults.transfers?.length > 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Global Search */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-lg">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Logo */}
          <Link to="/dashboard" className="lg:hidden shrink-0 flex items-center" aria-label="StockSense Home">
            <Logo size="sm" showText={false} />
          </Link>

          {/* Global Search with Live Dropdown */}
          <div className="relative w-full max-w-sm sm:max-w-md" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, SKU, receipts, deliveries, transfers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setSearchDropdownOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin absolute right-3 pointer-events-none" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Global Search Dropdown Results */}
            {searchDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full sm:w-[480px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 max-h-[460px] overflow-y-auto animate-fadeIn divide-y divide-gray-100">
                <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Search Results</span>
                  <span>Press Esc to close</span>
                </div>

                {!hasSearchResults && !isSearching && (
                  <div className="p-6 text-center text-xs text-gray-500">
                    <p className="font-medium text-gray-700">No matching records found</p>
                    <p className="text-gray-400 mt-1">Try searching by SKU, product name, transfer code, or receipt number.</p>
                  </div>
                )}

                {/* Products Group */}
                {searchResults?.products?.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Boxes className="w-3 h-3 text-indigo-500" /> Products ({searchResults.products.length})
                    </div>
                    {searchResults.products.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => handleNavigateAndClose('/products')}
                        className="w-full px-4 py-2 text-left hover:bg-indigo-50/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            SKU: <span className="font-mono text-gray-700">{p.sku}</span> &bull; {p.category?.name || 'General'}
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          Reorder: {p.reorderLevel ?? 10}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Receipts Group */}
                {searchResults?.receipts?.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-blue-500" /> Inbound Receipts ({searchResults.receipts.length})
                    </div>
                    {searchResults.receipts.map((r) => (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => handleNavigateAndClose('/receipts')}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 font-mono">
                            {r.receiptNumber}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Supplier: {r.supplier || 'N/A'}
                          </p>
                        </div>
                        <Badge variant={r.status === 'Done' ? 'success' : 'info'} size="sm">
                          {r.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Deliveries Group */}
                {searchResults?.deliveries?.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-purple-500" /> Deliveries ({searchResults.deliveries.length})
                    </div>
                    {searchResults.deliveries.map((d) => (
                      <button
                        key={d._id}
                        type="button"
                        onClick={() => handleNavigateAndClose('/deliveries')}
                        className="w-full px-4 py-2 text-left hover:bg-purple-50/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-purple-600 font-mono">
                            {d.deliveryNumber}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Customer: {d.customer || 'Direct'}
                          </p>
                        </div>
                        <Badge variant={d.status === 'Done' ? 'success' : 'purple'} size="sm">
                          {d.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {/* Transfers Group */}
                {searchResults?.transfers?.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3 h-3 text-amber-500" /> Transfers ({searchResults.transfers.length})
                    </div>
                    {searchResults.transfers.map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => handleNavigateAndClose('/transfers')}
                        className="w-full px-4 py-2 text-left hover:bg-amber-50/50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-amber-600 font-mono">
                            {t.transferNumber}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Transfer operation
                          </p>
                        </div>
                        <Badge variant={t.status === 'Done' ? 'success' : 'warning'} size="sm">
                          {t.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Facility, Scanner, Theme, Notifications & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Active Facility Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl text-xs font-medium text-gray-600 border border-gray-200/80">
            <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
            <span>Facility:</span>
            <span className="text-gray-900 font-semibold">Central Hub</span>
          </div>

          {/* Quick Scanner Shortcut */}
          <Link
            to="/scanner"
            title="Scan Barcode / QR Code"
            className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </Link>

          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle color theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-fadeIn">
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Inventory Alerts
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="danger" size="sm">
                        {unreadCount} Action Required
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Clear Badge
                    </button>
                  )}
                </div>

                {/* Categories Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto text-[11px] font-medium text-gray-500">
                  <button
                    type="button"
                    onClick={() => setNotificationCategory('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${notificationCategory === 'ALL' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationCategory('STOCK')}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${notificationCategory === 'STOCK' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    Stock Alerts
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationCategory('RECEIPTS')}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${notificationCategory === 'RECEIPTS' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    Receipts
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationCategory('DELIVERIES')}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${notificationCategory === 'DELIVERIES' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    Deliveries
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationCategory('TRANSFERS')}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${notificationCategory === 'TRANSFERS' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    Transfers
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigateAndClose(item.link || '/products')}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            item.severity === 'danger'
                              ? 'bg-rose-50 text-rose-600'
                              : item.severity === 'warning'
                              ? 'bg-amber-50 text-amber-600'
                              : item.severity === 'purple'
                              ? 'bg-purple-50 text-purple-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {item.type === 'OUT_OF_STOCK' || item.type === 'LOW_STOCK' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : item.type === 'RECEIPT_PENDING' ? (
                            <Package className="w-4 h-4" />
                          ) : item.type === 'DELIVERY_PENDING' ? (
                            <Truck className="w-4 h-4" />
                          ) : (
                            <ArrowRightLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-gray-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="font-medium text-gray-700">No alerts in this category</p>
                      <p className="text-gray-400 mt-0.5">All tracked metrics are operating within parameters.</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
                  <Link
                    to="/products"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    View Products <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    to="/move-history"
                    onClick={() => setNotificationDropdownOpen(false)}
                    className="font-medium text-gray-500 hover:text-gray-700"
                  >
                    Stock Ledger
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-hidden"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  {user?.role || 'Staff'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <Badge variant={isInventoryManager ? 'purple' : 'info'} size="sm" dot>
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    System Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
