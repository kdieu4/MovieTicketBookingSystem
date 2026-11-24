const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

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
    tmdbRating: movie.tmdbRating ?? null,
    tmdbVoteCount: movie.tmdbVoteCount ?? null,
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

export function mapCinema(cinema) {
  return {
    id: cinema.cinemaId ?? cinema.id,
    name: cinema.name,
    address: cinema.address ?? '',
    city: cinema.city ?? '',
    phone: cinema.phoneNumber ?? cinema.phone ?? null,
  };
}

// ---------------------------------------------------------------------------
// Phân trang: các hàm dưới đây luôn gửi page/size nên API trả về một trang kèm
// tổng số bản ghi. Số bản ghi mỗi trang do trang gọi quyết định.
// ---------------------------------------------------------------------------

export const MOVIE_PAGE_SIZE = 12;
export const CINEMA_PAGE_SIZE = 9;

/** Chuyển một trang của API thành dạng thống nhất cho hook usePagedGrid. */
function mapPage(payload, mapper) {
  const page = Number(payload?.page ?? 0);
  const totalPages = Number(payload?.totalPages ?? 0);

  return {
    items: (payload?.content ?? []).map(mapper),
    page,
    size: Number(payload?.size ?? 0),
    total: Number(payload?.totalElements ?? 0),
    totalPages,
    hasMore: page + 1 < totalPages,
  };
}

function movieFacets(payload) {
  return (payload?.genreFacets ?? []).map((facet) => ({
    id: facet.genreId,
    name: facet.name,
    count: Number(facet.count ?? 0),
  }));
}

async function fetchMoviePage(status, { genreIds, page = 0, size = MOVIE_PAGE_SIZE } = {}) {
  const params = new URLSearchParams({ status, page: String(page), size: String(size) });
  if (genreIds?.length) params.set('genreIds', genreIds.join(','));

  const res = await fetch(`${API_BASE_URL}/getMovies?${params.toString()}`, { cache: 'no-store' });
  const payload = await handleResponse(res);

  return { ...mapPage(payload, mapMovie), facets: movieFacets(payload) };
}

export function fetchNowShowingMoviesPage(options) {
  return fetchMoviePage('SHOWING', options);
}

export function fetchComingSoonMoviesPage(options) {
  return fetchMoviePage('UPCOMING', options);
}

/** Tên phim đang chiếu, dùng cho ô gợi ý tìm kiếm. */
export async function fetchMovieTitles() {
  const res = await fetch(`${API_BASE_URL}/getMovieTitles?status=SHOWING`);
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : [];
}

/** Một trang rạp; truyền city để lọc theo thành phố. */
export async function fetchCinemasPage({ city, page = 0, size = CINEMA_PAGE_SIZE } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const path = city
    ? `/getCinemasByCity?city=${encodeURIComponent(city)}&${params.toString()}`
    : `/getCinemas?${params.toString()}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store' });
  const payload = await handleResponse(res);
  return mapPage(payload, mapCinema);
}

/** Danh sách thành phố có rạp, dùng cho bộ lọc. */
export async function fetchCities() {
  const res = await fetch(`${API_BASE_URL}/getCities`);
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : [];
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