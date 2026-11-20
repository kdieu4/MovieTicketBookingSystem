package com.mtbs.movie_service.messaging;

import com.mtbs.movie_service.domain.entity.enums.SeatStatus;
import com.mtbs.movie_service.repository.ShowtimeSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Chuyen ghe da giu sang BOOKED khi booking duoc thanh toan.
 *
 * <p>Khong co buoc nay, ghe van la HOLDING va bi job don dep tra ve AVAILABLE
 * sau khi het han, cho phep nguoi khac mua lai ve da ban.
 */
@Component
public class BookingPaidListener {

    private static final Logger log = LoggerFactory.getLogger(BookingPaidListener.class);

    private final ShowtimeSeatRepository showtimeSeatRepository;

    public BookingPaidListener(ShowtimeSeatRepository showtimeSeatRepository) {
        this.showtimeSeatRepository = showtimeSeatRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.BOOKING_PAID_QUEUE)
    @Transactional
    public void handleBookingPaid(BookingPaidEvent event) {

        if (event == null || event.getBookingId() == null || event.getShowtimeId() == null
                || event.getSeatIds() == null || event.getSeatIds().isEmpty()) {
            log.warn("Bỏ qua booking.paid thiếu dữ liệu: {}", event);
            return;
        }

        if (event.getStatus() != null && !"PAID".equals(event.getStatus())) {
            log.warn("Bỏ qua booking.paid không ở trạng thái PAID: bookingId={}, status={}",
                    event.getBookingId(), event.getStatus());
            return;
        }

        List<Long> seatIds = event.getSeatIds();
        int updated = showtimeSeatRepository.confirmBookingClaim(
                event.getShowtimeId(),
                seatIds,
                "booking:" + event.getBookingId(),
                OffsetDateTime.now(),
                SeatStatus.HOLDING,
                SeatStatus.BOOKED);

        if (updated != seatIds.size()) {
            // Ghe da bi nha (het han giu cho hoac da duoc xu ly truoc do).
            log.warn("Chỉ xác nhận được {}/{} ghế cho booking {}",
                    updated, seatIds.size(), event.getBookingId());
        }
    }
}
