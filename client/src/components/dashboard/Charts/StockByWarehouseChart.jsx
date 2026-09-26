import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Warehouse } from 'lucide-react';

const BAR_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const StockByWarehouseChart = ({ data = [], isLoading = false }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
            <Warehouse className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Stock by Warehouse</h3>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">Facility Capacity</span>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Loading warehouse distribution...
          </div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#4B5563' }}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <Tooltip
                formatter={(val) => [`${(val || 0).toLocaleString()} units`, 'Stock Volume']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" name="Total Units" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-xs text-gray-400">
            No warehouse stock records available.
          </div>
        )}
      </div>
    </div>
  );
};

export default StockByWarehouseChart;
