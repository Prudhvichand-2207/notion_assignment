'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DataPoint } from '@/lib/types';
import { generateDataPoint, generateInitialDataset } from '@/lib/dataGenerator';

export function useDataStream(
  updateInterval: number = 100,
  initialCount: number = 1000
) {
  const [data, setData] = useState<DataPoint[]>(() =>
    generateInitialDataset(initialCount)
  );
  const [isStreaming, setIsStreaming] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxDataPointsRef = useRef(10000); // Keep max 10k points
  
  const addDataPoint = useCallback(() => {
    setData((prev) => {
      const newPoint = generateDataPoint(Date.now());
      const updated = [...prev, newPoint];
      
      // Remove old points if we exceed max
      if (updated.length > maxDataPointsRef.current) {
        return updated.slice(-maxDataPointsRef.current);
      }
      
      return updated;
    });
  }, []);
  
  const startStreaming = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsStreaming(true);
    intervalRef.current = setInterval(() => {
      addDataPoint();
    }, updateInterval);
  }, [updateInterval, addDataPoint]);
  
  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);
  
  const setMaxDataPoints = useCallback((max: number) => {
    maxDataPointsRef.current = max;
    setData((prev) => {
      if (prev.length > max) {
        return prev.slice(-max);
      }
      return prev;
    });
  }, []);
  
  const resetData = useCallback(() => {
    setData(generateInitialDataset(initialCount));
  }, [initialCount]);
  
  useEffect(() => {
    if (isStreaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
    
    return () => {
      stopStreaming();
    };
  }, [isStreaming, startStreaming, stopStreaming]);
  
  return {
    data,
    isStreaming,
    startStreaming,
    stopStreaming,
    setMaxDataPoints,
    resetData,
  };
}

