import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MovieDetailSkeleton from '@/components/movie/MovieDetailSkeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <main className="flex-1">
        <MovieDetailSkeleton />
      </main>
      <Footer />
    </div>
  );
}
