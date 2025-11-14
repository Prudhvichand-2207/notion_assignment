# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Dashboard
Navigate to: http://localhost:3000/dashboard

## 🎮 Using the Dashboard

### Basic Controls

1. **Start/Stop Stream**: Click the green "Start Stream" button to begin receiving real-time data
2. **Change Chart Type**: Click on Line, Bar, Scatter, or Heatmap buttons
3. **Zoom**: Scroll with mouse wheel on the chart
4. **Pan**: Click and drag on the chart
5. **Filter Data**: Use the Filter Panel to filter by category or value range
6. **Aggregate Data**: Use Time Range Selector to aggregate data by time periods

### Performance Testing

1. **Monitor FPS**: Watch the Performance Monitor panel (top left)
2. **Adjust Data Points**: Use the "Max Data Points" slider to test with different loads
3. **Stress Test**: 
   - Set max points to 50,000
   - Enable real-time stream
   - Monitor FPS counter

### Expected Performance

- ✅ **10,000 points**: Should maintain 60fps
- ✅ **50,000 points**: Should maintain 30fps+
- ✅ **Memory**: Should stay stable (< 50MB)
- ✅ **Interactions**: Should respond instantly (< 100ms)

## 🐛 Troubleshooting

### Canvas Not Rendering
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

### Low FPS
- Reduce max data points
- Enable data aggregation
- Close other browser tabs

### High Memory Usage
- Reduce max data points
- Refresh the page periodically
- Check for browser extensions causing issues

## 📚 Next Steps

- Read [README.md](./README.md) for detailed documentation
- Read [PERFORMANCE.md](./PERFORMANCE.md) for performance analysis
- Explore the codebase to understand the architecture

