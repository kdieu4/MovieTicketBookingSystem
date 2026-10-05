package com.mtbs.booking_service.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE =
            "booking.exchange";

    public static final String BOOKING_CREATED_QUEUE =
            "booking.created.queue";

    public static final String PAYMENT_COMPLETED_QUEUE =
            "payment.completed.queue";

    public static final String BOOKING_CREATED_ROUTING_KEY =
            "booking.created";

    public static final String PAYMENT_COMPLETED_ROUTING_KEY =
            "payment.completed";

    @Bean
    public DirectExchange bookingExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(BOOKING_CREATED_QUEUE, true);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue(PAYMENT_COMPLETED_QUEUE, true);
    }

    @Bean
    public Binding bookingCreatedBinding(
            Queue bookingCreatedQueue,
            DirectExchange bookingExchange) {

        return BindingBuilder
                .bind(bookingCreatedQueue)
                .to(bookingExchange)
                .with(BOOKING_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding paymentCompletedBinding(
            Queue paymentCompletedQueue,
            DirectExchange bookingExchange) {

        return BindingBuilder
                .bind(paymentCompletedQueue)
                .to(bookingExchange)
                .with(PAYMENT_COMPLETED_ROUTING_KEY);
    }

    /*
     * Convert Java Object <-> JSON khi gửi/nhận RabbitMQ message
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    /*
     * RabbitTemplate sử dụng JSON converter
     */
    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {

        RabbitTemplate rabbitTemplate =
                new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(
                jsonMessageConverter
        );

        return rabbitTemplate;
    }
}