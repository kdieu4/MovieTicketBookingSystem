import HomePageClient from './HomePageClient';
import { getMoviePage, getMovieTitles } from '@/services/movieApi.server';

// Dữ liệu phim đổi chậm: render sẵn trang phim đầu tiên ở server và làm mới mỗi
// phút. Danh sách phim đầy đủ do MoviesSection tự tải theo trang ở client.
export const revalidate = 60;

export default async function Page() {
  const [showingPage, movieTitles] = await Promise.all([
    getMoviePage('SHOWING').catch(() => null),
    getMovieTitles().catch(() => []),
  ]);

  return (
    <HomePageClient
      initialNowShowing={showingPage?.items ?? []}
      movieTitles={movieTitles}
      initialError={showingPage === null}
    />
  );
}
