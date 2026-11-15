
package com.mtbs.movie_service.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class RabbitMQConfig {

    private static final Logger log =
            LoggerFactory.getLogger(RabbitMQConfig.class);

    public static final String EXCHANGE = "booking.exchange";

    public static final String BOOKING_CREATED_QUEUE =
            "booking.created.queue";

    public static final String BOOKING_CREATED_ROUTING_KEY =
            "booking.created";

    @Bean
    public DirectExchange bookingExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue bookingCreatedQueue() {
        return new Queue(BOOKING_CREATED_QUEUE, true);
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
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    // Fail-soft: movie-service has no consumer yet, so without this it never
    // opens a RabbitMQ connection. This proves the broker is reachable and
    // declares the exchange/queue on startup.
    @Bean
    public ApplicationRunner rabbitConnectionCheck(AmqpAdmin amqpAdmin) {
        return args -> {
            try {
                ((RabbitAdmin) amqpAdmin).initialize();
                log.info("RabbitMQ connection OK, topology declared");
            } catch (Exception ex) {
                log.warn("RabbitMQ unavailable ({}), continuing without it",
                        ex.getMessage());
            }
        };
    }
}
