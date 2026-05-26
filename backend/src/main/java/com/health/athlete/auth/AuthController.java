package com.health.athlete.auth;

import com.health.athlete.anamnesis.AnamnesisRepository;
import com.health.athlete.athlete.AthleteRepository;
import com.health.athlete.common.NotFoundException;
import com.health.athlete.parq.PARQRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final AccountService accountService;
    private final AthleteRepository athleteRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final PARQRepository parqRepository;

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String fullName,
            User.Role role
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record AuthResponse(String token, String email, String fullName, User.Role role) {}

    public record MeResponse(UUID id, String email, String fullName, User.Role role, Instant createdAt) {
        static MeResponse from(User u) {
            return new MeResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getCreatedAt());
        }
    }

    public record UpdateProfileRequest(@NotBlank String fullName, @Email @NotBlank String email) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8) String newPassword
    ) {}

    public record PasswordResetRequest(@Email @NotBlank String email) {}

    public record PasswordResetConfirm(
            @NotBlank String token,
            @NotBlank @Size(min = 8) String newPassword
    ) {}

    // --- Auth: signup / signin ---

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        String email = normalizeEmail(req.email());
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().build();
        }
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(req.role() == null ? User.Role.ATHLETE : req.role())
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        String email = normalizeEmail(req.email());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        User user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole()));
    }

    // --- Account: profile + password + delete (authenticated) ---

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal User principal) {
        return MeResponse.from(principal);
    }

    public record OnboardingStatus(
            boolean hasProfile,
            boolean termsAccepted,
            boolean parqAnswered,
            boolean anamnesisAnswered,
            boolean onboardingCompleted
    ) {}

    @GetMapping("/onboarding-status")
    public OnboardingStatus onboardingStatus(@AuthenticationPrincipal User principal) {
        return athleteRepository.findByUserId(principal.getId())
                .map(athlete -> {
                    boolean terms = Boolean.TRUE.equals(athlete.getTermsAccepted());
                    boolean parq = parqRepository.findFirstByAthleteIdOrderByAnsweredAtDesc(athlete.getId()).isPresent();
                    boolean anamnesis = anamnesisRepository
                            .findFirstByAthleteIdOrderByCreatedAtDesc(athlete.getId()).isPresent();
                    boolean completed = athlete.getOnboardingCompletedAt() != null;
                    return new OnboardingStatus(true, terms, parq, anamnesis, completed);
                })
                .orElseGet(() -> new OnboardingStatus(false, false, false, false, false));
    }

    @PatchMapping("/me")
    public AuthResponse updateProfile(@AuthenticationPrincipal User principal,
                                      @Valid @RequestBody UpdateProfileRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        String newEmail = normalizeEmail(req.email());
        if (!user.getEmail().equalsIgnoreCase(newEmail)
                && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email já está em uso.");
        }

        user.setFullName(req.fullName());
        user.setEmail(newEmail);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User principal,
                                               @Valid @RequestBody ChangePasswordRequest req) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal User principal) {
        accountService.deleteAccount(principal.getId());
        return ResponseEntity.noContent().build();
    }

    // --- Password reset (public) ---

    /**
     * Gera token de reset. Em produção, enviaria por email; aqui o token volta
     * no body para que o app possa exibir um link clicável (modo dev).
     * Sempre responde 200 — mesmo quando o email não existe — para evitar
     * user enumeration.
     */
    @PostMapping("/password-reset/request")
    @Transactional
    public Map<String, Object> requestPasswordReset(@Valid @RequestBody PasswordResetRequest req) {
        return userRepository.findByEmail(normalizeEmail(req.email()))
                .map(user -> {
                    // Invalida qualquer token ainda ativo antes de emitir um novo.
                    resetTokenRepository.invalidateActiveTokens(user.getId());
                    String token = UUID.randomUUID().toString().replace("-", "");
                    PasswordResetToken prt = PasswordResetToken.builder()
                            .token(token)
                            .user(user)
                            .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                            .build();
                    resetTokenRepository.save(prt);
                    return Map.<String, Object>of(
                            "ok", true,
                            "token", token,
                            "expiresAt", prt.getExpiresAt().toString(),
                            "message", "Token gerado. Em produção, este token seria enviado por email."
                    );
                })
                .orElseGet(() -> Map.of(
                        "ok", true,
                        "message", "Se o email existir, um token foi gerado."
                ));
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<Void> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirm req) {
        PasswordResetToken prt = resetTokenRepository.findByToken(req.token())
                .orElseThrow(() -> new IllegalArgumentException("Token inválido."));

        if (!prt.isValid()) {
            throw new IllegalArgumentException("Token expirado ou já utilizado.");
        }

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        prt.setUsed(true);
        resetTokenRepository.save(prt);
        return ResponseEntity.noContent().build();
    }
}
