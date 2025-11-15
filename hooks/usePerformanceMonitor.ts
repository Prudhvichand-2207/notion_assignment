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
    lastFrameTime: typeof window !== 'undefined' && typeof performance !== 'undefined' ? performance.now() : 0,
  });
  
  const monitorRef = useRef(new PerformanceMonitor());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateMetrics = useCallback(() => {
    // Guard against SSR
    if (typeof window === 'undefined' || typeof performance === 'undefined') return;
    
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
    // Guard against SSR
    if (typeof window === 'undefined') return;
    
    updateIntervalRef.current = setInterval(updateMetrics, 1000); // Update every second
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateMetrics]);
  
  const reset = useCallback(() => {
    // Reset the internal monitor state
    monitorRef.current.reset();
    
    // Immediately reset metrics to initial values
    setMetrics({
      fps: 0,
      memoryUsage: typeof window !== 'undefined' && typeof performance !== 'undefined' && 'memory' in performance
        ? Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
        : 0,
      renderTime: 0,
      dataProcessingTime: 0,
      frameCount: 0,
      lastFrameTime: typeof window !== 'undefined' && typeof performance !== 'undefined' ? performance.now() : 0,
    });
  }, []);
  
  return {
    metrics,
    reset,
    updateMetrics,
  };
}

