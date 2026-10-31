import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-stone-200/70 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading overview content...">
      {/* Hero skeleton */}
      <div className="h-44 bg-stone-200/70 rounded-xl w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-stone-200/80 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-40 bg-stone-200/60 rounded-lg" />
            <div className="h-40 bg-stone-200/60 rounded-lg" />
            <div className="h-40 bg-stone-200/60 rounded-lg" />
            <div className="h-40 bg-stone-200/60 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-stone-200/80 rounded w-1/2" />
          <div className="h-32 bg-stone-200/60 rounded-lg" />
          <div className="h-32 bg-stone-200/60 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
