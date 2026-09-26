import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { Badge, Loading, EmptyState } from '../components/common';
import api from '../services/api';

export const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(res.data?.data?.warehouses || []);
    } catch (err) {
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Warehouse className="w-6 h-6 text-indigo-600" />
            Warehouse Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Storage locations, distribution centers, and facility contact details.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 flex justify-center">
          <Loading text="Loading warehouses..." size="lg" />
        </div>
      ) : warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh._id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {wh.code?.slice(-2) || 'WH'}
                  </div>
                  <Badge variant={wh.status === 'active' || wh.isActive ? 'success' : 'neutral'} dot size="sm">
                    {wh.status || (wh.isActive ? 'Active' : 'Inactive')}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-gray-900">{wh.name}</h3>
                <p className="text-xs font-mono text-indigo-600 mt-0.5">Code: {wh.code}</p>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{wh.location || wh.city || 'Standard Facility Zone'}</span>
                  </div>
                  {wh.contactPerson && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-gray-400 flex items-center justify-center text-[10px] font-bold">&bull;</span>
                      <span>Contact: {wh.contactPerson}</span>
                    </div>
                  )}
                  {wh.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{wh.phone}</span>
                    </div>
                  )}
                  {wh.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{wh.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Facility Hub</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Warehouses Found"
          message="No warehouse storage locations have been registered yet."
        />
      )}
    </div>
  );
};

export default WarehousePage;
