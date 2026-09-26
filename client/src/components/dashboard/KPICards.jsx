import React from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Truck,
  ArrowRightLeft,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const KPICards = ({ summary = {}, isLoading = false }) => {
  const cards = [
    {
      id: 'totalProducts',
      title: 'Total Products',
      value: summary.totalProducts ?? 0,
      icon: Package,
      color: 'indigo',
      bgLight: 'bg-indigo-50/70',
      textColor: 'text-indigo-600',
      borderColor: 'hover:border-indigo-300',
      link: '/products',
      subtitle: 'SKU Catalog'
    },
    {
      id: 'totalStock',
      title: 'Total Stock Units',
      value: (summary.totalStock ?? 0).toLocaleString(),
      icon: Layers,
      color: 'sky',
      bgLight: 'bg-sky-50/70',
      textColor: 'text-sky-600',
      borderColor: 'hover:border-sky-300',
      link: '/stock',
      subtitle: 'Physical inventory'
    },
    {
      id: 'lowStockItems',
      title: 'Low Stock',
      value: summary.lowStockItems ?? 0,
      icon: AlertTriangle,
      color: 'amber',
      bgLight: 'bg-amber-50/70',
      textColor: 'text-amber-600',
      borderColor: 'hover:border-amber-300',
      badge: summary.lowStockItems > 0 ? 'Warning' : 'Healthy',
      badgeColor: summary.lowStockItems > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      link: '/products?lowStock=true',
      subtitle: 'At or below threshold'
    },
    {
      id: 'outOfStockItems',
      title: 'Out of Stock',
      value: summary.outOfStockItems ?? 0,
      icon: XCircle,
      color: 'rose',
      bgLight: 'bg-rose-50/70',
      textColor: 'text-rose-600',
      borderColor: 'hover:border-rose-300',
      badge: summary.outOfStockItems > 0 ? 'Critical' : 'Zero',
      badgeColor: summary.outOfStockItems > 0 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700',
      link: '/products?outOfStock=true',
      subtitle: 'Depleted SKU levels'
    },
    {
      id: 'pendingReceipts',
      title: 'Pending Receipts',
      value: summary.pendingReceipts ?? 0,
      icon: ClipboardList,
      color: 'emerald',
      bgLight: 'bg-emerald-50/70',
      textColor: 'text-emerald-600',
      borderColor: 'hover:border-emerald-300',
      link: '/receipts',
      subtitle: 'Inbound orders'
    },
    {
      id: 'pendingDeliveries',
      title: 'Pending Deliveries',
      value: summary.pendingDeliveries ?? 0,
      icon: Truck,
      color: 'purple',
      bgLight: 'bg-purple-50/70',
      textColor: 'text-purple-600',
      borderColor: 'hover:border-purple-300',
      link: '/deliveries',
      subtitle: 'Outbound shipments'
    },
    {
      id: 'scheduledTransfers',
      title: 'Transfers',
      value: summary.scheduledTransfers ?? 0,
      icon: ArrowRightLeft,
      color: 'blue',
      bgLight: 'bg-blue-50/70',
      textColor: 'text-blue-600',
      borderColor: 'hover:border-blue-300',
      link: '/transfers',
      subtitle: 'Inter-hub transit'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.link}
            className={`group bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs ${card.borderColor} transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`p-2 rounded-xl ${card.bgLight} ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold text-gray-500 block truncate">
                {card.title}
              </span>

              {isLoading ? (
                <div className="h-7 w-14 bg-gray-100 animate-pulse rounded-lg my-1.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 tracking-tight">
                  {card.value}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 group-hover:text-indigo-600 transition-colors">
              <span className="truncate">{card.subtitle}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default KPICards;
