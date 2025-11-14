'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceMonitor } from '@/lib/performanceUtils';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
    frameCount: 0,
    lastFrameTime: performance.now(),
  });
  
  const monitorRef = useRef(new PerformanceMonitor());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateMetrics = useCallback(() => {
    monitorRef.current.update();
    
    const fps = monitorRef.current.getFPS();
    const memoryUsage = monitorRef.current.getMemoryUsage();
    const avgFrameTime = monitorRef.current.getAverageFrameTime();
    
    setMetrics({
      fps: Math.round(fps),
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      renderTime: Math.round(avgFrameTime * 100) / 100,
      dataProcessingTime: 0, // Will be set by components
      frameCount: monitorRef.current['frameCount'],
      lastFrameTime: performance.now(),
    });
  }, []);
  
  useEffect(() => {
    updateIntervalRef.current = setInterval(updateMetrics, 1000); // Update every second
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateMetrics]);
  
  const reset = useCallback(() => {
    monitorRef.current.reset();
    updateMetrics();
  }, [updateMetrics]);
  
  return {
    metrics,
    reset,
    updateMetrics,
  };
}

