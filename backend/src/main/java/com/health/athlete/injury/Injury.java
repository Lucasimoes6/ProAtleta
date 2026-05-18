package com.health.athlete.injury;

import com.health.athlete.athlete.Athlete;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "injuries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Injury {

    public enum Type {
        MUSCULAR, LIGAMENTAR, TENDINOSA, OSSEA, ARTICULAR, MENISCAL, OUTRA
    }

    public enum Region {
        JOELHO, OMBRO, LOMBAR, CERVICAL, QUADRIL, TORNOZELO, COTOVELO, PUNHO,
        COXA, PANTURRILHA, BRACO, ANTEBRACO, OUTRO
    }

    public enum Severity { LEVE, MODERADA, GRAVE }

    public enum Status { ATIVA, EM_REABILITACAO, RECUPERADA }

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Region region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDate onsetDate;

    private LocalDate resolvedDate;

    @Column(length = 2000)
    private String description;

    @Column(length = 4000)
    private String rehabProtocol;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { createdAt = Instant.now(); }
}
