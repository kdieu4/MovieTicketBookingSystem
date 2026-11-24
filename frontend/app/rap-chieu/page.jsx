import CinemasPage from './CinemasPageClient';
import { CINEMA_PAGE_SIZE } from '@/services/movieApi';
import { getCinemaPage, getCities } from '@/services/movieApi.server';

export const revalidate = 60;

export default async function Page() {
  const [cinemaPage, cities] = await Promise.all([
    getCinemaPage({ size: CINEMA_PAGE_SIZE }).catch(() => null),
    getCities().catch(() => []),
  ]);

  return (
    <CinemasPage
      initialPage={cinemaPage}
      cities={cities}
      error={cinemaPage === null}
    />
  );
}
