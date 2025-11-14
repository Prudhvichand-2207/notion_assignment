'use client';

import React from 'react';
import { DataPoint, ChartDimensions, Viewport } from '@/lib/types';
import { useChartRenderer, renderHeatmap } from '@/hooks/useChartRenderer';

interface HeatmapProps {
  data: DataPoint[];
  dimensions: ChartDimensions;
  viewport: Viewport;
}

export default React.memo(function Heatmap({
  data,
  dimensions,
  viewport,
}: HeatmapProps) {
  const canvasRef = useChartRenderer(
    data,
    { dimensions, viewport },
    renderHeatmap
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

