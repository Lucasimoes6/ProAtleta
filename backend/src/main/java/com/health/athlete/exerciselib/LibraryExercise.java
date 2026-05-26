package com.health.athlete.exerciselib;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Banco de exercícios canônico, populado via {@code ExerciseDataInitializer}.
 * Nome distinto de {@code training.Exercise} (que é parte de uma sessão de treino).
 */
@Entity
@Table(name = "library_exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryExercise {

    public enum Category { MOBILIDADE, PREVENTIVO, FORTALECIMENTO, ALONGAMENTO, PLIOMETRICO }
    public enum Stage { PREVENCAO, REABILITACAO, PERFORMANCE }
    public enum DifficultyLevel { INICIANTE, INTERMEDIARIO, AVANCADO }

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "library_exercise_regions", joinColumns = @JoinColumn(name = "exercise_id"))
    @Column(name = "region", length = 80)
    @Builder.Default
    private List<String> targetRegions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "library_exercise_indicated", joinColumns = @JoinColumn(name = "exercise_id"))
    @Column(name = "tag", length = 120)
    @Builder.Default
    private List<String> indicatedFor = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "library_exercise_contraindicated", joinColumns = @JoinColumn(name = "exercise_id"))
    @Column(name = "tag", length = 120)
    @Builder.Default
    private List<String> contraindicatedFor = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "library_exercise_stages", joinColumns = @JoinColumn(name = "exercise_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "stage")
    @Builder.Default
    private List<Stage> stage = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficultyLevel;

    private Integer sets;
    private Integer repetitions;
    private Integer durationSeconds;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
