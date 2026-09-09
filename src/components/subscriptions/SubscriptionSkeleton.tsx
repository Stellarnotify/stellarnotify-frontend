export function SubscriptionSkeleton() {
  return (
    <div className="card animate-pulse" role="status" aria-label="Loading subscription">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3 flex-1">
          {/* Status badge and ID */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-full" />
            <div className="h-4 w-24 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded" />
          </div>
          
          {/* Contract address */}
          <div className="h-4 w-full max-w-md bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded" />
          
          {/* Channel and topics */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded" />
          </div>
          
          {/* Expiry countdown */}
          <div className="h-4 w-40 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg" />
          </div>
          <div className="h-8 w-20 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
