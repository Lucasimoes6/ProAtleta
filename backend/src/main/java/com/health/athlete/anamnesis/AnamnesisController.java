package com.health.athlete.anamnesis;

import com.health.athlete.athlete.Athlete;
import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.auth.User;
import com.health.athlete.common.NotFoundException;
import java.time.Instant;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anamnesis")
@RequiredArgsConstructor
public class AnamnesisController {

    private final AnamnesisRepository anamnesisRepository;
    private final AthleteRepository athleteRepository;
    private final AnamnesisEvaluator evaluator;

    @PostMapping
    public AnamnesisDTOs.AnamnesisResponse create(@AuthenticationPrincipal User principal,
                                                  @Valid @RequestBody AnamnesisDTOs.CreateRequest req) {
        Athlete athlete = athleteRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new NotFoundException(
                        "Perfil de atleta não encontrado. Cadastre seu perfil antes da anamnese."));

        Anamnesis anamnesis = Anamnesis.builder()
                .athlete(athlete)
                .conditioningLevel(req.conditioningLevel())
                .trainingDaysPerWeek(req.trainingDaysPerWeek())
                .sessionMinutes(req.sessionMinutes())
                .currentPain(req.currentPain() == null ? List.of() : req.currentPain())
                .injuryHistory(req.injuryHistory() == null ? List.of() : req.injuryHistory())
                .strengths(req.strengths() == null ? List.of() : req.strengths())
                .weaknesses(req.weaknesses() == null ? List.of() : req.weaknesses())
                .asymmetryReported(req.asymmetryReported())
                .posturalDeviationReported(req.posturalDeviationReported())
                .restingHeartRate(req.restingHeartRate())
                .averageSleepHours(req.averageSleepHours())
                .perceivedStressLevel(req.perceivedStressLevel())
                .recoveringFromInjury(req.recoveringFromInjury())
                .currentInjuryDescription(req.currentInjuryDescription())
                .improvementGoals(req.improvementGoals() == null ? List.of() : req.improvementGoals())
                .physicalLimitations(req.physicalLimitations() == null ? List.of() : req.physicalLimitations())
                .physicalLimitationsOther(req.physicalLimitationsOther())
                .jiuJitsuInjuriesHad(req.jiuJitsuInjuriesHad() == null ? List.of() : req.jiuJitsuInjuriesHad())
                .jiuJitsuInjuriesCurrent(req.jiuJitsuInjuriesCurrent() == null ? List.of() : req.jiuJitsuInjuriesCurrent())
                .jiuJitsuDifficulties(req.jiuJitsuDifficulties() == null ? List.of() : req.jiuJitsuDifficulties())
                .build();

        anamnesis.setAutoReport(evaluator.buildReport(athlete, anamnesis));
        anamnesis.setPrescribedExercises(evaluator.buildPrescription(athlete, anamnesis));
        AnamnesisDTOs.AnamnesisResponse resp = AnamnesisDTOs.AnamnesisResponse.from(
                anamnesisRepository.save(anamnesis));

        if (athlete.getOnboardingCompletedAt() == null
                && Boolean.TRUE.equals(athlete.getTermsAccepted())) {
            athlete.setOnboardingCompletedAt(Instant.now());
            athleteRepository.save(athlete);
        }
        return resp;
    }

    @GetMapping("/me/latest")
    public ResponseEntity<AnamnesisDTOs.AnamnesisResponse> latest(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .flatMap(a -> anamnesisRepository.findFirstByAthleteIdOrderByCreatedAtDesc(a.getId()))
                .map(AnamnesisDTOs.AnamnesisResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/me")
    public List<AnamnesisDTOs.AnamnesisResponse> history(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .map(a -> anamnesisRepository.findByAthleteIdOrderByCreatedAtDesc(a.getId()).stream()
                        .map(AnamnesisDTOs.AnamnesisResponse::from)
                        .toList())
                .orElse(List.of());
    }
}
