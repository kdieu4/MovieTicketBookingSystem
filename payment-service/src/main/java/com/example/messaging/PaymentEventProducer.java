package com.example.messaging;

import com.example.domain.dto.response.PaymentCompletedEvent;
import com.example.domain.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendPaymentCompleted(Payment payment) {
        PaymentCompletedEvent event = PaymentCompletedEvent.from(payment);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_COMPLETED_ROUTING_KEY,
                event
        );

        log.info("Published PaymentCompletedEvent: {}", event);
    }
}