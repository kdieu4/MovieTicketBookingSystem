package com.mtbs.auth_service.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invalidate_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidateToken extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "email", unique = true)
    private String email;
    @Column(name = "access_token")
    private String accessToken;
    @Column(name = "refresh_token")
    private String refreshToken;
}
