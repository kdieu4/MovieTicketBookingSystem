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
  const [error, setError] = useState(null);

  // Tải toàn bộ phim đang chiếu một lần; việc lọc theo thể loại khi bấm tab
  // được NowShowingSection xử lý ở client, không gọi lại API mỗi lần đổi tab.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [nowShowingData, comingSoonData, genresData] = await Promise.all([
          fetchNowShowingMovies(),
          fetchComingSoonMovies(),
          fetchGenres(),
        ]);
        if (cancelled) return;
        setNowShowing(nowShowingData);
        setComingSoon(comingSoonData);
        setGenres(genresData);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoadingNowShowing(false);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectShowtime(movie) {
    // Điều hướng sang luồng chọn suất chiếu / chọn ghế, ví dụ:
    // navigate(`/phim/${movie.id}/suat-chieu`)
  }

  const featuredMovie = nowShowing[0]
    ? {
        ...nowShowing[0],
        trailerUrl: nowShowing[0].trailerUrl ?? null,
        bookingUrl: `/phim/${nowShowing[0].id}/suat-chieu`,
      }
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />

      <main>
        <HeroSection
          featuredMovie={featuredMovie}
          movieTitles={nowShowing.map((m) => m.title)}
        />

        {error && (
          <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="rounded-lg border border-[var(--color-system-error)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm text-[var(--color-system-error)]">
              Không tải được dữ liệu phim. Vui lòng thử lại sau.
            </p>
          </div>
        )}

        <NowShowingSection
          movies={nowShowing}
          genres={genres}
          loading={loadingNowShowing}
          onSelectShowtime={handleSelectShowtime}
        />

        <ComingSoonSection movies={comingSoon} />
      </main>

      <Footer />
    </div>
  );
}