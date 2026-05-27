package com.health.athlete.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Limpa CHECK constraints residuais que o Hibernate cria automaticamente
 * para enums e que não são atualizados quando novos valores são adicionados.
 * Roda em toda inicialização, idempotente via IF EXISTS.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseMigrations {

    @Bean
    ApplicationRunner dropStaleEnumChecks(JdbcTemplate jdbc) {
        return args -> {
            String[] statements = {
                "ALTER TABLE athletes DROP CONSTRAINT IF EXISTS athletes_sport_check",
                "ALTER TABLE athletes DROP CONSTRAINT IF EXISTS athletes_level_check",
                "ALTER TABLE athletes DROP CONSTRAINT IF EXISTS athletes_primary_goal_check"
            };
            for (String sql : statements) {
                try {
                    jdbc.execute(sql);
                    log.info("Migration aplicada: {}", sql);
                } catch (Exception e) {
                    // H2 não tem esse constraint, é OK ignorar
                    log.debug("Migration ignorada ({}): {}", e.getMessage(), sql);
                }
            }
        };
    }
}
