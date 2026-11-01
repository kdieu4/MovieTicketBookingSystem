package com.mtbs.auth_service.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.Instant;

@MappedSuperclass
@Setter
@Getter
public abstract class BaseEntity {
    @Column(name="created_at", nullable=false, updatable = false)
    private Instant createdAt;

    @Column(name="updated_at", nullable=false)
    private Instant updatedAt;

    @PrePersist
    private void onCreate(){
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    private void onUpdate(){
        this.updatedAt = Instant.now();
    }
}