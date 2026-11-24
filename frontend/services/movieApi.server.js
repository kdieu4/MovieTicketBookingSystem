import { cache } from 'react';
import { mapCinema, mapMovie } from './movieApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const REVALIDATE_SECONDS = 60;

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`API ${path} trả về ${res.status}`);
  return res.json();
}

/** Mot trang phim theo trang thai, dung chung dinh dang voi client. */
export const getMoviePage = cache(async (status, { page = 0, size = 12 } = {}) => {
  const payload = await fetchJson(`/getMovies?status=${status}&page=${page}&size=${size}`);
  const currentPage = Number(payload.page ?? 0);
  const totalPages = Number(payload.totalPages ?? 0);

  return {
    items: (payload.content ?? []).map(mapMovie),
    page: currentPage,
    size: Number(payload.size ?? size),
    total: Number(payload.totalElements ?? 0),
    totalPages,
    hasMore: currentPage + 1 < totalPages,
    facets: (payload.genreFacets ?? []).map((facet) => ({
      id: facet.genreId,
      name: facet.name,
      count: Number(facet.count ?? 0),
    })),
  };
});

/** Ten phim dang chieu cho o goi y tim kiem. */
export const getMovieTitles = cache(async () => {
  const data = await fetchJson('/getMovieTitles?status=SHOWING');
  return Array.isArray(data) ? data : [];
});

/** Mot trang rap cho lan render dau, kem tong so rap de biet con trang sau khong. */
export const getCinemaPage = cache(async ({ page = 0, size = 9, city } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const path = city
    ? `/getCinemasByCity?city=${encodeURIComponent(city)}&${params.toString()}`
    : `/getCinemas?${params.toString()}`;

  const payload = await fetchJson(path);
  const currentPage = Number(payload.page ?? 0);
  const totalPages = Number(payload.totalPages ?? 0);

  return {
    items: (payload.content ?? []).map(mapCinema),
    page: currentPage,
    size: Number(payload.size ?? size),
    total: Number(payload.totalElements ?? 0),
    totalPages,
    hasMore: currentPage + 1 < totalPages,
  };
});

export const getCities = cache(async () => {
  const data = await fetchJson('/getCities');
  return Array.isArray(data) ? data : [];
});

export const getMovieReviews = cache(async (movieId) => {
  try {
    return await fetchJson(`/getMovieReviews?movieId=${movieId}`);
  } catch {
    // TMDB lỗi không được làm hỏng trang chi tiết phim
    return [];
  }
});

export const getMovieById = cache(async (id) => mapMovie(await fetchJson(`/getMovieById?id=${id}`)));
