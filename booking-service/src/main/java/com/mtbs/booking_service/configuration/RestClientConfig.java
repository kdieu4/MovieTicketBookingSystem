package com.mtbs.booking_service.configuration;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

/**
 * RestClient cho lời gọi sang service khác: host là Service ID (ví dụ
 * http://movie-service), LoadBalancer chọn instance từ Eureka.
 *
 * <p>Builder thường được đánh dấu @Primary để Eureka client dùng nó cho lời gọi
 * tới Eureka Server; nếu Eureka dùng builder @LoadBalanced thì nó lại phải đi
 * khám phá dịch vụ trong lúc đang khởi tạo, tạo vòng lặp phụ thuộc.
 */
@Configuration
public class RestClientConfig {

    @Bean
    @Primary
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean("loadBalancedRestClientBuilder")
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }
}
