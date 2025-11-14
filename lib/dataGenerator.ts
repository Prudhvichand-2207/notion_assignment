import { DataPoint } from './types';

const CATEGORIES = ['CPU', 'Memory', 'Network', 'Disk', 'Temperature'];
const BASE_VALUES: Record<string, number> = {
  CPU: 50,
  Memory: 60,
  Network: 40,
  Disk: 30,
  Temperature: 25,
};

export function generateDataPoint(
  timestamp: number,
  category?: string
): DataPoint {
  const cat = category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const baseValue = BASE_VALUES[cat] || 50;
  
  // Generate realistic time-series data with some noise
  const noise = (Math.random() - 0.5) * 20;
  const trend = Math.sin(timestamp / 10000) * 10;
  const value = Math.max(0, Math.min(100, baseValue + noise + trend));

  return {
    timestamp,
    value: Math.round(value * 100) / 100,
    category: cat,
    metadata: {
      source: 'simulated',
      quality: Math.random() > 0.1 ? 'good' : 'degraded',
    },
  };
}

export function generateInitialDataset(count: number = 1000): DataPoint[] {
  const now = Date.now();
  const data: DataPoint[] = [];
  
  // Generate data points going back in time
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * 100); // 100ms intervals
    data.push(generateDataPoint(timestamp));
  }
  
  return data;
}

export function generateBatch(
  startTime: number,
  count: number,
  interval: number = 100
): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const timestamp = startTime + (i * interval);
    data.push(generateDataPoint(timestamp));
  }
  return data;
}

export function aggregateData(
  data: DataPoint[],
  periodMs: number
): DataPoint[] {
  if (data.length === 0) return [];
  
  const aggregated: DataPoint[] = [];
  const buckets = new Map<number, DataPoint[]>();
  
  // Group data points into time buckets
  data.forEach((point) => {
    const bucketTime = Math.floor(point.timestamp / periodMs) * periodMs;
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(point);
  });
  
  // Aggregate each bucket (average value, most common category)
  buckets.forEach((points, bucketTime) => {
    const avgValue =
      points.reduce((sum, p) => sum + p.value, 0) / points.length;
    
    const categoryCounts = new Map<string, number>();
    points.forEach((p) => {
      categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
    });
    
    const mostCommonCategory = Array.from(categoryCounts.entries()).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['CPU', 0]
    )[0];
    
    aggregated.push({
      timestamp: bucketTime,
      value: Math.round(avgValue * 100) / 100,
      category: mostCommonCategory,
      metadata: {
        aggregated: true,
        pointCount: points.length,
      },
    });
  });
  
  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}

