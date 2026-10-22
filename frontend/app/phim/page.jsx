import { MoviesPage } from './MoviesPageClient';
import { getMovieLists } from '@/services/movieApi.server';

export const revalidate = 60;

export default async function Page() {
  const { nowShowing, comingSoon, genres, error } = await getMovieLists();

  return (
    <MoviesPage
      nowShowing={nowShowing}
      comingSoon={comingSoon}
      genres={genres}
      error={error}
    />
  );
}
