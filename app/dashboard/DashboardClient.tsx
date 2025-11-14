'use client';

import React, { useState, useCallback, useMemo, useTransition } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useDataStream } from '@/hooks/useDataStream';
import { ChartDimensions, Viewport, ChartConfig } from '@/lib/types';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import FilterPanel from '@/components/controls/FilterPanel';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import DataTable from '@/components/ui/DataTable';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

const CHART_TYPES: ChartConfig[] = [
  { type: 'line', dataKey: 'value', color: '#3b82f6', visible: true },
  { type: 'bar', dataKey: 'value', color: '#10b981', visible: false },
  { type: 'scatter', dataKey: 'value', color: '#f59e0b', visible: false },
  { type: 'heatmap', dataKey: 'value', color: '#8b5cf6', visible: false },
];

export default function DashboardClient() {
  const { filteredData, updateData } = useData();
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
  
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
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
  
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);
  
  const handleResetView = useCallback(() => {
    setViewport({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    });
  }, []);
  
  const renderChart = useMemo(() => {
    const commonProps = {
      data: filteredData,
      dimensions: chartDimensions,
      viewport,
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
  }, [selectedChartType, filteredData, chartDimensions, viewport]);
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time data visualization with 10,000+ data points at 60fps
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <PerformanceMonitor />
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chart Controls</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => (isStreaming ? stopStreaming() : startStreaming())}
                    className={`px-4 py-2 rounded ${
                      isStreaming
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {isStreaming ? 'Stop' : 'Start'} Stream
                  </button>
                  <button
                    onClick={handleResetView}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                  >
                    Reset View
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                {CHART_TYPES.map((chart) => (
                  <button
                    key={chart.type}
                    onClick={() => handleChartTypeChange(chart.type)}
                    className={`px-4 py-2 rounded capitalize ${
                      selectedChartType === chart.type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {chart.type}
                  </button>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Max Data Points: {streamData.length}
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
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1 space-y-4">
            <FilterPanel />
            <TimeRangeSelector />
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {selectedChartType} Chart ({filteredData.length} points)
              </h2>
              
              <div
                ref={containerRef}
                className="border rounded-lg overflow-hidden"
                style={{
                  width: '100%',
                  height: chartDimensions.height,
                  position: 'relative',
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  handleZoom(e.deltaY, e.clientX, e.clientY);
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

