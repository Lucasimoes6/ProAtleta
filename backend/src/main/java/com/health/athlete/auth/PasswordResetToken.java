package com.health.athlete.auth;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Token de redefinição de senha. Single-use, expira em 1h.
 * Em prod, o {@code token} seria enviado por e-mail; em dev é retornado
 * direto no body do endpoint de request para permitir o fluxo offline.
 */
@Entity
@Table(name = "password_reset_tokens", indexes = @Index(name = "idx_prt_token", columnList = "token", unique = true))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Boolean used;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (used == null) used = false;
    }

    public boolean isValid() {
        return !used && expiresAt.isAfter(Instant.now());
    }
}
