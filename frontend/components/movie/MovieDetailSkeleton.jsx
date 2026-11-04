import { Skeleton } from '@/components/common/Ascii';

export default function MovieDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8" aria-busy="true">
      <div className="flex gap-6">
        <Skeleton
          rows={10}
          className="aspect-[3/4] w-[150px] shrink-0 rounded-[var(--radius-lg)] md:w-[200px]"
        />
        <div className="flex flex-1 flex-col gap-3 pt-2">
          <Skeleton rows={1} width={96} height={24} className="rounded-full" />
          <Skeleton rows={2} width="66%" height={32} className="rounded-[var(--radius-sm)]" />
          <Skeleton lines={3} widths={['33%', '100%', '66%']} />
        </div>
      </div>
    </div>
  );
}
