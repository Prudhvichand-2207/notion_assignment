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
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }, []);
  
  return (
    <div className="time-range-selector p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Time Range & Aggregation</h3>
      
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
              className={`px-3 py-1 rounded text-sm ${
                (aggregationPeriod?.value === period.value) ||
                (period.value === 0 && aggregationPeriod === null)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
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

