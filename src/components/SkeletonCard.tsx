export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/7 bg-dark-800 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: airline */}
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>

        {/* Center: route */}
        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="space-y-1 text-center">
            <div className="skeleton mx-auto h-5 w-16 rounded" />
            <div className="skeleton mx-auto h-3 w-10 rounded" />
          </div>
          <div className="space-y-1 flex-1 flex flex-col items-center">
            <div className="skeleton h-px w-full" />
            <div className="skeleton h-3 w-14 rounded" />
          </div>
          <div className="space-y-1 text-center">
            <div className="skeleton mx-auto h-5 w-16 rounded" />
            <div className="skeleton mx-auto h-3 w-10 rounded" />
          </div>
        </div>

        {/* Right: price */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-7 w-28 rounded-full" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
