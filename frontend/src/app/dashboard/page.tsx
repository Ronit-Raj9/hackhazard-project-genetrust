'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false to avoid Wagmi hooks being called during SSR
const DashboardWrapper = dynamic(
  () => import('@/components/dashboard/DashboardWrapper'),
  { ssr: false }
);

export default function DashboardPage() {
  return <DashboardWrapper />;
}