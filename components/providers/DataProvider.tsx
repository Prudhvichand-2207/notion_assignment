'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { DataPoint, FilterOptions, TimeRange, AggregationPeriod } from '@/lib/types';
import { aggregateData } from '@/lib/dataGenerator';

interface DataContextValue {
  data: DataPoint[];
  filteredData: DataPoint[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;
  aggregationPeriod: AggregationPeriod | null;
  setAggregationPeriod: (period: AggregationPeriod | null) => void;
  updateData: (newData: DataPoint[]) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: DataPoint[];
}) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  
  const initialTimeRange = useMemo(() => {
    if (initialData.length === 0) {
      return { start: Date.now() - 100000, end: Date.now() };
    }
    return {
      start: Math.min(...initialData.map((d) => d.timestamp)),
      end: Math.max(...initialData.map((d) => d.timestamp)),
    };
  }, [initialData]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    valueRange: [0, 100],
    timeRange: initialTimeRange,
  });
  const [aggregationPeriod, setAggregationPeriod] = useState<AggregationPeriod | null>(null);
  
  // Update filters when data changes significantly
  useEffect(() => {
    if (data.length > 0) {
      const times = data.map((d) => d.timestamp);
      const values = data.map((d) => d.value);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      
      setFilters((prev) => {
        // Only update if range changed significantly
        const timeChanged = Math.abs(prev.timeRange.start - minTime) > 1000 || 
                           Math.abs(prev.timeRange.end - maxTime) > 1000;
        const valueChanged = Math.abs(prev.valueRange[0] - minValue) > 1 || 
                            Math.abs(prev.valueRange[1] - maxValue) > 1;
        
        // Only update valueRange if it's significantly outside the actual data range
        // This prevents auto-resetting when user is manually adjusting
        const valueRangeNeedsUpdate = 
          prev.valueRange[0] < minValue - 1 || 
          prev.valueRange[1] > maxValue + 1 ||
          (Math.abs(prev.valueRange[0] - minValue) > 1 && Math.abs(prev.valueRange[1] - maxValue) > 1);
        
        if (timeChanged) {
          return {
            ...prev,
            timeRange: {
              start: minTime,
              end: maxTime,
            },
            // Only update valueRange if it's way outside bounds
            ...(valueRangeNeedsUpdate ? { valueRange: [minValue, maxValue] } : {}),
          };
        }
        
        // Only update valueRange if it's significantly outside bounds
        if (valueRangeNeedsUpdate) {
          return {
            ...prev,
            valueRange: [
              Math.max(minValue, prev.valueRange[0]),
              Math.min(maxValue, prev.valueRange[1])
            ],
          };
        }
        
        return prev;
      });
    }
  }, [data]);
  
  const updateData = useCallback((newData: DataPoint[]) => {
    setData(newData);
  }, []);
  
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((point) =>
        filters.categories.includes(point.category)
      );
    }
    
    // Apply value range filter
    result = result.filter(
      (point) =>
        point.value >= filters.valueRange[0] &&
        point.value <= filters.valueRange[1]
    );
    
    // Apply time range filter
    result = result.filter(
      (point) =>
        point.timestamp >= filters.timeRange.start &&
        point.timestamp <= filters.timeRange.end
    );
    
    // Apply aggregation if selected
    if (aggregationPeriod) {
      result = aggregateData(result, aggregationPeriod.value);
    }
    
    return result;
  }, [data, filters, aggregationPeriod]);
  
  const value = useMemo(
    () => ({
      data,
      filteredData,
      filters,
      setFilters,
      aggregationPeriod,
      setAggregationPeriod,
      updateData,
    }),
    [data, filteredData, filters, aggregationPeriod, updateData]
  );
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

