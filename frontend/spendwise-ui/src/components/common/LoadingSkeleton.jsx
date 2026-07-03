export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="card overflow-hidden">
      <div className="space-y-3">
        <div className="flex gap-4 pb-3 border-b border-surface-200 dark:border-surface-700">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 py-2">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className="skeleton h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-5 w-40 mb-4" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}
