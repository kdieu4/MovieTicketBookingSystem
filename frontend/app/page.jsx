import HomePageClient from './HomePageClient';
import { getMovieLists } from '@/services/movieApi.server';

// Dữ liệu phim đổi chậm: render sẵn ở server và làm mới mỗi phút thay vì đợi JS tải xong mới gọi API.
export const revalidate = 60;

export default async function Page() {
  const { nowShowing, comingSoon, genres, error } = await getMovieLists();

  return (
    <HomePageClient
      initialNowShowing={nowShowing}
      initialComingSoon={comingSoon}
      initialGenres={genres}
      initialError={error}
    />
  );
}
