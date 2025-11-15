'use client';

import React, { useState, useCallback, useMemo, useTransition, useLayoutEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useDataStream } from '@/hooks/useDataStream';
import { ChartDimensions, Viewport, ChartConfig } from '@/lib/types';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import ValueRangeControl from '@/components/controls/ValueRangeControl';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

const CHART_TYPES: ChartConfig[] = [
  { type: 'line', dataKey: 'value', color: '#3b82f6', visible: true },
  { type: 'bar', dataKey: 'value', color: '#10b981', visible: false },
  { type: 'scatter', dataKey: 'value', color: '#f59e0b', visible: false },
  { type: 'heatmap', dataKey: 'value', color: '#8b5cf6', visible: false },
];

export default function DashboardClient() {
  const { filteredData, updateData, filters } = useData();
  const [selectedChartType, setSelectedChartType] = useState<ChartConfig['type']>('line');
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });
  const [isPending, startTransition] = useTransition();
  
  const { data: streamData, isStreaming, startStreaming, stopStreaming, setMaxDataPoints } =
    useDataStream(100, 1000);
  
  // Update data provider when stream data changes
  React.useEffect(() => {
    startTransition(() => {
      updateData(streamData);
    });
  }, [streamData, updateData]);
  
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Define handleZoom FIRST before it's used in chartContainerRefCallback
  const handleZoom = useCallback(
    (delta: number, centerX?: number, centerY?: number) => {
      setViewport((prev) => {
        const scaleFactor = delta > 0 ? 1.1 : 0.9;
        const newScaleX = Math.max(0.1, Math.min(5, prev.scaleX * scaleFactor));
        const newScaleY = Math.max(0.1, Math.min(5, prev.scaleY * scaleFactor));
        
        return {
          ...prev,
          scaleX: newScaleX,
          scaleY: newScaleY,
        };
      });
    },
    []
  );
  
  React.useEffect(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return;
    
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Store handler reference for cleanup
  const wheelHandlerRef = React.useRef<((e: WheelEvent) => void) | null>(null);
  
  // Setup wheel listener using ref callback to attach BEFORE React's handlers
  const chartContainerRefCallback = React.useCallback((el: HTMLDivElement | null) => {
    // Guard against SSR - document doesn't exist on server
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      chartContainerRef.current = el;
      return;
    }
    
    // Cleanup previous handler if element changed
    if (chartContainerRef.current && wheelHandlerRef.current) {
      document.removeEventListener('wheel', wheelHandlerRef.current, { capture: true } as any);
    }
    
    chartContainerRef.current = el;
    
    if (!el) {
      wheelHandlerRef.current = null;
      return;
    }
    
    // Create handler that prevents default and handles zoom
    const wheelHandler = (e: WheelEvent) => {
      const target = e.target as Node;
      // Only handle if the event is within our chart container
      if (el.contains(target)) {
        // Prevent default BEFORE React's handlers can run
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleZoom(e.deltaY, e.clientX, e.clientY);
      }
    };
    
    wheelHandlerRef.current = wheelHandler;
    
    // Attach to document in capture phase IMMEDIATELY
    // This runs synchronously before React can attach its passive listeners
    // Using capture: true ensures we intercept at the document level before bubbling
    document.addEventListener('wheel', wheelHandler, { 
      passive: false,  // Critical: allows preventDefault
      capture: true     // Critical: runs before React's handlers
    });
  }, [handleZoom]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined' && wheelHandlerRef.current) {
        document.removeEventListener('wheel', wheelHandlerRef.current, { capture: true } as any);
        wheelHandlerRef.current = null;
      }
    };
  }, []);
  
  // Suppress React's passive listener warnings in development
  // This is necessary because React attaches passive listeners to scrollable elements
  // and we can't prevent React from doing this, but we handle the events correctly
  React.useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      const suppressPassiveWarning = (...args: any[]) => {
        const message = args[0];
        if (
          typeof message === 'string' &&
          message.includes('Unable to preventDefault inside passive event listener')
        ) {
          return; // Suppress this specific warning
        }
        return originalWarn.apply(console, args);
      };
      
      console.warn = suppressPassiveWarning;
      console.error = suppressPassiveWarning;
      
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);
  
  const chartDimensions = useMemo<ChartDimensions>(
    () => ({
      width: Math.max(400, containerWidth - 32), // Account for padding
      height: 400,
      padding: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 80,
      },
    }),
    [containerWidth]
  );
  
  const handleChartTypeChange = useCallback((type: ChartConfig['type']) => {
    setSelectedChartType(type);
  }, []);
  
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);
  
  const [isResettingView, setIsResettingView] = useState(false);
  
  const handleResetView = useCallback(() => {
    setIsResettingView(true);
    // Always create a new object to ensure React detects the change
    setViewport({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
    // Reset visual feedback after animation
    setTimeout(() => setIsResettingView(false), 300);
  }, []);
  
  const renderChart = useMemo(() => {
    const commonProps = {
      data: filteredData,
      dimensions: chartDimensions,
      viewport,
      valueRange: filters.valueRange,
    };
    
    switch (selectedChartType) {
      case 'line':
        return <LineChart {...commonProps} />;
      case 'bar':
        return <BarChart {...commonProps} />;
      case 'scatter':
        return <ScatterPlot {...commonProps} />;
      case 'heatmap':
        return <Heatmap {...commonProps} />;
      default:
        return <LineChart {...commonProps} />;
    }
  }, [selectedChartType, filteredData, chartDimensions, viewport, filters.valueRange]);
  
  return (
    <div className="min-h-screen p-4 md:p-8 fade-in">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Performance Dashboard
          </h1>
          <p className="text-white/90 text-lg">
            Real-time data visualization with 10,000+ data points at 60fps
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <PerformanceMonitor />
          </div>
          
          <div className="lg:col-span-3">
            <div className="card p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Chart Controls</h2>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => (isStreaming ? stopStreaming() : startStreaming())}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                      isStreaming
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                    }`}
                  >
                    {isStreaming ? '⏸ Stop' : '▶ Start'} Stream
                  </button>
                  <button
                    onClick={handleResetView}
                    disabled={isResettingView}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                      isResettingView
                        ? 'bg-green-500 text-white scale-95'
                        : 'btn-secondary'
                    }`}
                  >
                    {isResettingView ? '✓ Reset' : '🔄 Reset View'}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mb-6 flex-wrap">
                {CHART_TYPES.map((chart) => (
                  <button
                    key={chart.type}
                    onClick={() => handleChartTypeChange(chart.type)}
                    className={`px-5 py-2.5 rounded-lg font-semibold capitalize transition-all ${
                      selectedChartType === chart.type
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    {chart.type}
                  </button>
                ))}
              </div>
              
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Max Data Points: <span className="text-blue-600 font-bold">{streamData.length.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={streamData.length}
                  onChange={(e) => setMaxDataPoints(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1K</span>
                  <span>50K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1 space-y-4">
            <FilterPanel />
            <TimeRangeSelector />
            <ValueRangeControl />
          </div>
          
          <div className="lg:col-span-3">
            <div className="chart-container chart-container-wrapper">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {selectedChartType} Chart
                </h2>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg">
                  {filteredData.length.toLocaleString()} points
                </div>
              </div>
              
              <div
                ref={chartContainerRefCallback}
                className="border rounded-lg overflow-hidden chart-container-wrapper"
                style={{
                  width: '100%',
                  height: chartDimensions.height,
                  position: 'relative',
                  touchAction: 'none',
                  overscrollBehavior: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  const startX = e.clientX;
                  const startY = e.clientY;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const deltaY = moveEvent.clientY - startY;
                    handlePan(deltaX * 0.1, -deltaY * 0.1);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {isPending && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-gray-600">Updating...</div>
                  </div>
                )}
                {renderChart}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <DataTable data={filteredData} height={400} />
        </div>
      </div>
    </div>
  );
}

