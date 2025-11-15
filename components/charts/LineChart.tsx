'use client';

import React, { useMemo } from 'react';
import { DataPoint, ChartDimensions, Viewport } from '@/lib/types';
import { useChartRenderer, renderLineChart } from '@/hooks/useChartRenderer';

interface LineChartProps {
  data: DataPoint[];
  dimensions: ChartDimensions;
  viewport: Viewport;
  color?: string;
}

function LineChart({
  data,
  dimensions,
  viewport,
  color = '#3b82f6',
}: LineChartProps) {
  const canvasRef = useChartRenderer(
    data,
    { dimensions, viewport, color },
    renderLineChart
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

// Don't use React.memo - let it re-render when props change
export default LineChart;

