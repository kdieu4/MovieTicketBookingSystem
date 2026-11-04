import { cache } from 'react';
import { mapCinema, mapGenre, mapMovie } from './movieApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api';
const REVALIDATE_SECONDS = 60;

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`API ${path} trả về ${res.status}`);
  return res.json();
}

export const getNowShowingMovies = cache(async () =>
  (await fetchJson('/getMovies?status=SHOWING')).map(mapMovie)
);

export const getComingSoonMovies = cache(async () =>
  (await fetchJson('/getMovies?status=UPCOMING')).map(mapMovie)
);

export const getGenres = cache(async () => (await fetchJson('/getGenres')).map(mapGenre));

export const getCinemas = cache(async () => (await fetchJson('/getCinemas')).map(mapCinema));

export const getMovieById = cache(async (id) => mapMovie(await fetchJson(`/getMovieById?id=${id}`)));

// Trang chủ và trang thư viện dùng chung một lần tải, lỗi ở mục nào chỉ ảnh hưởng mục đó.
export async function getMovieLists() {
  const [showing, upcoming, genres] = await Promise.allSettled([
    getNowShowingMovies(),
    getComingSoonMovies(),
    getGenres(),
  ]);

  return {
    nowShowing: showing.status === 'fulfilled' ? showing.value : [],
    comingSoon: upcoming.status === 'fulfilled' ? upcoming.value : [],
    genres: genres.status === 'fulfilled' ? genres.value : [],
    error: showing.status === 'rejected',
  };
}
