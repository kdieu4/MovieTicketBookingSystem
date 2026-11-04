/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mtbs.movie_service.service.impl;

import com.mtbs.movie_service.domain.dto.request.SeatActionRequest;
import com.mtbs.movie_service.domain.dto.request.ShowtimeRequest;
import com.mtbs.movie_service.domain.dto.response.SeatActionResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSearchResponse;
import com.mtbs.movie_service.domain.dto.response.ShowtimeSeatResponse;
import com.mtbs.movie_service.domain.entity.Cinema;
import com.mtbs.movie_service.domain.entity.Movie;
import com.mtbs.movie_service.domain.entity.Room;
import com.mtbs.movie_service.domain.entity.Seat;
import com.mtbs.movie_service.domain.entity.Showtime;
import com.mtbs.movie_service.domain.entity.ShowtimeSeat;
import com.mtbs.movie_service.domain.entity.enums.SeatStatus;
import com.mtbs.movie_service.domain.entity.enums.ShowtimeStatus;
import com.mtbs.movie_service.exception.MovieNotFoundException;
import com.mtbs.movie_service.exception.RoomNotFoundException;
import com.mtbs.movie_service.exception.SeatUnavailableException;
import com.mtbs.movie_service.exception.ShowtimeNotFoundException;
import com.mtbs.movie_service.repository.MovieRepository;
import com.mtbs.movie_service.repository.RoomRepository;
import com.mtbs.movie_service.repository.ShowtimeRepository;
import com.mtbs.movie_service.repository.ShowtimeSeatRepository;
import com.mtbs.movie_service.service.ShowtimeService;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
/**
 *
 * @author quanghieu
 */
