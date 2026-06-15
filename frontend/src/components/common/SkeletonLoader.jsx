import React from 'react';

export default function SkeletonLoader({ rows = 5, fullPage = false }) {
  if (fullPage) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      ))}
    </div>
  );
}
