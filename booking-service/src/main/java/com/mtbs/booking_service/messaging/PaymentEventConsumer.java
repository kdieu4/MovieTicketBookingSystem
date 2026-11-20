
package com.mtbs.booking_service.messaging;

import com.mtbs.booking_service.client.MovieSeatClaimClient;
import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingSeat;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import com.mtbs.booking_service.repository.BookingRepository;
import com.mtbs.booking_service.repository.BookingSeatRepository;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentEventConsumer {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingEventProducer bookingEventProducer;
    private final MovieSeatClaimClient movieSeatClaimClient;

    public PaymentEventConsumer(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            BookingEventProducer bookingEventProducer,
            MovieSeatClaimClient movieSeatClaimClient) {

        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.bookingEventProducer = bookingEventProducer;
        this.movieSeatClaimClient = movieSeatClaimClient;
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_COMPLETED_QUEUE)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {

        // Thanh toán không thành công: chuyển đơn sang PAYMENT_FAILED và trả ghế
        // về trạng thái trống để người khác đặt được, thay vì để ghế bị giữ tới
        // khi hết hạn giữ chỗ.
        if (event.getStatus() == null
                || !"SUCCESS".equalsIgnoreCase(event.getStatus())) {

            settleFailedPayment(event.getBookingId(), event.getStatus());
            return;
        }

        // Tìm booking theo ID
        Booking booking = bookingRepository
                .findById(event.getBookingId())
                .orElse(null);

        if (booking == null) {
            System.out.println("Booking not found: " + event.getBookingId());
            return;
        }

        // Tránh xử lý lại sự kiện đã thanh toán, nhưng vẫn phát lại
        // booking.paid để movie-service đóng ghế nếu lần trước lỡ mất tin.
        if (booking.getStatus() == BookingStatus.PAID) {
            System.out.println("Booking already PAID: " + booking.getBookingId());
            publishPaidEvent(booking);
            return;
        }

        // Cập nhật trạng thái booking
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);

        publishPaidEvent(booking);

        System.out.println(
                "Booking " + booking.getBookingId()
                        + " updated to PAID and event published");
    }

    /** Bù trừ khi thanh toán thất bại: đổi trạng thái và nhả ghế đã giữ. */
    private void settleFailedPayment(Long bookingId, String status) {

        Booking booking = bookingRepository.findById(bookingId).orElse(null);

        if (booking == null) {
            System.out.println("Booking not found for failed payment: " + bookingId);
            return;
        }

        // Sự kiện lặp lại: đã xử lý rồi thì bỏ qua để không nhả ghế hai lần.
        if (booking.getStatus() == BookingStatus.PAYMENT_FAILED
                || booking.getStatus() == BookingStatus.CANCELLED) {
            System.out.println("Booking already settled: " + bookingId);
            return;
        }

        // Đơn đã thanh toán thành công trước đó thì không hạ trạng thái.
        if (booking.getStatus() == BookingStatus.PAID) {
            System.out.println("Booking already PAID, ignore failed event: " + bookingId);
            return;
        }

        booking.setStatus(BookingStatus.PAYMENT_FAILED);
        bookingRepository.save(booking);

        releaseHeldSeats(booking);

        System.out.println("Booking " + bookingId
                + " set to PAYMENT_FAILED (payment status: " + status + ")");
    }

    /** Trả ghế về trống; lỗi mạng thì bỏ qua vì scheduler sẽ nhả khi hết hạn giữ. */
    private void releaseHeldSeats(Booking booking) {

        List<Long> seatIds = bookingSeatRepository
                .findByBooking_BookingId(booking.getBookingId())
                .stream()
                .map(BookingSeat::getShowtimeSeatId)
                .collect(Collectors.toList());

        if (seatIds.isEmpty()) {
            return;
        }

        try {
            movieSeatClaimClient.releaseClaim(
                    booking.getShowtimeId(),
                    booking.getBookingId(),
                    seatIds);
            System.out.println("Released " + seatIds.size()
                    + " seat(s) of booking " + booking.getBookingId());
        } catch (RuntimeException ex) {
            System.out.println("Cannot release seats of booking "
                    + booking.getBookingId() + ": " + ex.getMessage());
        }
    }

    private void publishPaidEvent(Booking booking) {

        // Lấy danh sách ghế thuộc booking
        List<Long> seatIds = bookingSeatRepository
                .findByBooking_BookingId(booking.getBookingId())
                .stream()
                .map(BookingSeat::getShowtimeSeatId)
                .collect(Collectors.toList());

        // Tạo sự kiện thông báo Movie Service
        BookingPaidEvent paidEvent = new BookingPaidEvent();
        paidEvent.setBookingId(booking.getBookingId());
        paidEvent.setShowtimeId(booking.getShowtimeId());
        paidEvent.setSeatIds(seatIds);
        paidEvent.setStatus("PAID");

        // Gửi sự kiện sang Movie Service
        bookingEventProducer.publishBookingPaid(paidEvent);
    }
}
