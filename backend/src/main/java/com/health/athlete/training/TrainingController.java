package com.health.athlete.training;

import com.health.athlete.anamnesis.Anamnesis;
import com.health.athlete.anamnesis.AnamnesisRepository;
import com.health.athlete.athlete.Athlete;
import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.auth.User;
import com.health.athlete.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingPlanRepository planRepository;
    private final AthleteRepository athleteRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final PeriodizationEngine engine;

    @PostMapping("/plans/generate")
    public TrainingPlan generate(@AuthenticationPrincipal User principal) {
        Athlete athlete = athleteRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new NotFoundException("Perfil de atleta não encontrado."));
        Anamnesis last = anamnesisRepository.findFirstByAthleteIdOrderByCreatedAtDesc(athlete.getId())
                .orElseThrow(() -> new NotFoundException(
                        "Realize uma anamnese antes de gerar o plano."));
        TrainingPlan plan = engine.generate(athlete, last, LocalDate.now());
        return planRepository.save(plan);
    }

    @GetMapping("/plans/me/current")
    public ResponseEntity<TrainingPlan> current(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .flatMap(a -> planRepository.findFirstByAthleteIdOrderByStartDateDesc(a.getId()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/plans/me")
    public List<TrainingPlan> myPlans(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .map(a -> planRepository.findByAthleteIdOrderByStartDateDesc(a.getId()))
                .orElse(List.of());
    }

    @PatchMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<Void> markCompleted(@PathVariable UUID sessionId) {
        // Para simplicidade, atualiza diretamente — em produção, verificar autorização do atleta dono
        return planRepository.findAll().stream()
                .flatMap(p -> p.getWeeks().stream())
                .flatMap(w -> w.getSessions().stream())
                .filter(s -> s.getId().equals(sessionId))
                .findFirst()
                .map(s -> {
                    s.setCompleted(true);
                    planRepository.save(s.getWeek().getPlan());
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
