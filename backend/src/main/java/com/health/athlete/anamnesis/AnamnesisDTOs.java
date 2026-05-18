package com.health.athlete.anamnesis;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AnamnesisDTOs {

    public record CreateRequest(
            @NotNull Anamnesis.ConditioningLevel conditioningLevel,
            @NotNull @Min(0) @Max(7) Integer trainingDaysPerWeek,
            @NotNull @Min(15) @Max(240) Integer sessionMinutes,
            List<Anamnesis.PainLocation> currentPain,
            List<String> injuryHistory,
            List<String> strengths,
            List<String> weaknesses,
            Boolean asymmetryReported,
            Boolean posturalDeviationReported,
            @Min(30) @Max(220) Integer restingHeartRate,
            @Min(0) @Max(24) Integer averageSleepHours,
            @Min(1) @Max(10) Integer perceivedStressLevel
    ) {}

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
                    a.getAutoReport(),
                    a.getCreatedAt()
            );
        }
    }
}