@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private static final int SEAT_HOLD_MINUTES = 10;
    private static final ZoneId CINEMA_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int SEARCH_WINDOW_DAYS = 30;

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByMovieId(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new MovieNotFoundException(movieId);
        }
        return showtimeRepository.findByMovie_MovieId(movieId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long showtimeId) {
        return toResponse(findShowtimeOrThrow(showtimeId));
    }

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Showtime showtime = new Showtime();
        applyRequest(showtime, request, null);
        Showtime savedShowtime = showtimeRepository.save(showtime);
        ensureShowtimeSeats(savedShowtime);
        return toResponse(savedShowtime);
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest request) {
        Showtime showtime = findShowtimeOrThrow(showtimeId);
        applyRequest(showtime, request, showtimeId);
        return toResponse(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public void deleteShowtime(Long showtimeId) {
        showtimeRepository.delete(findShowtimeOrThrow(showtimeId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeSearchResponse> searchShowtimes(String city, String cinemaName, LocalDate date, String movieTitle) {
        if (city == null || city.isBlank() || movieTitle == null || movieTitle.isBlank()) {
            return List.of();
        }
        return showtimeRepository
                .findAll(searchSpec(city, cinemaName, date, movieTitle), Sort.by(Sort.Direction.ASC, "startTime"))
                .stream()
                .map(this::toSearchResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<ShowtimeSeatResponse> getSeatsByShowtime(Long showtimeId, String sessionId) {
        OffsetDateTime now = OffsetDateTime.now();
        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtime_ShowtimeId(showtimeId);
        if (showtimeSeats.isEmpty()) {
            Long roomId = showtimeRepository.findRoomIdForUpdate(showtimeId)
                    .orElseThrow(() -> new ShowtimeNotFoundException(showtimeId));
            showtimeSeatRepository.insertMissingSeats(showtimeId, roomId, now);
            showtimeSeats = showtimeSeatRepository.findByShowtime_ShowtimeId(showtimeId);
        }

        return showtimeSeats.stream()
                .sorted(Comparator.comparing((ShowtimeSeat ss) -> ss.getSeat().getSeatRow())
                        .thenComparing(ss -> ss.getSeat().getSeatNumber()))
                .map(ss -> toSeatResponse(ss, sessionId, now))
                .toList();
    }

    @Override
    @Transactional
    public SeatActionResponse holdSeats(Long showtimeId, SeatActionRequest request) {
        Showtime showtime = findShowtimeOrThrow(showtimeId);
        if (!showtime.getStartTime().isAfter(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Suất chiếu đã bắt đầu, không thể giữ ghế");
        }

        List<Long> seatIds = normalizeSeatIds(request.seatIds());
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime holdUntil = now.plusMinutes(SEAT_HOLD_MINUTES);

        for (Long seatId : seatIds) {
            int updated = showtimeSeatRepository.holdSeat(
                    seatId,
                    showtimeId,
                    request.sessionId(),
                    now,
                    holdUntil,
                    SeatStatus.AVAILABLE,
                    SeatStatus.HOLDING);
            if (updated == 0) {
                throw new SeatUnavailableException(
                        "Có ghế đã có người chọn hoặc không thuộc suất chiếu này, vui lòng chọn ghế khác");
            }
        }
        return new SeatActionResponse(seatIds, holdUntil);
    }

    @Override
    @Transactional
    public SeatActionResponse releaseSeats(Long showtimeId, SeatActionRequest request) {
        findShowtimeOrThrow(showtimeId);
        List<Long> seatIds = normalizeSeatIds(request.seatIds());
        showtimeSeatRepository.releaseSeats(
                seatIds,
                showtimeId,
                request.sessionId(),
                OffsetDateTime.now(),
                SeatStatus.AVAILABLE,
                SeatStatus.HOLDING);
        return new SeatActionResponse(seatIds, null);
    }

    @Override
    @Transactional
    public SeatActionResponse confirmSeats(Long showtimeId, SeatActionRequest request) {
        findShowtimeOrThrow(showtimeId);
        List<Long> seatIds = normalizeSeatIds(request.seatIds());
        int updated = showtimeSeatRepository.confirmSeats(
                seatIds,
                showtimeId,
                request.sessionId(),
                OffsetDateTime.now(),
                SeatStatus.HOLDING,
                SeatStatus.BOOKED);
        if (updated != seatIds.size()) {
            throw new SeatUnavailableException(
                    "Giữ chỗ đã hết hạn hoặc ghế không còn thuộc bạn, vui lòng chọn lại ghế");
        }
        return new SeatActionResponse(seatIds, null);
    }

    private Showtime findShowtimeOrThrow(Long showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ShowtimeNotFoundException(showtimeId));
    }

    private void ensureShowtimeSeats(Showtime showtime) {
        showtimeSeatRepository.insertMissingSeats(
                showtime.getShowtimeId(),
                showtime.getRoom().getRoomId(),
                OffsetDateTime.now());
    }

    private Specification<Showtime> searchSpec(String city, String cinemaName, LocalDate date,
                                               String movieTitle) {
        LocalDate today = LocalDate.now(CINEMA_ZONE);
        OffsetDateTime startOfToday = today.atStartOfDay(CINEMA_ZONE).toOffsetDateTime();
        OffsetDateTime windowEnd = today.plusDays(SEARCH_WINDOW_DAYS).atStartOfDay(CINEMA_ZONE).toOffsetDateTime();

        return (root, query, cb) -> {
            Join<Showtime, Room> room = root.join("room");
            Join<Room, Cinema> cinema = room.join("cinema");
            Join<Showtime, Movie> movie = root.join("movie");

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(cb.lower(cinema.<String>get("city")), city.trim().toLowerCase()));

            if (cinemaName != null && !cinemaName.isBlank()) {
                predicates.add(cb.equal(cinema.get("name"), cinemaName.trim()));
            }
            if (movieTitle != null && !movieTitle.isBlank()) {
                predicates.add(cb.like(cb.lower(movie.<String>get("title")),
                        "%" + movieTitle.trim().toLowerCase() + "%"));
            }
            if (date != null) {
                LocalDate effectiveDate = date.isBefore(today) ? today : date;
                OffsetDateTime from = effectiveDate.atStartOfDay(CINEMA_ZONE).toOffsetDateTime();
                OffsetDateTime to = effectiveDate.plusDays(1).atStartOfDay(CINEMA_ZONE).toOffsetDateTime();
                predicates.add(cb.greaterThanOrEqualTo(root.<OffsetDateTime>get("startTime"), from));
                predicates.add(cb.lessThan(root.<OffsetDateTime>get("startTime"), to));
            } else {
                predicates.add(cb.greaterThanOrEqualTo(root.<OffsetDateTime>get("startTime"), startOfToday));
                predicates.add(cb.lessThan(root.<OffsetDateTime>get("startTime"), windowEnd));
            }
            predicates.add(cb.or(
                    cb.isNull(root.get("status")),
                    cb.notEqual(root.get("status"), ShowtimeStatus.CANCELLED)));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ShowtimeSeatResponse toSeatResponse(ShowtimeSeat ss, String sessionId, OffsetDateTime now) {
        Seat seat = ss.getSeat();
        boolean holdActive = ss.getStatus() == SeatStatus.HOLDING
                && ss.getHoldUntil() != null
                && ss.getHoldUntil().isAfter(now);
        boolean heldByMe = holdActive && sessionId != null && sessionId.equals(ss.getHoldBy());
        boolean sold = ss.getStatus() == SeatStatus.BOOKED || (holdActive && !heldByMe);

        return new ShowtimeSeatResponse(
                ss.getShowtimeSeatId(),
                seat.getSeatRow(),
                seat.getSeatNumber(),
                seat.getSeatType(),
                sold,
                heldByMe);
    }

    private List<Long> normalizeSeatIds(List<Long> seatIds) {
        return seatIds.stream().distinct().toList();
    }

    private void applyRequest(Showtime showtime, ShowtimeRequest request, Long currentShowtimeId) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime phải sau startTime");
        }

        boolean isOverlapped = showtimeRepository.existsOverlappingShowtime(
                request.roomId(),
                request.startTime(),
                request.endTime(),
                currentShowtimeId
        );
        if (isOverlapped) {
            throw new IllegalArgumentException("Phòng chiếu đã có suất chiếu khác trong khoảng thời gian này");
        }

        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new MovieNotFoundException(request.movieId()));
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new RoomNotFoundException(request.roomId()));

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.startTime());
        showtime.setEndTime(request.endTime());
        showtime.setBasePrice(request.basePrice());
        showtime.setStatus(request.status());
    }

    private ShowtimeSearchResponse toSearchResponse(Showtime showtime) {
        Room room = showtime.getRoom();
        Cinema cinema = room.getCinema();
        Movie movie = showtime.getMovie();

        return new ShowtimeSearchResponse(
                showtime.getShowtimeId(),
                movie.getMovieId(),
                movie.getTitle(),
                cinema.getCinemaId(),
                cinema.getName(),
                cinema.getAddress(),
                room.getName(),
                room.getRoomType(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getBasePrice(),
                showtime.getStatus()
        );
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        Room room = showtime.getRoom();
        Cinema cinema = room != null ? room.getCinema() : null;

        return new ShowtimeResponse(
                showtime.getShowtimeId(),
                showtime.getMovie() != null ? showtime.getMovie().getMovieId() : null,
                room != null ? room.getRoomId() : null,
                room != null ? room.getName() : null,
                room != null ? room.getRoomType() : null,
                cinema != null ? cinema.getCinemaId() : null,
                cinema != null ? cinema.getName() : null,
                cinema != null ? cinema.getAddress() : null,
                cinema != null ? cinema.getCity() : null,
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getBasePrice(),
                showtime.getStatus()
        );
    }
}