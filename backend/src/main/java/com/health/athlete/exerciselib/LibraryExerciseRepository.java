package com.health.athlete.exerciselib;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LibraryExerciseRepository extends JpaRepository<LibraryExercise, UUID> {
    Optional<LibraryExercise> findByName(String name);
    boolean existsByName(String name);
}
