package com.health.athlete.anamnesis;

/**
 * Lesões mais frequentes no Jiu-Jitsu, agrupadas por região anatômica.
 * Estrutura projetada para ser extensível a outras modalidades — basta
 * criar um enum análogo (ex.: {@code FutebolInjury}) e plugá-lo no
 * {@link AnamnesisEvaluator} via switch por esporte.
 */
public enum JiuJitsuInjury {
    // Joelho
    ENTORSE_JOELHO,
    LESAO_MENISCO,
    LESAO_LCA,
    // Ombro
    LUXACAO_OMBRO,
    TENDINITE_OMBRO,
    LESAO_MANGUITO_ROTADOR,
    // Dedos e mãos
    ENTORSE_DEDO,
    INFLAMACAO_DEDO,
    DEFORMIDADE_DEDO,
    // Coluna
    LOMBALGIA,
    HERNIA_DISCO,
    CONTRATURA_MUSCULAR,
    // Cotovelo
    HIPEREXTENSAO_COTOVELO,
    EPICONDILITE,
    // Tornozelo
    ENTORSE_TORNOZELO,
    ESTIRAMENTO_LIGAMENTAR,
    // Pele
    MICOSE,
    HERPES_GLADIATORUM,
    ESCORIACOES
}
