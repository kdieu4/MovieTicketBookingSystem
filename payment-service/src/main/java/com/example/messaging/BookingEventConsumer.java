package com.example.messaging;

import com.example.config.RabbitMQConfig;
import com.example.domain.dto.request.BookingCreatedEvent;
import com.example.domain.entity.Payment;
import com.example.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventConsumer {

    private final PaymentService paymentService;
    private final PaymentEventProducer paymentEventProducer;

    @RabbitListener(queues = RabbitMQConfig.BOOKING_CREATED_QUEUE)
    public void handleBookingCreated(BookingCreatedEvent event) {
        log.info("Received BookingCreatedEvent: {}", event);

        Payment payment = paymentService.createPayment(event.bookingId(), event.amount());

        log.info("Created payment {} with status {}",
                payment.getId(),
                payment.getStatus());

        Payment processedPayment = paymentService.processPayment(payment.getId());

        paymentEventProducer.sendPaymentCompleted(processedPayment);
    }
}
