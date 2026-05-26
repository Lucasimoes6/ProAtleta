package com.health.athlete.exerciselib;

import com.health.athlete.common.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class LibraryExerciseController {

    private final LibraryExerciseRepository repository;

    public record ExerciseDTO(
            UUID id,
            String name,
            String description,
            LibraryExercise.Category category,
            List<String> targetRegions,
            List<String> indicatedFor,
            List<String> contraindicatedFor,
            List<LibraryExercise.Stage> stage,
            LibraryExercise.DifficultyLevel difficultyLevel,
            Integer sets,
            Integer repetitions,
            Integer durationSeconds,
            Instant createdAt
    ) {
        public static ExerciseDTO from(LibraryExercise e) {
            return new ExerciseDTO(
                    e.getId(), e.getName(), e.getDescription(), e.getCategory(),
                    e.getTargetRegions(), e.getIndicatedFor(), e.getContraindicatedFor(),
                    e.getStage(), e.getDifficultyLevel(),
                    e.getSets(), e.getRepetitions(), e.getDurationSeconds(),
                    e.getCreatedAt()
            );
        }
    }

    public record UpsertRequest(
            @NotBlank String name,
            String description,
            @NotNull LibraryExercise.Category category,
            List<String> targetRegions,
            List<String> indicatedFor,
            List<String> contraindicatedFor,
            List<LibraryExercise.Stage> stage,
            @NotNull LibraryExercise.DifficultyLevel difficultyLevel,
            Integer sets,
            Integer repetitions,
            Integer durationSeconds
    ) {}

    @GetMapping
    public List<ExerciseDTO> list(
            @RequestParam(required = false) LibraryExercise.Category category,
            @RequestParam(required = false) LibraryExercise.Stage stage,
            @RequestParam(required = false) String region
    ) {
        return repository.findAll().stream()
                .filter(e -> category == null || e.getCategory() == category)
                .filter(e -> stage == null || e.getStage().contains(stage))
                .filter(e -> region == null || region.isBlank()
                        || e.getTargetRegions().stream().anyMatch(r -> r.equalsIgnoreCase(region)))
                .map(ExerciseDTO::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ExerciseDTO get(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ExerciseDTO::from)
                .orElseThrow(() -> new NotFoundException("Exercício não encontrado."));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH','ADMIN')")
    public ExerciseDTO create(@Valid @RequestBody UpsertRequest req) {
        LibraryExercise e = apply(LibraryExercise.builder().build(), req);
        return ExerciseDTO.from(repository.save(e));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH','ADMIN')")
    public ExerciseDTO update(@PathVariable UUID id, @Valid @RequestBody UpsertRequest req) {
        LibraryExercise e = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Exercício não encontrado."));
        return ExerciseDTO.from(repository.save(apply(e, req)));
    }

    private LibraryExercise apply(LibraryExercise e, UpsertRequest req) {
        e.setName(req.name());
        e.setDescription(req.description());
        e.setCategory(req.category());
        e.setTargetRegions(req.targetRegions() == null ? List.of() : req.targetRegions());
        e.setIndicatedFor(req.indicatedFor() == null ? List.of() : req.indicatedFor());
        e.setContraindicatedFor(req.contraindicatedFor() == null ? List.of() : req.contraindicatedFor());
        e.setStage(req.stage() == null ? List.of() : req.stage());
        e.setDifficultyLevel(req.difficultyLevel());
        e.setSets(req.sets());
        e.setRepetitions(req.repetitions());
        e.setDurationSeconds(req.durationSeconds());
        return e;
    }
}
