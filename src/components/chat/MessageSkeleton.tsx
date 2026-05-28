export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-zinc-800 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="space-y-2">
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-5/6" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-4 bg-zinc-800 rounded-full w-24" />
          <div className="h-4 bg-zinc-800 rounded-full w-20" />
          <div className="h-4 bg-zinc-800 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
