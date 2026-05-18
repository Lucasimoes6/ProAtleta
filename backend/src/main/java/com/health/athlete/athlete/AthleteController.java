package com.health.athlete.athlete;

import com.health.athlete.auth.User;
import com.health.athlete.auth.UserRepository;
import com.health.athlete.common.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/athletes")
@RequiredArgsConstructor
public class AthleteController {

    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<AthleteDTOs.AthleteResponse> me(@AuthenticationPrincipal User user) {
        return athleteRepository.findByUserId(user.getId())
                .map(AthleteDTOs.AthleteResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/me")
    public AthleteDTOs.AthleteResponse upsertMe(@AuthenticationPrincipal User principal,
                                                @Valid @RequestBody AthleteDTOs.UpsertRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Athlete athlete = athleteRepository.findByUserId(user.getId())
                .orElseGet(() -> Athlete.builder().user(user).build());

        athlete.setBirthDate(req.birthDate());
        athlete.setHeightCm(req.heightCm());
        athlete.setWeightKg(req.weightKg());
        athlete.setSport(req.sport());
        athlete.setLevel(req.level());
        athlete.setPrimaryGoal(req.primaryGoal());
        athlete.setNotes(req.notes());

        return AthleteDTOs.AthleteResponse.from(athleteRepository.save(athlete));
    }

    @GetMapping
    public List<AthleteDTOs.AthleteResponse> list() {
        return athleteRepository.findAll().stream()
                .map(AthleteDTOs.AthleteResponse::from)
                .toList();
    }
}
