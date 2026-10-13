// Lớp gọi API cho trang chủ. Đi theo đúng pattern GET /api/movies?status=&genreIds=&title=
// và GET /api/genres đã có ở movie_service. Đổi API_BASE_URL hoặc field mapping bên dưới
// nếu DTO thật (MovieResponse) đặt tên khác.

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8083/api';

async function handleResponse(res) {
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Yêu cầu thất bại (${res.status})`);
  }
  return res.json();
}

function mapMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    posterUrl: movie.posterUrl ?? null,
    genres: (movie.genres ?? []).map((g) => g.name),
    durationMinutes: movie.durationMinutes ?? movie.duration ?? null,
    ageRestriction: movie.ageRestriction ?? null,
    status: movie.status,
    description: movie.description ?? '',
    releaseDate: movie.releaseDate ?? null,
  };
}

export async function fetchNowShowingMovies({ genreIds, title } = {}) {
  const params = new URLSearchParams({ status: 'SHOWING' });
  if (genreIds?.length) params.set('genreIds', genreIds.join(','));
  if (title) params.set('title', title);

  const res = await fetch(`${API_BASE_URL}/movies?${params.toString()}`);
  const data = await handleResponse(res);
  return data.map(mapMovie);
}

export async function fetchComingSoonMovies() {
  const params = new URLSearchParams({ status: 'UPCOMING' });
  const res = await fetch(`${API_BASE_URL}/movies?${params.toString()}`);
  const data = await handleResponse(res);
  return data.map(mapMovie);
}

function mapGenre(genre) {
  return {
    id: genre.id ?? genre.genreId ?? genre.name,
    name: genre.name,
  };
}

export async function fetchGenres() {
  const res = await fetch(`${API_BASE_URL}/genres`);
  const data = await handleResponse(res);
  return data.map(mapGenre);
}