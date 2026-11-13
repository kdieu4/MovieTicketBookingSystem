
package com.mtbs.booking_service.messaging;

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

    public PaymentEventConsumer(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            BookingEventProducer bookingEventProducer) {

        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.bookingEventProducer = bookingEventProducer;
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_COMPLETED_QUEUE)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {

        // Chỉ xử lý khi thanh toán thành công
        if (event.getStatus() == null
                || !"SUCCESS".equalsIgnoreCase(event.getStatus())) {

            System.out.println("Payment is not successful. Booking unchanged.");
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

        // Tránh xử lý lại sự kiện đã thanh toán
        if (booking.getStatus() == BookingStatus.PAID) {
            System.out.println("Booking already PAID: " + booking.getBookingId());
            return;
        }

        // Cập nhật trạng thái booking
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);

        // Lấy danh sách ghế thuộc booking
        List<Long> seatIds = bookingSeatRepository
                .findAllByBookingId(booking.getBookingId())
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

        System.out.println(
                "Booking " + booking.getBookingId()
                        + " updated to PAID and event published"
        );
    }
}
