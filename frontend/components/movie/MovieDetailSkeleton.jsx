export default function MovieDetailSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-5 py-8 md:px-8" aria-busy="true">
      <div className="flex animate-pulse gap-6 motion-reduce:animate-none">
        <div className="aspect-[3/4] w-[150px] shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-fill-tertiary)] md:w-[200px]" />
        <div className="flex flex-1 flex-col gap-3 pt-2">
          <div className="h-6 w-24 rounded-full bg-[var(--color-fill-tertiary)]" />
          <div className="h-8 w-2/3 rounded-[var(--radius-sm)] bg-[var(--color-fill-tertiary)]" />
          <div className="h-4 w-1/3 rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
          <div className="mt-2 h-3 w-full max-w-md rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
          <div className="h-3 w-5/6 max-w-md rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
          <div className="h-3 w-2/3 max-w-md rounded-[var(--radius-xs)] bg-[var(--color-fill-tertiary)]" />
        </div>
      </div>
    </div>
  );
}