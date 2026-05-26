package com.health.athlete.auth;

import com.health.athlete.anamnesis.AnamnesisRepository;
import com.health.athlete.athlete.Athlete;
import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.injury.InjuryRepository;
import com.health.athlete.training.TrainingPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Operações de ciclo de vida da conta que tocam múltiplos agregados.
 * Mantém a ordem de exclusão correta (filhos → pai) já que não há cascade
 * declarado entre {@code User} e {@code Athlete}.
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final TrainingPlanRepository trainingPlanRepository;
    private final InjuryRepository injuryRepository;

    @Transactional
    public void deleteAccount(UUID userId) {
        athleteRepository.findByUserId(userId).ifPresent(this::deleteAthleteData);
        userRepository.deleteById(userId);
    }

    private void deleteAthleteData(Athlete athlete) {
        UUID athleteId = athlete.getId();
        anamnesisRepository.deleteByAthleteId(athleteId);
        trainingPlanRepository.deleteByAthleteId(athleteId);
        injuryRepository.deleteByAthleteId(athleteId);
        athleteRepository.deleteById(athleteId);
    }
}
