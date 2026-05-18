package com.health.athlete.athlete;

import com.health.athlete.auth.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "athletes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Athlete {

    public enum Sport {
        FUTEBOL, CORRIDA, CICLISMO, NATACAO, MUSCULACAO, CROSSFIT,
        VOLEI, BASQUETE, TENIS, LUTAS, OUTRO
    }

    public enum Level { INICIANTE, INTERMEDIARIO, AVANCADO, ELITE }

    public enum Goal {
        HIPERTROFIA, FORCA, RESISTENCIA, EMAGRECIMENTO,
        PERFORMANCE_ESPORTIVA, REABILITACAO, SAUDE_GERAL
    }

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private LocalDate birthDate;

    private Double heightCm;
    private Double weightKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sport sport;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Goal primaryGoal;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public int getAge() {
        return birthDate == null ? 0 : LocalDate.now().getYear() - birthDate.getYear();
    }
}
