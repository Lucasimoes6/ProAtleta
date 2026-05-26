package com.health.athlete.training;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, UUID> {
    List<TrainingPlan> findByAthleteIdOrderByStartDateDesc(UUID athleteId);
    Optional<TrainingPlan> findFirstByAthleteIdOrderByStartDateDesc(UUID athleteId);
    void deleteByAthleteId(UUID athleteId);
}
