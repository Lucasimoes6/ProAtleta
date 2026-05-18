package com.health.athlete.anamnesis;

import com.health.athlete.athlete.Athlete;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "anamnesis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anamnesis {

    public enum ConditioningLevel { SEDENTARIO, BAIXO, MODERADO, BOM, ALTO }
    public enum PainLocation {
        JOELHO, OMBRO, LOMBAR, CERVICAL, QUADRIL, TORNOZELO, COTOVELO, PUNHO, NENHUM
    }

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditioningLevel conditioningLevel;

    @Column(nullable = false)
    private Integer trainingDaysPerWeek;

    @Column(nullable = false)
    private Integer sessionMinutes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_pain_locations", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "location")
    @Builder.Default
    private List<PainLocation> currentPain = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_injury_history", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Column(name = "injury", length = 500)
    @Builder.Default
    private List<String> injuryHistory = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_strengths", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Column(name = "strength", length = 200)
    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_weaknesses", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Column(name = "weakness", length = 200)
    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    private Boolean asymmetryReported;
    private Boolean posturalDeviationReported;

    private Integer restingHeartRate;
    private Integer averageSleepHours;
    private Integer perceivedStressLevel; // 1..10

    @Column(length = 4000)
    private String autoReport;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
