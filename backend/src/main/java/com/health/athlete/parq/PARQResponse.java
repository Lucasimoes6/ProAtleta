package com.health.athlete.parq;

import com.health.athlete.athlete.Athlete;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Questionário de Prontidão para Atividade Física (PAR-Q).
 * Cada submissão é uma snapshot imutável; o atleta pode responder de novo
 * no futuro e o último responde a /me/latest.
 */
@Entity
@Table(name = "parq_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PARQResponse {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Column(nullable = false) private Boolean q1;
    @Column(nullable = false) private Boolean q2;
    @Column(nullable = false) private Boolean q3;
    @Column(nullable = false) private Boolean q4;
    @Column(nullable = false) private Boolean q5;
    @Column(nullable = false) private Boolean q6;
    @Column(nullable = false) private Boolean q7;

    @Column(nullable = false)
    private Boolean hasAnyRisk;

    @Column(nullable = false)
    private Boolean acceptedRisk;

    @Column(nullable = false)
    private Instant answeredAt;

    @PrePersist
    void prePersist() {
        if (answeredAt == null) answeredAt = Instant.now();
        hasAnyRisk = q1 || q2 || q3 || q4 || q5 || q6 || q7;
    }
}
