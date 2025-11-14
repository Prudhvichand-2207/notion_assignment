import { generateInitialDataset } from '@/lib/dataGenerator';
import DashboardWrapper from './DashboardWrapper';

// Ensure this page is dynamically rendered for Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Server Component: Generate initial data on the server
  const initialData = generateInitialDataset(1000);
  
  return <DashboardWrapper initialData={initialData} />;
}

