package com.health.athlete.athlete;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.UUID;

public class AthleteDTOs {

    public record UpsertRequest(
            @NotNull @Past LocalDate birthDate,
            @Positive Double heightCm,
            @Positive Double weightKg,
            @NotNull Athlete.Sport sport,
            @NotNull Athlete.Level level,
            @NotNull Athlete.Goal primaryGoal,
            String notes
    ) {}

    public record AthleteResponse(
            UUID id,
            String email,
            String fullName,
            int age,
            LocalDate birthDate,
            Double heightCm,
            Double weightKg,
            Athlete.Sport sport,
            Athlete.Level level,
            Athlete.Goal primaryGoal,
            String notes
    ) {
        public static AthleteResponse from(Athlete a) {
            return new AthleteResponse(
                    a.getId(),
                    a.getUser().getEmail(),
                    a.getUser().getFullName(),
                    a.getAge(),
                    a.getBirthDate(),
                    a.getHeightCm(),
                    a.getWeightKg(),
                    a.getSport(),
                    a.getLevel(),
                    a.getPrimaryGoal(),
                    a.getNotes()
            );
        }
    }
}
