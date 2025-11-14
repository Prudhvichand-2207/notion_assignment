export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
  frameCount: number;
  lastFrameTime: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationPeriod {
  label: string;
  value: number; // milliseconds
}

export interface FilterOptions {
  categories: string[];
  valueRange: [number, number];
  timeRange: TimeRange;
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface Viewport {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

