import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Skeleton from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
        <div className="space-y-3">
          <Skeleton width={96} height={16} className="rounded" />
          <Skeleton width={224} height={36} className="rounded" />
          <Skeleton width={320} height={16} className="rounded" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[2/3] w-full rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
