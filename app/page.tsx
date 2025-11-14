import { redirect } from 'next/navigation';

export default function Home() {
  // Permanent redirect to dashboard
  redirect('/dashboard');
}

// Ensure this route is not statically generated to allow redirect
export const dynamic = 'force-dynamic';

