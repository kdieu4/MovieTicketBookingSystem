package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.entity.Ticket;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Profile("dev")
@ConditionalOnProperty(prefix = "app", name = "demo-ticket-enabled", havingValue = "true")
public class TicketService {
    private final ConcurrentMap<Long, Ticket> tickets = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(0);

    public Ticket create(String ownerEmail) {
        Long id = sequence.incrementAndGet();
        Ticket result = new Ticket(id, ownerEmail);
        tickets.put(id, result);
        return result;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Ticket> all() {
        System.out.println("Lay danh sach ve chi danh cho admin@gmail.com");
        return tickets.values().stream()
                .sorted(Comparator.comparing(Ticket::id))
                .toList();
    }

    public Ticket get(Long id, String currentEmail) {
        Ticket ticket = tickets.get(id);
        if (ticket == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        if (!isAdmin && !ticket.ownerEmail().equals(currentEmail)) {
            throw new AuthorizationDeniedException("Ticket belongs to " + ticket.ownerEmail() + " user");
        }
        return ticket;
    }
}
