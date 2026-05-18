package com.health.athlete.injury;

import com.health.athlete.athlete.Athlete;
import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.auth.User;
import com.health.athlete.common.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/injuries")
@RequiredArgsConstructor
public class InjuryController {

    private final InjuryRepository injuryRepository;
    private final AthleteRepository athleteRepository;
    private final RehabProtocols protocols;

    public record CreateRequest(
            @NotNull Injury.Type type,
            @NotNull Injury.Region region,
            @NotNull Injury.Severity severity,
            @NotNull LocalDate onsetDate,
            String description
    ) {}

    public record InjuryResponse(
            UUID id, Injury.Type type, Injury.Region region, Injury.Severity severity,
            Injury.Status status, LocalDate onsetDate, LocalDate resolvedDate,
            String description, String rehabProtocol, Instant createdAt
    ) {
        public static InjuryResponse from(Injury i) {
            return new InjuryResponse(
                    i.getId(), i.getType(), i.getRegion(), i.getSeverity(), i.getStatus(),
                    i.getOnsetDate(), i.getResolvedDate(), i.getDescription(), i.getRehabProtocol(),
                    i.getCreatedAt());
        }
    }

    @PostMapping
    public InjuryResponse create(@AuthenticationPrincipal User principal,
                                 @Valid @RequestBody CreateRequest req) {
        Athlete athlete = athleteRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new NotFoundException("Perfil de atleta não encontrado."));

        Injury injury = Injury.builder()
                .athlete(athlete)
                .type(req.type())
                .region(req.region())
                .severity(req.severity())
                .status(Injury.Status.EM_REABILITACAO)
                .onsetDate(req.onsetDate())
                .description(req.description())
                .rehabProtocol(protocols.generate(req.region(), req.severity()))
                .build();
        return InjuryResponse.from(injuryRepository.save(injury));
    }

    @GetMapping("/me")
    public List<InjuryResponse> myInjuries(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .map(a -> injuryRepository.findByAthleteIdOrderByOnsetDateDesc(a.getId()).stream()
                        .map(InjuryResponse::from).toList())
                .orElse(List.of());
    }

    @PatchMapping("/{id}/resolve")
    public InjuryResponse resolve(@PathVariable UUID id) {
        Injury injury = injuryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lesão não encontrada"));
        injury.setStatus(Injury.Status.RECUPERADA);
        injury.setResolvedDate(LocalDate.now());
        return InjuryResponse.from(injuryRepository.save(injury));
    }
}
