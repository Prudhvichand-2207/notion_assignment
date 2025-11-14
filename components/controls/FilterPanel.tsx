'use client';

import React, { useMemo, useCallback } from 'react';
import { useData } from '../providers/DataProvider';
import { FilterOptions } from '@/lib/types';

const CATEGORIES = ['CPU', 'Memory', 'Network', 'Disk', 'Temperature'];

export default React.memo(function FilterPanel() {
  const { filters, setFilters, data } = useData();
  
  const availableCategories = useMemo(() => {
    const unique = new Set(data.map((d) => d.category));
    return Array.from(unique);
  }, [data]);
  
  const valueRange = useMemo(() => {
    const values = data.map((d) => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data]);
  
  const handleCategoryToggle = useCallback(
    (category: string) => {
      setFilters({
        ...filters,
        categories: filters.categories.includes(category)
          ? filters.categories.filter((c) => c !== category)
          : [...filters.categories, category],
      });
    },
    [filters, setFilters]
  );
  
  const handleValueRangeChange = useCallback(
    (index: number, value: number) => {
      const newRange: [number, number] = [...filters.valueRange];
      newRange[index] = value;
      setFilters({
        ...filters,
        valueRange: newRange,
      });
    },
    [filters, setFilters]
  );
  
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      valueRange: [valueRange.min, valueRange.max],
      timeRange: {
        start: Math.min(...data.map((d) => d.timestamp)),
        end: Math.max(...data.map((d) => d.timestamp)),
      },
    });
  }, [data, valueRange, setFilters]);
  
  return (
    <div className="filter-panel p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-1 rounded text-sm ${
                filters.categories.includes(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Value Range: {filters.valueRange[0].toFixed(1)} - {filters.valueRange[1].toFixed(1)}
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min={valueRange.min}
            max={valueRange.max}
            value={filters.valueRange[0]}
            onChange={(e) => handleValueRangeChange(0, parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="range"
            min={valueRange.min}
            max={valueRange.max}
            value={filters.valueRange[1]}
            onChange={(e) => handleValueRangeChange(1, parseFloat(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
      
      <button
        onClick={resetFilters}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  );
});

