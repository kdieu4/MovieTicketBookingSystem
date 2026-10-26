import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/common/Ascii';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
        <div className="space-y-3">
          <Skeleton rows={1} width={96} height={16} className="rounded" />
          <Skeleton rows={2} width={288} height={36} className="rounded" />
          <Skeleton rows={1} width={384} height={16} className="rounded" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} rows={10} className="h-[168px] w-full rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
