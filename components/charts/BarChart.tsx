'use client';

import React from 'react';
import { DataPoint, ChartDimensions, Viewport } from '@/lib/types';
import { useChartRenderer, renderBarChart } from '@/hooks/useChartRenderer';

interface BarChartProps {
  data: DataPoint[];
  dimensions: ChartDimensions;
  viewport: Viewport;
  color?: string;
}

export default React.memo(function BarChart({
  data,
  dimensions,
  viewport,
  color = '#10b981',
}: BarChartProps) {
  const canvasRef = useChartRenderer(
    data,
    { dimensions, viewport, color },
    renderBarChart
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
});

