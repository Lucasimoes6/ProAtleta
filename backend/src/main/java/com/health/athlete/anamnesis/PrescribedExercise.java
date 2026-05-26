package com.health.athlete.anamnesis;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Exercício gerado heuristicamente pelo {@link AnamnesisEvaluator} a partir
 * de lesões ativas, dificuldades específicas do esporte e objetivos do atleta.
 * Embeddable para ser persistido como ElementCollection dentro de {@link Anamnesis}.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescribedExercise {

    public enum Category { FORTALECIMENTO, ALONGAMENTO, PREVENCAO }

    public enum Priority { ALTA, MEDIA, BAIXA }

    @Column(length = 200, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(length = 300)
    private String indication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    public static PrescribedExercise of(String name, Category category, String indication, Priority priority) {
        return new PrescribedExercise(name, category, indication, priority);
    }
}
