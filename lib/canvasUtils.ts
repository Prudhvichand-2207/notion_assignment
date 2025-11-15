import { DataPoint, ChartDimensions, Viewport } from './types';

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  dimensions: ChartDimensions,
  viewport: Viewport,
  data: DataPoint[],
  valueRange?: [number, number]
): void {
  if (data.length === 0) return;
  
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  const { width, height, padding } = dimensions;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Get time range from data
  const times = data.map((d) => d.timestamp);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeRange = maxTime - minTime;
  
  // Get value range - use provided or calculate from data
  const values = data.map((d) => d.value);
  const minValue = valueRange ? valueRange[0] : Math.min(...values);
  const maxValue = valueRange ? valueRange[1] : Math.max(...values);
  const valRange = maxValue - minValue || 1;
  
  // Draw horizontal grid lines
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
  
  // Draw vertical grid lines
  const timeGridLines = 10;
  for (let i = 0; i <= timeGridLines; i++) {
    const x = padding.left + (chartWidth / timeGridLines) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  dimensions: ChartDimensions,
  data: DataPoint[],
  valueRange?: [number, number]
): void {
  if (data.length === 0) return;
  
  const { width, height, padding } = dimensions;
  
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#333';
  ctx.font = '12px sans-serif';
  
  // Draw X axis
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
  
  // Draw Y axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();
  
  // Draw labels
  const times = data.map((d) => d.timestamp);
  const values = data.map((d) => d.value);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minValue = valueRange ? valueRange[0] : Math.min(...values);
  const maxValue = valueRange ? valueRange[1] : Math.max(...values);
  
  // Y-axis labels
  const chartHeight = height - padding.top - padding.bottom;
  const valRange = maxValue - minValue || 1;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (valRange / 5) * (5 - i);
    const y = padding.top + (chartHeight / 5) * i;
    const label = value.toFixed(1);
    // Draw background for better visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(padding.left - textWidth - 8, y - 8, textWidth + 4, 16);
    // Draw text
    ctx.fillStyle = '#333';
    ctx.fillText(label, padding.left - 5, y);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  
  // X-axis labels (time)
  const chartWidth = width - padding.left - padding.right;
  const timeRange = maxTime - minTime;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 5; i++) {
    const time = minTime + (timeRange / 5) * i;
    const x = padding.left + (chartWidth / 5) * i;
    const date = new Date(time);
    const label = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    // Draw background for better visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(x - textWidth / 2 - 4, height - padding.bottom + 5, textWidth + 8, 20);
    // Draw text
    ctx.fillStyle = '#333';
    ctx.fillText(label, x, height - padding.bottom + 8);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

export function transformPoint(
  point: DataPoint,
  dimensions: ChartDimensions,
  viewport: Viewport,
  data: DataPoint[],
  valueRange?: [number, number]
): { x: number; y: number } | null {
  if (data.length === 0) return null;
  
  const { width, height, padding } = dimensions;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const times = data.map((d) => d.timestamp);
  const values = data.map((d) => d.value);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  // Use provided value range or calculate from data
  const minValue = valueRange ? valueRange[0] : Math.min(...values);
  const maxValue = valueRange ? valueRange[1] : Math.max(...values);
  
  const timeRange = maxTime - minTime || 1;
  const valRange = maxValue - minValue || 1;
  
  const normalizedX = (point.timestamp - minTime) / timeRange;
  const normalizedY = (point.value - minValue) / valRange;
  
  const x = padding.left + normalizedX * chartWidth * viewport.scaleX + viewport.x;
  const y = height - padding.bottom - normalizedY * chartHeight * viewport.scaleY + viewport.y;
  
  return { x, y };
}

export function getPointAtPixel(
  x: number,
  y: number,
  dimensions: ChartDimensions,
  viewport: Viewport,
  data: DataPoint[]
): DataPoint | null {
  if (data.length === 0) return null;
  
  const { width, height, padding } = dimensions;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const times = data.map((d) => d.timestamp);
  const values = data.map((d) => d.value);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const timeRange = maxTime - minTime || 1;
  const valueRange = maxValue - minValue || 1;
  
  const adjustedX = (x - padding.left - viewport.x) / viewport.scaleX;
  const adjustedY = (height - padding.bottom - y - viewport.y) / viewport.scaleY;
  
  const normalizedX = adjustedX / chartWidth;
  const normalizedY = adjustedY / chartHeight;
  
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
    return null;
  }
  
  const timestamp = minTime + normalizedX * timeRange;
  const value = minValue + normalizedY * valueRange;
  
  // Find closest data point
  let closest: DataPoint | null = null;
  let minDistance = Infinity;
  
  data.forEach((point) => {
    const distance = Math.abs(point.timestamp - timestamp) + Math.abs(point.value - value) * 10;
    if (distance < minDistance) {
      minDistance = distance;
      closest = point;
    }
  });
  
  return closest;
}

