package com.health.athlete.exerciselib;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import static com.health.athlete.exerciselib.LibraryExercise.Category.*;
import static com.health.athlete.exerciselib.LibraryExercise.DifficultyLevel.*;
import static com.health.athlete.exerciselib.LibraryExercise.Stage.*;

/**
 * Popula o banco de exercícios no startup. Idempotente: pula entradas já existentes
 * (busca por {@code name}, que é único). Permite que coaches editem livremente sem
 * que o restart sobrescreva.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class ExerciseDataInitializer {

    @Bean
    ApplicationRunner seedLibraryExercises(LibraryExerciseRepository repo) {
        return args -> {
            int inserted = 0;
            for (LibraryExercise ex : defaultLibrary()) {
                if (!repo.existsByName(ex.getName())) {
                    repo.save(ex);
                    inserted++;
                }
            }
            log.info("Library exercises seed: {} new, {} total.", inserted, repo.count());
        };
    }

    private List<LibraryExercise> defaultLibrary() {
        return List.of(
                // ----- MOBILIDADE -----
                build("Mobilidade de quadril (gato-camelo)", MOBILIDADE,
                        "Em quatro apoios, alterne entre arquear a coluna para cima (gato) e afundar (camelo) de forma fluida.",
                        regions("quadril", "lombar"),
                        tags("lombalgia", "repor guarda"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, 10, null),
                build("Abertura de quadril no chão", MOBILIDADE,
                        "Sentado, abra os joelhos para os lados mantendo as solas dos pés unidas; pressione suavemente os joelhos em direção ao chão.",
                        regions("quadril", "adutores"),
                        tags("fazer guarda", "raspar"),
                        none(), stages(PREVENCAO, PERFORMANCE), INICIANTE, 2, null, 60),
                build("Rotação torácica em quatro apoios", MOBILIDADE,
                        "Em quatro apoios, leve uma mão atrás da cabeça e gire o tronco para o lado oposto; alterne.",
                        regions("coluna torácica"),
                        tags("mobilidade geral", "projeções"),
                        none(), stages(PREVENCAO, PERFORMANCE), INICIANTE, 2, 10, null),
                build("Mobilidade de tornozelo na parede", MOBILIDADE,
                        "Em pé com o pé apontado para a parede, leve o joelho à frente sem tirar o calcanhar do chão.",
                        regions("tornozelo"),
                        tags("entorse de tornozelo", "movimentação em pé"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, 12, null),
                build("Mobilidade de ombro (pêndulo)", MOBILIDADE,
                        "Inclinado para frente apoiado em uma cadeira, deixe o braço pendurado e faça círculos lentos.",
                        regions("ombro"),
                        tags("tendinite", "manguito rotador"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 2, null, 30),

                // ----- PREVENTIVO -----
                build("Propriocepção de tornozelo (apoio unipodal)", PREVENTIVO,
                        "Em pé sobre uma única perna, mantenha o equilíbrio o tempo determinado. Pode aumentar dificuldade fechando os olhos.",
                        regions("tornozelo"),
                        tags("entorse de tornozelo", "movimentação em pé"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 3, null, 30),
                build("Fortalecimento de rotadores externos de ombro com elástico", PREVENTIVO,
                        "Cotovelo colado ao corpo, segure o elástico e gire o antebraço para fora mantendo controle.",
                        regions("ombro"),
                        tags("luxação de ombro", "manguito rotador"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 3, 15, null),
                build("Estabilização escapular (band pull-apart)", PREVENTIVO,
                        "Segure um elástico à frente do corpo com braços estendidos e separe as mãos abrindo o peito.",
                        regions("ombro", "escápula"),
                        tags("tendinite", "lesão de ombro"),
                        none(), stages(PREVENCAO), INICIANTE, 3, 15, null),
                build("Agachamento isométrico na parede", PREVENTIVO,
                        "Costas apoiadas na parede, deslize até formar 90° nos joelhos e segure a posição.",
                        regions("joelho", "quadríceps"),
                        tags("joelho", "LCA"),
                        tags("LCA agudo sem liberação"),
                        stages(REABILITACAO, PREVENCAO), INICIANTE, 3, null, 30),
                build("Fortalecimento de fibulares com elástico", PREVENTIVO,
                        "Com o elástico ao redor do pé, faça eversão (girar a planta do pé para fora) contra a resistência.",
                        regions("tornozelo"),
                        tags("entorse de tornozelo"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 3, 15, null),
                build("Exercício de postura cervical (chin tuck)", PREVENTIVO,
                        "Mantenha o olhar para frente e retraia o queixo, como se fizesse 'papada', sem inclinar a cabeça.",
                        regions("cervical"),
                        tags("dor cervical", "postura"),
                        none(), stages(PREVENCAO), INICIANTE, 3, 10, null),

                // ----- FORTALECIMENTO -----
                build("Prancha abdominal", FORTALECIMENTO,
                        "Apoie antebraços e pontas dos pés no chão, mantenha o corpo alinhado e o abdômen contraído.",
                        regions("core"),
                        tags("lombalgia", "hérnia de disco", "fazer guarda"),
                        none(), stages(PREVENCAO, REABILITACAO, PERFORMANCE), INICIANTE, 3, null, 40),
                build("Bird-dog", FORTALECIMENTO,
                        "Em quatro apoios, estenda braço direito e perna esquerda simultaneamente, mantendo o tronco estável; alterne.",
                        regions("core", "lombar"),
                        tags("lombalgia", "desequilíbrio"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 3, 10, null),
                build("Dead bug", FORTALECIMENTO,
                        "Deitado de barriga para cima, estenda braço e perna opostos sem deixar a lombar descolar do chão.",
                        regions("core"),
                        tags("lombalgia", "pós-cirúrgico"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 3, 10, null),
                build("Terminal Knee Extension (TKE) com elástico", FORTALECIMENTO,
                        "Em pé com elástico atrás do joelho, estenda totalmente o joelho contra a resistência.",
                        regions("joelho", "quadríceps"),
                        tags("LCA"),
                        none(), stages(REABILITACAO), INICIANTE, 3, 15, null),
                build("Leg press leve", FORTALECIMENTO,
                        "No aparelho, empurre a plataforma com os pés mantendo a amplitude controlada e sem travar os joelhos.",
                        regions("quadríceps", "glúteos"),
                        tags("LCA", "lesão de menisco"),
                        tags("LCA agudo sem liberação"),
                        stages(REABILITACAO, PERFORMANCE), INTERMEDIARIO, 3, 12, null),
                build("Ponte de glúteo", FORTALECIMENTO,
                        "Deitado de costas, joelhos dobrados, eleve o quadril contraindo os glúteos no topo.",
                        regions("glúteos", "lombar"),
                        tags("lombalgia", "raspar", "projeções"),
                        none(), stages(PREVENCAO, REABILITACAO, PERFORMANCE), INICIANTE, 3, 12, null),
                build("Rotação externa com elástico deitado", FORTALECIMENTO,
                        "Deitado de lado com cotovelo colado ao tronco, gire o antebraço para cima contra a resistência.",
                        regions("ombro"),
                        tags("manguito rotador", "luxação de ombro"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 3, 12, null),
                build("Rosca inversa (fortalecimento de extensores de punho)", FORTALECIMENTO,
                        "Com halter leve, palma para baixo, eleve o punho contraindo os extensores do antebraço.",
                        regions("antebraço", "punho"),
                        tags("epicondilite", "dedos"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 3, 12, null),
                build("Agachamento sumô", FORTALECIMENTO,
                        "Pés afastados além da largura dos ombros, pontas para fora; agache mantendo o tronco ereto.",
                        regions("adutores", "glúteos"),
                        tags("fazer guarda", "raspar"),
                        none(), stages(PERFORMANCE, PREVENCAO), INTERMEDIARIO, 3, 12, null),

                // ----- ALONGAMENTO -----
                build("Alongamento de isquiotibiais deitado", ALONGAMENTO,
                        "Deitado de costas, eleve uma perna estendida segurando atrás da coxa até sentir tensão suave.",
                        regions("isquiotibiais"),
                        tags("lombalgia", "repor guarda"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, null, 30),
                build("Alongamento de piriforme (figura 4)", ALONGAMENTO,
                        "Deitado, cruze um tornozelo sobre o joelho oposto e puxe a coxa de baixo em direção ao peito.",
                        regions("glúteos", "quadril"),
                        tags("lombalgia", "dor no quadril"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, null, 30),
                build("Alongamento de quadríceps em pé", ALONGAMENTO,
                        "Em pé, segure o pé atrás do glúteo mantendo os joelhos juntos e o tronco ereto.",
                        regions("quadríceps"),
                        tags("joelho", "LCA"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, null, 30),
                build("Alongamento de panturrilha na parede", ALONGAMENTO,
                        "Apoie as mãos na parede com um pé atrás e calcanhar no chão; incline o corpo para frente.",
                        regions("panturrilha"),
                        tags("entorse de tornozelo", "movimentação em pé"),
                        none(), stages(PREVENCAO, REABILITACAO), INICIANTE, 2, null, 30),
                build("Alongamento de peitoral na porta", ALONGAMENTO,
                        "No batente da porta, apoie antebraços e gire o tronco para frente abrindo o peito.",
                        regions("peitoral", "ombro"),
                        tags("postura", "ombro"),
                        none(), stages(PREVENCAO), INICIANTE, 2, null, 30),
                build("Alongamento de extensores de punho", ALONGAMENTO,
                        "Braço estendido à frente, palma para baixo; puxe os dedos para baixo com a outra mão.",
                        regions("antebraço", "punho"),
                        tags("epicondilite", "dedos"),
                        none(), stages(REABILITACAO, PREVENCAO), INICIANTE, 2, null, 30),
                build("Alongamento de adutores sentado (borboleta)", ALONGAMENTO,
                        "Sentado com solas dos pés unidas, abra os joelhos para fora mantendo a coluna ereta.",
                        regions("adutores", "quadril"),
                        tags("fazer guarda", "mobilidade de quadril"),
                        none(), stages(PREVENCAO, PERFORMANCE), INICIANTE, 2, null, 45),

                // ----- PLIOMETRICO -----
                build("Salto com agachamento", PLIOMETRICO,
                        "A partir do agachamento, salte explosivamente para o alto e absorva o impacto agachando novamente.",
                        regions("quadríceps", "glúteos"),
                        tags("projeções", "explosão de membros inferiores"),
                        tags("LCA agudo", "lesão de menisco aguda"),
                        stages(PERFORMANCE), INTERMEDIARIO, 4, 8, null),
                build("Skipping", PLIOMETRICO,
                        "Corra no lugar elevando os joelhos até a altura do quadril em ritmo rápido.",
                        regions("membros inferiores"),
                        tags("movimentação em pé", "condicionamento"),
                        none(), stages(PERFORMANCE), INTERMEDIARIO, 3, null, 30),
                build("Salto lateral", PLIOMETRICO,
                        "Salte lateralmente sobre uma linha imaginária, absorvendo o impacto em apoio unipodal.",
                        regions("membros inferiores"),
                        tags("movimentação em pé", "equilíbrio dinâmico"),
                        tags("entorse de tornozelo agudo"),
                        stages(PERFORMANCE), AVANCADO, 4, 10, null),
                build("Medicine ball slam", PLIOMETRICO,
                        "Eleve a medicine ball acima da cabeça e a arremesse no chão com força, usando todo o corpo.",
                        regions("core", "ombro"),
                        tags("força de projeções", "core"),
                        tags("hérnia de disco ativa"),
                        stages(PERFORMANCE), INTERMEDIARIO, 4, 8, null)
        );
    }

    private LibraryExercise build(String name, LibraryExercise.Category category, String description,
                                  List<String> regions, List<String> indicated, List<String> contra,
                                  List<LibraryExercise.Stage> stages, LibraryExercise.DifficultyLevel difficulty,
                                  Integer sets, Integer reps, Integer seconds) {
        return LibraryExercise.builder()
                .name(name)
                .category(category)
                .description(description)
                .targetRegions(regions)
                .indicatedFor(indicated)
                .contraindicatedFor(contra)
                .stage(stages)
                .difficultyLevel(difficulty)
                .sets(sets)
                .repetitions(reps)
                .durationSeconds(seconds)
                .build();
    }

    private static List<String> regions(String... v) { return List.of(v); }
    private static List<String> tags(String... v) { return List.of(v); }
    private static List<String> none() { return List.of(); }
    private static List<LibraryExercise.Stage> stages(LibraryExercise.Stage... v) { return List.of(v); }
}
