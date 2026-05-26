package com.health.athlete.parq;

import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.auth.User;
import com.health.athlete.common.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/parq")
@RequiredArgsConstructor
public class PARQController {

    private final PARQRepository parqRepository;
    private final AthleteRepository athleteRepository;

    public record SubmitRequest(
            @NotNull Boolean q1,
            @NotNull Boolean q2,
            @NotNull Boolean q3,
            @NotNull Boolean q4,
            @NotNull Boolean q5,
            @NotNull Boolean q6,
            @NotNull Boolean q7,
            Boolean acceptedRisk
    ) {}

    public record PARQResponseDTO(
            UUID id,
            UUID athleteId,
            Boolean q1, Boolean q2, Boolean q3, Boolean q4, Boolean q5, Boolean q6, Boolean q7,
            Boolean hasAnyRisk,
            Boolean acceptedRisk,
            Instant answeredAt
    ) {
        public static PARQResponseDTO from(PARQResponse p) {
            return new PARQResponseDTO(
                    p.getId(), p.getAthlete().getId(),
                    p.getQ1(), p.getQ2(), p.getQ3(), p.getQ4(), p.getQ5(), p.getQ6(), p.getQ7(),
                    p.getHasAnyRisk(), p.getAcceptedRisk(), p.getAnsweredAt()
            );
        }
    }

    @PostMapping
    public PARQResponseDTO submit(@AuthenticationPrincipal User principal,
                                  @Valid @RequestBody SubmitRequest req) {
        var athlete = athleteRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new NotFoundException(
                        "Perfil de atleta não encontrado. Cadastre seu perfil antes do PAR-Q."));

        boolean anyRisk = req.q1() || req.q2() || req.q3() || req.q4()
                || req.q5() || req.q6() || req.q7();
        if (anyRisk && !Boolean.TRUE.equals(req.acceptedRisk())) {
            throw new IllegalArgumentException(
                    "Você respondeu Sim a alguma pergunta — é necessário declarar ciência do risco para prosseguir.");
        }
        // Sem risco, `acceptedRisk` não faz sentido — força false para evitar lixo na coluna.
        boolean accepted = anyRisk && Boolean.TRUE.equals(req.acceptedRisk());

        PARQResponse saved = parqRepository.save(PARQResponse.builder()
                .athlete(athlete)
                .q1(req.q1()).q2(req.q2()).q3(req.q3()).q4(req.q4())
                .q5(req.q5()).q6(req.q6()).q7(req.q7())
                .acceptedRisk(accepted)
                .build());

        return PARQResponseDTO.from(saved);
    }

    @GetMapping("/me/latest")
    public ResponseEntity<PARQResponseDTO> latest(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .flatMap(a -> parqRepository.findFirstByAthleteIdOrderByAnsweredAtDesc(a.getId()))
                .map(PARQResponseDTO::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
