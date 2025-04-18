'use client';

// Force dynamic rendering to avoid build-time errors
export const renderMode = 'force-dynamic';

import dynamic from 'next/dynamic';

// Use dynamic import to load the component only on the client side
const CrisprPageClient = dynamic(
  () => import('@/components/crisprPredictor/CrisprPageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mb-8"></div>
          <div className="h-64 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    ) 
  }
);

export default function CrisprPage() {
  return <CrisprPageClient />;
} 