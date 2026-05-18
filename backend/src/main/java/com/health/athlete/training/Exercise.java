package com.health.athlete.training;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private TrainingSession session;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private String name;

    private Integer sets;
    private String reps;     // ex.: "8-12", "AMRAP", "30s"
    private String load;     // ex.: "70% 1RM", "RPE 7", "moderada"
    private String rest;     // ex.: "60s", "2min"

    @Column(length = 1000)
    private String instructions;
}
