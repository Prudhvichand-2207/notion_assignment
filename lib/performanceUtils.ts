export interface FrameMetrics {
  frameTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private frameTimes: FrameMetrics[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private readonly maxSamples = 60; // Keep last 60 frames
  
  update(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.frameTimes.push({
      frameTime,
      timestamp: now,
    });
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
  }
  
  getFPS(): number {
    if (this.frameTimes.length < 2) return 0;
    
    const recentFrames = this.frameTimes.slice(-10);
    const avgFrameTime =
      recentFrames.reduce((sum, f) => sum + f.frameTime, 0) / recentFrames.length;
    
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }
  
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    
    return (
      this.frameTimes.reduce((sum, f) => sum + f.frameTime, 0) /
      this.frameTimes.length
    );
  }
  
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return mem.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }
}

export function measurePerformance<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (label && duration > 16) {
    // Log slow operations (> 16ms)
    console.warn(`[Performance] ${label} took ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

