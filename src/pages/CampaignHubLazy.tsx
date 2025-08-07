import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the CampaignHub for better performance
const CampaignHub = lazy(() => import('./CampaignHub'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
      <p className="text-gray-600">Loading Campaign Hub...</p>
    </div>
  </div>
);

export default function CampaignHubLazy() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CampaignHub />
    </Suspense>
  );
}