package com.mtbs.booking_service.messaging;

import com.mtbs.booking_service.domain.entity.Booking;
import com.mtbs.booking_service.domain.entity.BookingStatus;
import com.mtbs.booking_service.repository.BookingRepository;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventConsumer {

    private final BookingRepository bookingRepository;

    public PaymentEventConsumer(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_COMPLETED_QUEUE)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {

        Booking booking = bookingRepository
                .findById(event.getBookingId())
                .orElse(null);

        if (booking == null) {
            return;
        }

        booking.setStatus(BookingStatus.PAID);

        bookingRepository.save(booking);

        System.out.println(
                "Booking " + booking.getBookingId()
                        + " updated to PAID"
        );
    }
}