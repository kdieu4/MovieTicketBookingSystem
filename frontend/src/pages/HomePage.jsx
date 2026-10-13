import { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import NowShowingSection from '../components/NowShowingSection';
import ComingSoonSection from '../components/ComingSoonSection';
import Footer from '../components/Footer';
import { fetchNowShowingMovies, fetchComingSoonMovies, fetchGenres } from '../services/movieApi';

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [genres, setGenres] = useState([]);
  
  const [loadingNowShowing, setLoadingNowShowing] = useState(true);
  const [loadingComingSoon, setLoadingComingSoon] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Tải danh sách phim đang chiếu (Ưu tiên số 1 - Hiển thị ngay khi có data)
    fetchNowShowingMovies()
      .then((data) => {
        if (!cancelled) setNowShowing(data);
      })
      .catch((err) => {
        if (!cancelled) setError('Không thể tải danh sách phim đang chiếu.');
      })
      .finally(() => {
        if (!cancelled) setLoadingNowShowing(false);
      });

    // 2. Tải danh sách thể loại song song (Không chặn render danh sách phim)
    fetchGenres()
      .then((data) => {
        if (!cancelled) setGenres(data);
      })
      .catch(() => {
        // Lỗi thể loại không ảnh hưởng đến việc xem danh sách phim chính
      });

    // 3. Tải danh sách phim sắp chiếu (Ưu tiên thấp hơn)
    fetchComingSoonMovies()
      .then((data) => {
        if (!cancelled) setComingSoon(data);
      })
      .catch(() => {
        // Lỗi phim sắp chiếu xử lý độc lập
      })
      .finally(() => {
        if (!cancelled) setLoadingComingSoon(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectShowtime(movie) {
    // Điều hướng sang trang chọn suất chiếu
  }

  const featuredMovie = nowShowing[0]
    ? {
        ...nowShowing[0],
        trailerUrl: nowShowing[0].trailerUrl ?? null,
        bookingUrl: `/phim/${nowShowing[0].id}/suat-chieu`,
      }
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-[var(--color-brand-primary)] selection:text-[var(--color-brand-on-primary)] transition-colors duration-200">
      <Header />

      <main className="pb-8">
        <HeroSection
          featuredMovie={featuredMovie}
          movieTitles={nowShowing.map((m) => m.title)}
        />

        {error && (
          <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-system-error)]/40 bg-[var(--color-system-error)]/10 px-4 py-3 text-sm font-medium text-[var(--color-system-error)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[var(--color-system-error)]" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <NowShowingSection
          movies={nowShowing}
          genres={genres}
          loading={loadingNowShowing}
          onSelectShowtime={handleSelectShowtime}
        />

        <ComingSoonSection movies={comingSoon} loading={loadingComingSoon} />
      </main>

      <Footer />
    </div>
  );
}