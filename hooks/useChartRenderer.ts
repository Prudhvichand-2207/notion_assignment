'use client';

import { useRef, useEffect, useCallback } from 'react';
import { DataPoint, ChartDimensions, Viewport } from '@/lib/types';
import {
  clearCanvas,
  drawGrid,
  drawAxes,
  transformPoint,
} from '@/lib/canvasUtils';

export interface ChartRendererOptions {
  dimensions: ChartDimensions;
  viewport: Viewport;
  color?: string;
  lineWidth?: number;
  valueRange?: [number, number];
}

export function useChartRenderer(
  data: DataPoint[],
  options: ChartRendererOptions,
  renderFn: (
    ctx: CanvasRenderingContext2D,
    data: DataPoint[],
    options: ChartRendererOptions
  ) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDataRef = useRef<DataPoint[]>([]);
  
  // Use refs to track latest values to avoid stale closures
  const optionsRef = useRef(options);
  const dataRef = useRef(data);
  
  // Always update refs with latest values (no dependencies to avoid hook order issues)
  optionsRef.current = options;
  dataRef.current = data;
  
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Use refs to get latest values
    const currentOptions = optionsRef.current;
    const currentData = dataRef.current;
    
    const { dimensions, viewport, valueRange } = currentOptions;
    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;
    
    // Set canvas size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
    
    // Clear canvas
    clearCanvas(ctx, displayWidth, displayHeight);
    
    // Draw grid
    if (currentData.length > 0) {
      drawGrid(ctx, dimensions, viewport, currentData, valueRange);
      
      // Draw axes
      drawAxes(ctx, dimensions, currentData, valueRange);
      
      // Draw chart-specific content
      renderFn(ctx, currentData, currentOptions);
    }
    
    lastDataRef.current = currentData;
  }, [renderFn]);
  
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);
  
  return canvasRef;
}

export function renderLineChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  options: ChartRendererOptions
): void {
  if (data.length === 0) return;
  
  const { dimensions, viewport, color = '#3b82f6', lineWidth = 2 } = options;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  let isFirst = true;
  
  // Render only visible points for performance
  const visibleData = data.filter((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    return transformed && transformed.x >= 0 && transformed.x <= dimensions.width;
  });
  
  visibleData.forEach((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    if (!transformed) return;
    
    if (isFirst) {
      ctx.moveTo(transformed.x, transformed.y);
      isFirst = false;
    } else {
      ctx.lineTo(transformed.x, transformed.y);
    }
  });
  
  ctx.stroke();
  
  // Draw points for last few data points
  const recentPoints = visibleData.slice(-10);
  ctx.fillStyle = color;
  recentPoints.forEach((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    if (transformed) {
      ctx.beginPath();
      ctx.arc(transformed.x, transformed.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function renderBarChart(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  options: ChartRendererOptions
): void {
  if (data.length === 0) return;
  
  const { dimensions, viewport, color = '#10b981' } = options;
  
  ctx.fillStyle = color;
  
  const visibleData = data.filter((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    return transformed && transformed.x >= 0 && transformed.x <= dimensions.width;
  });
  
  const barWidth = Math.max(2, (dimensions.width - dimensions.padding.left - dimensions.padding.right) / visibleData.length / 2);
  
  visibleData.forEach((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    if (!transformed) return;
    
    const { height, padding } = dimensions;
    const barHeight = height - padding.bottom - transformed.y;
    
    ctx.fillRect(
      transformed.x - barWidth / 2,
      transformed.y,
      barWidth,
      barHeight
    );
  });
}

export function renderScatterPlot(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  options: ChartRendererOptions
): void {
  if (data.length === 0) return;
  
  const { dimensions, viewport, color = '#f59e0b' } = options;
  
  ctx.fillStyle = color;
  
  data.forEach((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    if (!transformed) return;
    
    // Skip if outside viewport
    if (
      transformed.x < 0 ||
      transformed.x > dimensions.width ||
      transformed.y < 0 ||
      transformed.y > dimensions.height
    ) {
      return;
    }
    
    ctx.beginPath();
    ctx.arc(transformed.x, transformed.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  data: DataPoint[],
  options: ChartRendererOptions
): void {
  if (data.length === 0) return;
  
  const { dimensions, viewport } = options;
  const { width, height, padding } = dimensions;
  
  // Create a grid for heatmap
  const gridSize = 20;
  const gridX = Math.ceil((width - padding.left - padding.right) / gridSize);
  const gridY = Math.ceil((height - padding.top - padding.bottom) / gridSize);
  
  const grid: number[][] = Array(gridY)
    .fill(0)
    .map(() => Array(gridX).fill(0));
  
  // Count points in each grid cell
  data.forEach((point) => {
    const transformed = transformPoint(point, dimensions, viewport, data, options.valueRange);
    if (!transformed) return;
    
    const gridXIndex = Math.floor((transformed.x - padding.left) / gridSize);
    const gridYIndex = Math.floor((transformed.y - padding.top) / gridSize);
    
    if (
      gridXIndex >= 0 &&
      gridXIndex < gridX &&
      gridYIndex >= 0 &&
      gridYIndex < gridY
    ) {
      grid[gridYIndex][gridXIndex]++;
    }
  });
  
  // Find max count for normalization
  const maxCount = Math.max(...grid.flat());
  if (maxCount === 0) return;
  
  // Draw heatmap
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      const count = grid[y][x];
      if (count === 0) continue;
      
      const intensity = count / maxCount;
      const hue = (1 - intensity) * 240; // Blue to red
      
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(
        padding.left + x * gridSize,
        padding.top + y * gridSize,
        gridSize,
        gridSize
      );
    }
  }
}

