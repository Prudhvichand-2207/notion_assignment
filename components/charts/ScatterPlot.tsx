'use client';

import React from 'react';
import { DataPoint, ChartDimensions, Viewport } from '@/lib/types';
import { useChartRenderer, renderScatterPlot } from '@/hooks/useChartRenderer';

interface ScatterPlotProps {
  data: DataPoint[];
  dimensions: ChartDimensions;
  viewport: Viewport;
  color?: string;
}

export default function ScatterPlot({
  data,
  dimensions,
  viewport,
  color = '#f59e0b',
}: ScatterPlotProps) {
  const canvasRef = useChartRenderer(
    data,
    { dimensions, viewport, color },
    renderScatterPlot
  );
  
  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}

