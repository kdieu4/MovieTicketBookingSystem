import { useMemo, useState } from 'react';
import MovieCard from './MovieCard';

const PAGE_SIZE = 15;

// movies: toàn bộ phim đang chiếu, đã map theo movieApi.fetchNowShowingMovies
//   (mỗi movie.genres là mảng TÊN thể loại, ví dụ ['Hành động', 'Viễn tưởng'])
// genres: danh sách thể loại từ backend, dạng [{ id, name }] — chỉ dùng để hiển thị nhãn tab
// onSelectShowtime(movie): điều hướng sang trang chọn suất chiếu
export default function NowShowingSection({ movies = [], genres = [], loading, onSelectShowtime }) {
  // Lọc theo TÊN thể loại (so sánh chuỗi) thay vì so theo id của backend.
  // Lý do: ở response /api/genres, field id có thể không tồn tại hoặc đặt tên
  // khác (ví dụ genreId) khiến genre.id bị undefined cho mọi phần tử — khi đó
  // state đang chọn cũng là undefined, và undefined === undefined đúng với
  // TẤT CẢ tab, nên bấm 1 tab lại làm mọi tab cùng sáng. So theo tên luôn có
  // giá trị thật nên tránh được lỗi này, kể cả khi id của backend chưa chuẩn.
  const [activeGenre, setActiveGenre] = useState(null); // null = "Tất cả"
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredMovies = useMemo(() => {
    if (!activeGenre) return movies;
    return movies.filter((movie) => movie.genres?.includes(activeGenre));
  }, [movies, activeGenre]);

  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMovies.length;

  function handleTabClick(genreName) {
    setActiveGenre(genreName);
    setVisibleCount(PAGE_SIZE); // về lại trang đầu khi đổi thể loại
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Phim đang chiếu</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Chọn phim yêu thích và xem lịch chiếu gần bạn.
          </p>
        </div>
        <a
          href="/phim"
          className="text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)]"
        >
          Xem tất cả →
        </a>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <TabButton active={activeGenre === null} onClick={() => handleTabClick(null)}>
          Tất cả
        </TabButton>
        {genres.map((genre) => (
          <TabButton key={genre.id ?? genre.name} active={activeGenre === genre.name} onClick={() => handleTabClick(genre.name)}>
            {genre.name}
          </TabButton>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onSelectShowtime={onSelectShowtime} />
            ))}
      </div>

      {!loading && filteredMovies.length === 0 && (
        <p className="mt-6 text-sm text-[var(--color-text-tertiary)]">Chưa có phim nào ở thể loại này.</p>
      )}

      {!loading && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-full border border-[var(--color-border-opaque-separator)] px-5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-fill-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          >
            Xem thêm
          </button>
        </div>
      )}
    </section>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
        active
          ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-on-primary)]'
          : 'bg-[var(--color-fill-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)]">
      <div className="aspect-[3/4] bg-[var(--color-fill-tertiary)]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-[var(--color-fill-tertiary)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-fill-tertiary)]" />
      </div>
    </div>
  );
}