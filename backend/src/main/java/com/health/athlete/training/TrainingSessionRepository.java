package com.health.athlete.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {

    /**
     * Busca a sessão pelo id e valida que pertence ao usuário autenticado em uma
     * única query. Substitui o `findAll().stream().filter(...)` que escaneava
     * todos os planos do sistema em memória.
     */
    @Query("""
        select s from TrainingSession s
        join s.week w
        join w.plan p
        join p.athlete a
        where s.id = :sessionId and a.user.id = :userId
    """)
    Optional<TrainingSession> findByIdAndOwnerUserId(@Param("sessionId") UUID sessionId,
                                                    @Param("userId") UUID userId);
}
