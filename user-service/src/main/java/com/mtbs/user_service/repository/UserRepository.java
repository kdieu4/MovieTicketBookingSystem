package com.mtbs.user_service.repository;

import com.mtbs.user_service.domain.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailAndIdNot(String email, Long userId);

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long userId);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByAuthUserId(Long authUserId);
}
