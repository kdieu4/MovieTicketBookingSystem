package com.mtbs.movie_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Cho biết instance nào đang phục vụ request, để kiểm chứng LoadBalancer
 * phân phối yêu cầu giữa các instance cùng Service ID (TH7).
 */
@RestController
@RequestMapping("/api")
public class InstanceInfoController {

    private final String serviceName;
    private final String instanceId;
    private final int port;

    public InstanceInfoController(
            @Value("${spring.application.name}") String serviceName,
            @Value("${eureka.instance.instance-id}") String instanceId,
            @Value("${server.port}") int port) {
        this.serviceName = serviceName.toUpperCase();
        this.instanceId = instanceId;
        this.port = port;
    }

    @GetMapping("/instance-info")
    public Map<String, Object> instanceInfo() {
        return Map.of(
                "serviceName", serviceName,
                "instanceId", instanceId,
                "port", port);
    }
}
