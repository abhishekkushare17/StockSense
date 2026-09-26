import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';

export const IncomingVsOutgoingChart = ({ data = [], isLoading = false }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Incoming vs Outgoing</h3>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">Fulfillment Balance</span>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Loading comparison...
          </div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar dataKey="incoming" name="Inbound Receipts" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outgoing" name="Outbound Deliveries" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-xs text-gray-400">
            No fulfillment records available.
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingVsOutgoingChart;
