'use client';

import dynamic from 'next/dynamic';

// Import the client component with dynamic loading
const DashboardClient = dynamic(() => import('@/components/DashboardClient'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950/90 to-gray-900">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-4 rounded-full border-t-2 border-l-2 border-cyan-400 animate-spin-slow"></div>
        </div>
        <p className="text-indigo-300">Loading dashboard...</p>
      </div>
    </div>
  )
});

export default function DashboardWrapper() {
  return <DashboardClient />;
} 