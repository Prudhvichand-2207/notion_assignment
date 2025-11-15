'use client';

import React, { useCallback, useMemo } from 'react';
import { useData } from '../providers/DataProvider';
import { AggregationPeriod } from '@/lib/types';

const AGGREGATION_PERIODS: AggregationPeriod[] = [
  { label: 'Raw Data', value: 0 },
  { label: '1 Minute', value: 60 * 1000 },
  { label: '5 Minutes', value: 5 * 60 * 1000 },
  { label: '1 Hour', value: 60 * 60 * 1000 },
];

export default React.memo(function TimeRangeSelector() {
  const { aggregationPeriod, setAggregationPeriod, data } = useData();
  const [isMounted, setIsMounted] = React.useState(false);
  
  // Prevent hydration mismatch by only formatting dates after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const timeRange = useMemo(() => {
    if (data.length === 0) return { start: 0, end: 0 };
    const timestamps = data.map((d) => d.timestamp);
    return {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps),
    };
  }, [data]);
  
  const handleAggregationChange = useCallback(
    (period: AggregationPeriod | null) => {
      setAggregationPeriod(period);
    },
    [setAggregationPeriod]
  );
  
  const formatTime = useCallback((timestamp: number) => {
    if (!isMounted) {
      // Return a stable placeholder during SSR to prevent hydration mismatch
      return '--:--:--';
    }
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }, [isMounted]);
  
  return (
    <div className="time-range-selector panel">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Time Range & Aggregation</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Time Range</label>
        <div className="text-sm text-gray-600">
          <div>Start: {formatTime(timeRange.start)}</div>
          <div>End: {formatTime(timeRange.end)}</div>
          <div>
            Duration: {Math.round((timeRange.end - timeRange.start) / 1000)}s
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Aggregation</label>
        <div className="flex flex-wrap gap-2">
          {AGGREGATION_PERIODS.map((period) => (
            <button
              key={period.label}
              onClick={() =>
                handleAggregationChange(
                  period.value === 0 ? null : period
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                (aggregationPeriod?.value === period.value) ||
                (period.value === 0 && aggregationPeriod === null)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

