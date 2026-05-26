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

    private Boolean recoveringFromInjury;

    @Column(length = 500)
    private String currentInjuryDescription;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_improvement_goals", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "goal")
    @Builder.Default
    private List<ImprovementGoal> improvementGoals = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_physical_limitations", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "limitation")
    @Builder.Default
    private List<PhysicalLimitation> physicalLimitations = new ArrayList<>();

    @Column(length = 500)
    private String physicalLimitationsOther;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_jj_injuries_had", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "injury")
    @Builder.Default
    private List<JiuJitsuInjury> jiuJitsuInjuriesHad = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_jj_injuries_current", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "injury")
    @Builder.Default
    private List<JiuJitsuInjury> jiuJitsuInjuriesCurrent = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_jj_difficulties", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty")
    @Builder.Default
    private List<JiuJitsuDifficulty> jiuJitsuDifficulties = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "anamnesis_prescribed_exercises", joinColumns = @JoinColumn(name = "anamnesis_id"))
    @OrderColumn(name = "ord")
    @Builder.Default
    private List<PrescribedExercise> prescribedExercises = new ArrayList<>();

    @Column(length = 4000)
    private String autoReport;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
