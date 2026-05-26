package com.health.athlete.anamnesis;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AnamnesisDTOs {

    public record CreateRequest(
            @NotNull Anamnesis.ConditioningLevel conditioningLevel,
            @NotNull @Min(0) @Max(7) Integer trainingDaysPerWeek,
            // Alinhado com PeriodizationEngine.clamp (30–120). Antes aceitava 15–240
            // mas o engine cortava silenciosamente — agora rejeita no boundary.
            @NotNull @Min(30) @Max(120) Integer sessionMinutes,
            List<Anamnesis.PainLocation> currentPain,
            List<String> injuryHistory,
            List<String> strengths,
            List<String> weaknesses,
            Boolean asymmetryReported,
            Boolean posturalDeviationReported,
            @Min(30) @Max(220) Integer restingHeartRate,
            @Min(0) @Max(24) Integer averageSleepHours,
            @Min(1) @Max(10) Integer perceivedStressLevel,
            Boolean recoveringFromInjury,
            String currentInjuryDescription,
            List<ImprovementGoal> improvementGoals,
            List<PhysicalLimitation> physicalLimitations,
            String physicalLimitationsOther,
            List<JiuJitsuInjury> jiuJitsuInjuriesHad,
            List<JiuJitsuInjury> jiuJitsuInjuriesCurrent,
            List<JiuJitsuDifficulty> jiuJitsuDifficulties
    ) {}

    public record PrescribedExerciseDTO(
            String name,
            PrescribedExercise.Category category,
            String indication,
            PrescribedExercise.Priority priority
    ) {
        public static PrescribedExerciseDTO from(PrescribedExercise e) {
            return new PrescribedExerciseDTO(e.getName(), e.getCategory(), e.getIndication(), e.getPriority());
        }
    }

    public record AnamnesisResponse(
            UUID id,
            UUID athleteId,
            Anamnesis.ConditioningLevel conditioningLevel,
            Integer trainingDaysPerWeek,
            Integer sessionMinutes,
            List<Anamnesis.PainLocation> currentPain,
            List<String> injuryHistory,
            List<String> strengths,
            List<String> weaknesses,
            Boolean asymmetryReported,
            Boolean posturalDeviationReported,
            Integer restingHeartRate,
            Integer averageSleepHours,
            Integer perceivedStressLevel,
            Boolean recoveringFromInjury,
            String currentInjuryDescription,
            List<ImprovementGoal> improvementGoals,
            List<PhysicalLimitation> physicalLimitations,
            String physicalLimitationsOther,
            List<JiuJitsuInjury> jiuJitsuInjuriesHad,
            List<JiuJitsuInjury> jiuJitsuInjuriesCurrent,
            List<JiuJitsuDifficulty> jiuJitsuDifficulties,
            List<PrescribedExerciseDTO> prescribedExercises,
            String autoReport,
            Instant createdAt
    ) {
        public static AnamnesisResponse from(Anamnesis a) {
            return new AnamnesisResponse(
                    a.getId(),
                    a.getAthlete().getId(),
                    a.getConditioningLevel(),
                    a.getTrainingDaysPerWeek(),
                    a.getSessionMinutes(),
                    a.getCurrentPain(),
                    a.getInjuryHistory(),
                    a.getStrengths(),
                    a.getWeaknesses(),
                    a.getAsymmetryReported(),
                    a.getPosturalDeviationReported(),
                    a.getRestingHeartRate(),
                    a.getAverageSleepHours(),
                    a.getPerceivedStressLevel(),
                    a.getRecoveringFromInjury(),
                    a.getCurrentInjuryDescription(),
                    a.getImprovementGoals(),
                    a.getPhysicalLimitations(),
                    a.getPhysicalLimitationsOther(),
                    a.getJiuJitsuInjuriesHad(),
                    a.getJiuJitsuInjuriesCurrent(),
                    a.getJiuJitsuDifficulties(),
                    a.getPrescribedExercises() == null ? List.of()
                            : a.getPrescribedExercises().stream().map(PrescribedExerciseDTO::from).toList(),
                    a.getAutoReport(),
                    a.getCreatedAt()
            );
        }
    }
}
