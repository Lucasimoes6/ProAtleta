package com.health.athlete.athlete;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AthleteRepository extends JpaRepository<Athlete, UUID> {
    Optional<Athlete> findByUserId(UUID userId);
    Optional<Athlete> findByUserEmail(String email);
}
