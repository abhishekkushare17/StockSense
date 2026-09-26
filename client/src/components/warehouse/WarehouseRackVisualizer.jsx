import React, { useState, useMemo } from 'react';
import {
  Layers,
  AlertTriangle,
  Boxes,
  ArrowRight,
  Warehouse,
  CheckCircle2,
  Package,
  Info
} from 'lucide-react';
import { Badge, Button } from '../common';

export const WarehouseRackVisualizer = ({ warehouses = [], stocks = [], onSelectProduct }) => {
  const [activeWarehouseId, setActiveWarehouseId] = useState(warehouses[0]?._id || '');
  const [selectedRack, setSelectedRack] = useState(null);

  // Active warehouse object
  const currentWarehouse = useMemo(() => {
    return warehouses.find((w) => w._id === activeWarehouseId) || warehouses[0];
  }, [warehouses, activeWarehouseId]);

  // Stocks filtered to active warehouse
  const warehouseStocks = useMemo(() => {
    if (!currentWarehouse) return [];
    return stocks.filter(
      (s) => s.warehouse?._id === currentWarehouse._id || s.warehouse === currentWarehouse._id
    );
  }, [stocks, currentWarehouse]);

  // Distribute warehouse stocks across racks A1..A3, B1..B3, C1..C3 deterministically
  const racksData = useMemo(() => {
    const rackKeys = [
      { id: 'A1', name: 'Rack A1', zone: 'Zone A - Inbound Stage', maxCapacity: 150 },
      { id: 'A2', name: 'Rack A2', zone: 'Zone A - Bulk Storage', maxCapacity: 150 },
      { id: 'A3', name: 'Rack A3', zone: 'Zone A - Fast Moving', maxCapacity: 100 },
      { id: 'B1', name: 'Rack B1', zone: 'Zone B - Pallet Storage', maxCapacity: 200 },
      { id: 'B2', name: 'Rack B2', zone: 'Zone B - Intermediate', maxCapacity: 150 },
      { id: 'B3', name: 'Rack B3', zone: 'Zone B - Replenishment', maxCapacity: 100 },
      { id: 'C1', name: 'Rack C1', zone: 'Zone C - Small Parts', maxCapacity: 100 },
      { id: 'C2', name: 'Rack C2', zone: 'Zone C - Finished Goods', maxCapacity: 150 },
      { id: 'C3', name: 'Rack C3', zone: 'Zone C - Outbound Ready', maxCapacity: 120 }
    ];

    return rackKeys.map((rack, idx) => {
      // Allocate stocks to this rack using modulo distribution
      const rackItems = warehouseStocks.filter((_, sIdx) => sIdx % rackKeys.length === idx);
      const totalUnits = rackItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const hasLowStock = rackItems.some(
        (item) => (item.quantity || 0) <= (item.product?.reorderLevel || 10)
      );

      const utilization = Math.min(100, Math.round((totalUnits / rack.maxCapacity) * 100));

      return {
        ...rack,
        items: rackItems,
        totalUnits,
        hasLowStock,
        utilization
      };
    });
  }, [warehouseStocks]);

  const activeRackDetail = selectedRack
    ? racksData.find((r) => r.id === selectedRack.id) || racksData[0]
    : racksData[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-5 p-5">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-indigo-600" />
            Interactive Facility Bay & Rack Layout
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click on any warehouse bay or rack to inspect stored inventory and safety alerts
          </p>
        </div>

        {/* Facility Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {warehouses.map((wh) => (
            <button
              key={wh._id}
              type="button"
              onClick={() => {
                setActiveWarehouseId(wh._id);
                setSelectedRack(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                (currentWarehouse?._id === wh._id)
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {wh.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Grid Layout View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Racks Matrix (3x3 grid) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Facility Map: {currentWarehouse?.name || 'Main Warehouse'}
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Low Stock ⚠
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {racksData.map((rack) => {
              const isSelected = activeRackDetail?.id === rack.id;
              return (
                <button
                  key={rack.id}
                  type="button"
                  onClick={() => setSelectedRack(rack)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-32 relative ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-xs'
                      : rack.hasLowStock
                      ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {rack.id}
                    </span>
                    {rack.hasLowStock && (
                      <span
                        title="Low stock item located in this bay"
                        className="p-1 rounded-md bg-amber-100 text-amber-700"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xl font-extrabold text-gray-900 block tracking-tight">
                      {rack.totalUnits} <span className="text-xs font-normal text-gray-500">units</span>
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                      {rack.items.length} items allocated
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rack.hasLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${rack.utilization}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Rack Inventory Drawer */}
        <div className="lg:col-span-1 bg-gray-50/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {activeRackDetail.name} Inventory
                </h4>
                <p className="text-[11px] text-gray-500">{activeRackDetail.zone}</p>
              </div>
              <Badge variant={activeRackDetail.hasLowStock ? 'warning' : 'success'} size="sm">
                {activeRackDetail.utilization}% Full
              </Badge>
            </div>

            {/* Items inside selected rack */}
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
              {activeRackDetail.items.length > 0 ? (
                activeRackDetail.items.map((stockItem, idx) => {
                  const qty = stockItem.quantity || 0;
                  const reorder = stockItem.product?.reorderLevel || 10;
                  const isItemLow = qty <= reorder;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-gray-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900 truncate max-w-[130px]">
                          {stockItem.product?.name || 'Material Item'}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500">
                          {stockItem.product?.sku || 'SKU-000'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold ${isItemLow ? 'text-amber-600' : 'text-gray-900'}`}>
                          {qty} {stockItem.product?.unitOfMeasure || 'units'}
                        </span>
                        {isItemLow && (
                          <span className="block text-[9px] font-bold text-amber-600">
                            Reorder: {reorder}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No stock currently occupying this bay.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Capacity: {activeRackDetail.maxCapacity} units</span>
            <span className="font-medium text-indigo-600">Verified Bay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseRackVisualizer;
