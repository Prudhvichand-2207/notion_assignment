'use client';

import React, { useMemo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
}

export default React.memo(function DataTable({ data, height = 400 }: DataTableProps) {
  const { containerRef, visibleItems, offsetY, totalHeight, startIndex } =
    useVirtualization(data, {
      itemHeight: 40,
      containerHeight: height,
      overscan: 5,
    });
  
  const formatTimestamp = useMemo(
    () => (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    []
  );
  
  return (
    <div className="data-table bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          Data Table ({data.length} points)
        </h3>
      </div>
      
      <div className="overflow-auto" ref={containerRef} style={{ height }}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              width: '100%',
            }}
          >
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Timestamp</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Value</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((point, index) => (
                  <tr
                    key={`${point.timestamp}-${startIndex + index}`}
                    className="border-b hover:bg-gray-50"
                    style={{ height: 40 }}
                  >
                    <td className="px-4 py-2 text-sm">
                      {formatTimestamp(point.timestamp)}
                    </td>
                    <td className="px-4 py-2 text-sm">{point.value.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {point.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

