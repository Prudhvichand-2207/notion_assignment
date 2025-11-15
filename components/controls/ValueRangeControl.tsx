'use client';

import React, { useCallback, useMemo } from 'react';
import { useData } from '../providers/DataProvider';

export default React.memo(function ValueRangeControl() {
  const { filters, setFilters, data } = useData();
  
  const actualRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Ensure we have a valid range
    return {
      min: isNaN(min) ? 0 : min,
      max: isNaN(max) || max === min ? min + 1 : max,
    };
  }, [data]);
  
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (isNaN(value)) return;
      
      setFilters((prev) => {
        // Ensure min is at least actualRange.min and less than max
        const newMin = Math.max(
          actualRange.min,
          Math.min(value, prev.valueRange[1] - 0.1)
        );
        return {
          ...prev,
          valueRange: [newMin, prev.valueRange[1]],
        };
      });
    },
    [actualRange.min, setFilters]
  );
  
  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (isNaN(value)) return;
      
      setFilters((prev) => {
        // Ensure max is at most actualRange.max and greater than min
        const newMax = Math.min(
          actualRange.max,
          Math.max(value, prev.valueRange[0] + 0.1)
        );
        return {
          ...prev,
          valueRange: [prev.valueRange[0], newMax],
        };
      });
    },
    [actualRange.max, setFilters]
  );
  
  const resetRange = useCallback(() => {
    // Reload the page to reset everything (data, filters, viewport, etc.)
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);
  
  return (
    <div className="value-range-control panel">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Value Range</h3>
        <button
          onClick={resetRange}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-all"
        >
          🔄 Reset
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Min Value: <span className="text-blue-600 font-bold">{filters.valueRange[0].toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={actualRange.min}
            max={Math.max(actualRange.min + 0.1, filters.valueRange[1] - 0.1)}
            step="0.1"
            value={filters.valueRange[0]}
            onChange={handleMinChange}
            className="w-full cursor-pointer"
            style={{ pointerEvents: 'auto', WebkitAppearance: 'none', appearance: 'none' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{actualRange.min.toFixed(1)}</span>
            <span>{actualRange.max.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Max Value: <span className="text-blue-600 font-bold">{filters.valueRange[1].toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={Math.min(actualRange.max - 0.1, filters.valueRange[0] + 0.1)}
            max={actualRange.max}
            step="0.1"
            value={filters.valueRange[1]}
            onChange={handleMaxChange}
            className="w-full cursor-pointer"
            style={{ pointerEvents: 'auto', WebkitAppearance: 'none', appearance: 'none' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{actualRange.min.toFixed(1)}</span>
            <span>{actualRange.max.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-semibold text-gray-700">
            <div className="mb-2">Current Range: <span className="text-blue-600">{filters.valueRange[0].toFixed(1)} - {filters.valueRange[1].toFixed(1)}</span></div>
            <div className="text-xs text-gray-500 font-normal">
              Data Range: {actualRange.min.toFixed(1)} - {actualRange.max.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

