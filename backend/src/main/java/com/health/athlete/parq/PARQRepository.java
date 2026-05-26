package com.health.athlete.parq;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PARQRepository extends JpaRepository<PARQResponse, UUID> {
    Optional<PARQResponse> findFirstByAthleteIdOrderByAnsweredAtDesc(UUID athleteId);
    void deleteByAthleteId(UUID athleteId);
}
