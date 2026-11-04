package com.mtbs.auth_service.service;

import com.mtbs.auth_service.domain.entity.Role;
import com.mtbs.auth_service.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public record RoleService(RoleRepository roleRepository) {
    @PostConstruct
    public List<Role> findAll() {
        List<Role> roles = roleRepository.findAll();
        return roles;
    }
}
