import { NextRequest, NextResponse } from 'next/server';
import { generateInitialDataset, generateDataPoint } from '@/lib/dataGenerator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const count = parseInt(searchParams.get('count') || '1000', 10);
  const timestamp = parseInt(searchParams.get('timestamp') || Date.now().toString(), 10);
  
  if (searchParams.get('stream') === 'true') {
    // Return a single new data point for streaming
    const point = generateDataPoint(timestamp);
    return NextResponse.json(point);
  }
  
  // Return initial dataset
  const data = generateInitialDataset(count);
  return NextResponse.json(data);
}

