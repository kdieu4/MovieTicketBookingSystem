package com.mtbs.auth_service.controller;

import com.mtbs.auth_service.domain.dto.response.ResponseData;
import com.mtbs.auth_service.domain.dto.response.ResponseSuccess;
import com.mtbs.auth_service.domain.entity.Ticket;
import com.mtbs.auth_service.service.TicketService;
import jakarta.validation.constraints.Min;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/ticket")
@Profile("dev")
@ConditionalOnProperty(prefix = "app", name = "demo-ticket-enabled", havingValue = "true")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService service) {
        this.ticketService = service;
    }

    @GetMapping
    public ResponseData<List<Ticket>> findAll(
            @RequestParam(defaultValue = "0") int pageNo,
            @Min(value = 10, message = "Path variable invalid") @RequestParam(defaultValue = "10") int pageSize
    ) {
        return new ResponseData<>(HttpStatus.OK.value(), "Find all ticket successfully", ticketService.all());
    }

    @PostMapping
    public ResponseData<Ticket> create(Authentication authentication) {
        Ticket created = ticketService.create(authentication.getName());
        return new ResponseData<>(HttpStatus.CREATED.value(), "Create ticket successfully", created);
    }

    @GetMapping("/{id}")
    public ResponseData<Ticket> findOne(@PathVariable @Min(value = 1, message = "Id must be greater than 0") Long id,
                                        Authentication authentication) {
//        boolean admin = authentication.getAuthorities().stream()
//                .map(GrantedAuthority::getAuthority)
//                .anyMatch("ROLE_ADMIN"::equals);
        return new ResponseData(HttpStatus.OK.value(), "Find Ticket by Id successfully", ticketService.get(id, authentication.getName()));
    }
}
