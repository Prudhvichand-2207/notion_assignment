'use client';

import React from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export default function PerformanceMonitor() {
  const { metrics, reset } = usePerformanceMonitor();
  const [isMounted, setIsMounted] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  
  // Prevent hydration mismatch by only rendering time after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleReset = React.useCallback(() => {
    setIsResetting(true);
    reset();
    // Reset the visual feedback after a brief moment
    setTimeout(() => setIsResetting(false), 300);
  }, [reset]);
  
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="performance-monitor panel">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Performance Metrics</h3>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isResetting
              ? 'bg-green-500 text-white scale-95'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
          }`}
        >
          {isResetting ? '✓ Reset' : '🔄 Reset'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="metric-card">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">FPS</div>
          <div className={`text-3xl font-bold ${getFPSColor(metrics.fps)} mb-1`}>
            {metrics.fps}
          </div>
          <div className="text-xs text-gray-400">Target: 60</div>
        </div>
        
        <div className="metric-card">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Memory</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.memoryUsage.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">MB</div>
        </div>
        
        <div className="metric-card">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Render Time</div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {metrics.renderTime.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">ms</div>
        </div>
        
        <div className="metric-card">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Frames</div>
          <div className="text-3xl font-bold text-gray-700 mb-1">
            {metrics.frameCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">total</div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          {isMounted ? (
            <>Last Update: {new Date(metrics.lastFrameTime).toLocaleTimeString()}</>
          ) : (
            <>Last Update: --:--:--</>
          )}
        </div>
      </div>
    </div>
  );
}

