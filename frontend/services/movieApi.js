const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8083/api';

const cache = new Map();
const CACHE_TIME_MS = 5 * 60 * 1000;

async function fetchWithCache(cacheKey, url) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TIME_MS) {
    return cached.data;
  }

  const res = await fetch(url);
  const data = await handleResponse(res);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

async function handleResponse(res) {
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Yêu cầu thất bại (${res.status})`);
  }
  return res.json();
}

export function mapMovie(movie) {
  return {
    id: movie.movieId ?? movie.id,
    title: movie.title,
    posterUrl: movie.posterUrl ?? null,
    genres: (movie.genres ?? []).map((g) => (typeof g === 'string' ? g : g.name)),
    durationMinutes: movie.durationMinutes ?? movie.duration ?? null,
    ageRestriction: movie.ageRestriction ?? null,
    status: movie.status,
    description: movie.description ?? '',
    releaseDate: movie.releaseDate ?? null,
    trailerUrl: movie.trailerUrl ?? null,
    director: movie.director ?? null,
    actors: movie.actors ?? null,
  };
}

export function mapGenre(genre) {
  return {
    id: genre.genreId ?? genre.id ?? genre.name,
    name: genre.name,
  };
}

function mapShowtime(showtime) {
  return {
    id: showtime.showtimeId ?? showtime.id,
    movieId: showtime.movieId,
    roomId: showtime.roomId,
    roomName: showtime.roomName ?? showtime.room?.name ?? null,
    roomType: showtime.roomType ?? showtime.room?.roomType ?? null,
    cinemaId: showtime.cinemaId ?? showtime.room?.cinema?.cinemaId ?? null,
    cinemaName: showtime.cinemaName ?? showtime.room?.cinema?.name ?? 'Rạp chiếu',
    cinemaAddress: showtime.cinemaAddress ?? showtime.room?.cinema?.address ?? null,
    cinemaCity: showtime.cinemaCity ?? showtime.room?.cinema?.city ?? null,
    startTime: showtime.startTime,
    endTime: showtime.endTime ?? null,
    basePrice: showtime.basePrice ?? null,
    status: showtime.status ?? null,
  };
}

export async function fetchNowShowingMovies({ genreIds, title } = {}) {
  const params = new URLSearchParams({ status: 'SHOWING' });
  if (genreIds?.length) params.set('genreIds', genreIds.join(','));
  if (title) params.set('title', title);

  const url = `${API_BASE_URL}/getMovies?${params.toString()}`;

  if (genreIds?.length || title) {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await handleResponse(res);
    return data.map(mapMovie);
  }

  const data = await fetchWithCache('movies-showing', url);
  return data.map(mapMovie);
}

export async function fetchComingSoonMovies() {
  const params = new URLSearchParams({ status: 'UPCOMING' });
  const url = `${API_BASE_URL}/getMovies?${params.toString()}`;

  const data = await fetchWithCache('movies-upcoming', url);
  return data.map(mapMovie);
}

export async function fetchGenres() {
  const url = `${API_BASE_URL}/getGenres`;
  const data = await fetchWithCache('genres', url);
  return data.map(mapGenre);
}

export function mapCinema(cinema) {
  return {
    id: cinema.cinemaId ?? cinema.id,
    name: cinema.name,
    address: cinema.address ?? '',
    city: cinema.city ?? '',
    phone: cinema.phoneNumber ?? cinema.phone ?? null,
  };
}

export async function fetchCinemas() {
  const url = `${API_BASE_URL}/getCinemas`;
  const data = await fetchWithCache('cinemas', url);
  return data.map(mapCinema);
}

export async function fetchMovieById(id) {
  const url = `${API_BASE_URL}/getMovieById?id=${id}`;
  const data = await fetchWithCache(`movie-${id}`, url);
  return mapMovie(data);
}

export async function fetchShowtimesByMovie(id) {
  const url = `${API_BASE_URL}/getShowtimes?movieId=${id}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await handleResponse(res);
  return data.map(mapShowtime);
}

export async function fetchSeatsByRoom(roomId) {
  if (!roomId) return [];
  const url = `${API_BASE_URL}/getSeatsByRoomId?roomId=${roomId}`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await handleResponse(res);
  return data.map((seat) => ({
    id: seat.seatId ?? seat.id,
    row: seat.seatRow,
    number: seat.seatNumber,
    type: seat.seatType ?? 'NORMAL',
  }));
}