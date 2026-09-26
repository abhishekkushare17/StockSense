import React, { useState } from 'react';
import {
  Search,
  MapPin,
  X,
  Package,
  Warehouse as WarehouseIcon,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button, Badge } from '../common';
import { findStockLocations } from '../../services/intelligenceService';

export const FindMyStockModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      const data = await findStockLocations(searchQuery);
      setSearchResults(data);
    } catch (err) {
      setError(err.message || 'Failed to search stock location');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = ['Where is Steel Rod?', 'CHR-ERG-101', 'Copper Wire', 'Desk'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Find My Stock
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Smart Location Finder
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Instantly locate physical warehouse bays, racks, and stock allocations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Natural Location Search
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Where is Steel Rod? or enter SKU"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={Search}
              >
                Locate
              </Button>
            </div>

            {/* Quick Sample Queries */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">Try:</span>
              {sampleQueries.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sample);
                    findStockLocations(sample).then(setSearchResults);
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Results Container */}
          {searchResults && (
            <div className="space-y-4 animate-fadeIn">
              {!searchResults.found || searchResults.results.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No Inventory Match Found</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Try searching by SKU code (e.g. ROD-STL-001) or product title.
                  </p>
                </div>
              ) : (
                searchResults.results.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-4"
                  >
                    {/* Product Summary Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {result.product.sku}
                          </span>
                          <h3 className="text-sm font-black text-gray-900">
                            {result.product.name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-0.5 block">
                          Category: {result.product.category} &bull; UOM: {result.product.unitOfMeasure}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Stock</span>
                        <span className="text-xl font-black text-indigo-600">
                          {result.totalStock} {result.product.unitOfMeasure}
                        </span>
                      </div>
                    </div>

                    {/* Physical Locations Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <WarehouseIcon className="w-3.5 h-3.5 text-indigo-500" />
                        Stored Across {result.locations.length} Locations:
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {result.locations.map((loc, lIdx) => (
                          <div
                            key={lIdx}
                            className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-gray-800 block">
                                {loc.warehouseName} ({loc.warehouseCode})
                              </span>
                              <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-[11px]">
                                <MapPin className="w-3 h-3 text-indigo-500" />
                                <span>{loc.locationBin}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 block">
                                {loc.city ? `${loc.city} • ` : ''}Available: {loc.availableQuantity}
                              </span>
                            </div>

                            <span className="font-mono font-extrabold text-gray-900 text-sm">
                              {loc.quantity} {result.product.unitOfMeasure}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindMyStockModal;
