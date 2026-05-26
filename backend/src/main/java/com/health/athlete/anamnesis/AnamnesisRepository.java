package com.health.athlete.anamnesis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnamnesisRepository extends JpaRepository<Anamnesis, UUID> {
    List<Anamnesis> findByAthleteIdOrderByCreatedAtDesc(UUID athleteId);
    Optional<Anamnesis> findFirstByAthleteIdOrderByCreatedAtDesc(UUID athleteId);
    void deleteByAthleteId(UUID athleteId);
}
