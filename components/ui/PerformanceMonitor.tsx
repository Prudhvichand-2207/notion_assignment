'use client';

import React from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export default function PerformanceMonitor() {
  const { metrics, reset } = usePerformanceMonitor();
  
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="performance-monitor p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
        <button
          onClick={reset}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600">FPS</div>
          <div className={`text-2xl font-bold ${getFPSColor(metrics.fps)}`}>
            {metrics.fps}
          </div>
          <div className="text-xs text-gray-500">Target: 60</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600">Memory</div>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.memoryUsage.toFixed(1)} MB
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600">Render Time</div>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.renderTime.toFixed(2)} ms
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600">Frame Count</div>
          <div className="text-2xl font-bold text-gray-600">
            {metrics.frameCount.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500">
          Last Update: {new Date(metrics.lastFrameTime).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

