export const AGE_LABEL = {
  P: 'P - Phổ biến',
  K: 'K - Dưới 13 tuổi cần người lớn đi kèm',
  T13: 'T13',
  T16: 'T16',
  T18: 'T18',
};

export const STATUS_LABEL = {
  SHOWING: 'Đang chiếu',
  UPCOMING: 'Sắp chiếu',
  ENDED: 'Ngừng chiếu',
};

export const SEAT_TYPE_SURCHARGE = {
  NORMAL: 0,
  VIP: 20000,
  SWEETBOX: 40000,
  DOUBLE: 40000,
  COUPLE: 40000,
  ACCESSIBLE: 0,
};

export const SEAT_TYPE_LABEL = {
  NORMAL: 'Ghế thường',
  VIP: 'Ghế VIP',
  SWEETBOX: 'Ghế đôi',
  DOUBLE: 'Ghế đôi',
  COUPLE: 'Ghế đôi',
  ACCESSIBLE: 'Ghế tiếp cận',
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
}

export function formatDuration(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h} giờ` : `${h}h${m}p`;
}

export function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1`
    : url;
}

export function groupByDate(showtimes) {
  const map = new Map();
  showtimes.forEach((s) => {
    const date = s.startTime?.slice(0, 10);
    if (!date) return;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(s);
  });
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function groupByCinema(showtimes) {
  const map = new Map();
  showtimes.forEach((s) => {
    const name = s.cinemaName || 'Rạp chiếu';
    const city = s.cinemaCity ? ` (${s.cinemaCity})` : '';
    const fullName = `${name}${city}`;
    const address = s.cinemaAddress || null;

    if (!map.has(fullName)) {
      map.set(fullName, { name: fullName, address, items: [] });
    }
    map.get(fullName).items.push(s);
  });

  return Array.from(map.values()).map((group) => {
    group.items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return group;
  });
}

export function groupSeatsByRow(seats) {
  const map = new Map();
  seats.forEach((seat) => {
    const row = seat.row || 'A';
    if (!map.has(row)) map.set(row, []);
    map.get(row).push(seat);
  });
  Array.from(map.values()).forEach((rowSeats) => rowSeats.sort((a, b) => a.number - b.number));
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}