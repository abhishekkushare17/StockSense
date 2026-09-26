import React from 'react';
import Loading from './Loading';
import EmptyState from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  isLoading = false,
  emptyMessage = 'No data available in this table',
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50/75">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  className={`px-4 py-3.5 font-semibold text-gray-900 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <Loading type="spinner" size="md" message="Loading records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8">
                  <EmptyState description={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKey = row[keyField] || index;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {columns.map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <td
                          key={col.key || col.header}
                          className={`whitespace-nowrap px-4 py-3.5 text-gray-600 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${col.className || ''}`}
                        >
                          {col.render ? col.render(cellValue, row, index) : cellValue ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
