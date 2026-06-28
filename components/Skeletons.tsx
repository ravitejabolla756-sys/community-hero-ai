export function IssueCardSkeleton() {
  return (
    <div className="premium-card overflow-hidden rounded-lg">
      <div className="skeleton h-48" />
      <div className="space-y-4 p-5">
        <div className="flex gap-2">
          <div className="skeleton h-7 w-20 rounded-full" />
          <div className="skeleton h-7 w-28 rounded-full" />
        </div>
        <div className="skeleton h-6 w-4/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex justify-between border-t border-slate-100 pt-4">
          <div className="skeleton h-5 w-28 rounded" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <IssueCardSkeleton key={index} />
      ))}
    </>
  );
}
