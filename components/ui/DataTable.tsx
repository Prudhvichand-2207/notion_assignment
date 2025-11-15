'use client';

import React, { useMemo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
}

export default React.memo(function DataTable({ data, height = 400 }: DataTableProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  
  // Prevent hydration mismatch by only formatting dates after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { containerRef, visibleItems, offsetY, totalHeight, startIndex } =
    useVirtualization(data, {
      itemHeight: 40,
      containerHeight: height,
      overscan: 5,
    });
  
  const formatTimestamp = useMemo(
    () => (timestamp: number) => {
      if (!isMounted) {
        // Return a stable placeholder during SSR to prevent hydration mismatch
        return '--';
      }
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    [isMounted]
  );
  
  return (
    <div className="data-table card overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-bold text-gray-800">
          Data Table <span className="text-blue-600">({data.length.toLocaleString()} points)</span>
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

