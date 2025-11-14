'use client';

import { DataProvider } from '@/components/providers/DataProvider';
import { DataPoint } from '@/lib/types';
import DashboardClient from './DashboardClient';

export default function DashboardWrapper({ initialData }: { initialData: DataPoint[] }) {
  return (
    <DataProvider initialData={initialData}>
      <DashboardClient />
    </DataProvider>
  );
}

