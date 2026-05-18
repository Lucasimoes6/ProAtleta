package com.health.athlete.injury;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InjuryRepository extends JpaRepository<Injury, UUID> {
    List<Injury> findByAthleteIdOrderByOnsetDateDesc(UUID athleteId);
}
