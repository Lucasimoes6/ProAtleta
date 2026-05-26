package com.health.athlete.anamnesis;

import com.health.athlete.athlete.Athlete;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.health.athlete.anamnesis.PrescribedExercise.Category.*;
import static com.health.athlete.anamnesis.PrescribedExercise.Priority.*;

/**
 * Gera relatório automático + prescrição de exercícios a partir da anamnese.
 * Regras heurísticas: lesão ativa > limitação física > dificuldade no esporte > objetivo de melhora.
 * Ponto de extensão para troca por modelo LLM/ML — basta criar uma nova
 * implementação por trás de uma interface comum.
 */
@Component
public class AnamnesisEvaluator {

    public String buildReport(Athlete athlete, Anamnesis a) {
        List<String> sections = new ArrayList<>();

        sections.add("PERFIL");
        sections.add(String.format(
                "Atleta de %d anos, esporte: %s, nível: %s, objetivo principal: %s.",
                athlete.getAge(), athlete.getSport(), athlete.getLevel(), athlete.getPrimaryGoal()));

        if (athlete.getHeightCm() != null && athlete.getWeightKg() != null && athlete.getHeightCm() > 0) {
            double m = athlete.getHeightCm() / 100.0;
            double bmi = athlete.getWeightKg() / (m * m);
            sections.add(String.format("IMC: %.1f (%s).", bmi, classifyBmi(bmi)));
        }

        sections.add("\nCONDICIONAMENTO ATUAL");
        sections.add(String.format(
                "Frequência: %d treinos/semana × %d min. Nível auto-relatado: %s.",
                a.getTrainingDaysPerWeek(), a.getSessionMinutes(), a.getConditioningLevel()));

        List<String> alerts = new ArrayList<>();
        if (a.getCurrentPain() != null && !a.getCurrentPain().isEmpty()
                && !(a.getCurrentPain().size() == 1 && a.getCurrentPain().get(0) == Anamnesis.PainLocation.NENHUM)) {
            alerts.add("Dor ativa relatada em: " + a.getCurrentPain()
                    + ". Recomenda-se avaliação clínica antes de progredir cargas.");
        }
        if (Boolean.TRUE.equals(a.getAsymmetryReported())) {
            alerts.add("Assimetria reportada — incluir trabalho unilateral e exercícios corretivos.");
        }
        if (Boolean.TRUE.equals(a.getPosturalDeviationReported())) {
            alerts.add("Desvio postural reportado — priorizar mobilidade e estabilidade do core.");
        }
        if (a.getInjuryHistory() != null && !a.getInjuryHistory().isEmpty()) {
            alerts.add("Histórico de lesões: " + String.join(", ", a.getInjuryHistory())
                    + ". Progressão deve ser gradual, com reforço de musculatura adjacente.");
        }
        if (Boolean.TRUE.equals(a.getRecoveringFromInjury())) {
            String desc = a.getCurrentInjuryDescription();
            alerts.add("Atleta em recuperação de lesão"
                    + (desc != null && !desc.isBlank() ? " (" + desc + ")" : "")
                    + ". Cargas devem ser validadas por profissional de saúde.");
        }
        if (a.getJiuJitsuInjuriesCurrent() != null && !a.getJiuJitsuInjuriesCurrent().isEmpty()) {
            alerts.add("Lesões ativas de Jiu-Jitsu: "
                    + a.getJiuJitsuInjuriesCurrent() + ". Protocolo de reabilitação aplicado na prescrição.");
        }
        if (a.getPhysicalLimitations() != null
                && a.getPhysicalLimitations().stream().anyMatch(p -> p != PhysicalLimitation.SEM_LIMITACOES)) {
            alerts.add("Limitações físicas reportadas: " + a.getPhysicalLimitations()
                    + (a.getPhysicalLimitationsOther() != null && !a.getPhysicalLimitationsOther().isBlank()
                        ? " | " + a.getPhysicalLimitationsOther() : "")
                    + ". Adaptar movimentos e amplitude conforme tolerância.");
        }
        if (a.getRestingHeartRate() != null && a.getRestingHeartRate() > 80) {
            alerts.add("FC de repouso elevada (" + a.getRestingHeartRate() + " bpm). "
                    + "Sugere baixa eficiência cardiovascular ou estresse — incluir base aeróbica.");
        }
        if (a.getAverageSleepHours() != null && a.getAverageSleepHours() < 7) {
            alerts.add("Sono médio insuficiente (" + a.getAverageSleepHours() + "h). "
                    + "Recuperação comprometida — atenção a sinais de overtraining.");
        }
        if (a.getPerceivedStressLevel() != null && a.getPerceivedStressLevel() >= 8) {
            alerts.add("Estresse percebido elevado (" + a.getPerceivedStressLevel() + "/10). "
                    + "Reduzir intensidade na fase inicial e priorizar recuperação ativa.");
        }

        if (!alerts.isEmpty()) {
            sections.add("\nALERTAS E PONTOS DE ATENÇÃO");
            alerts.forEach(al -> sections.add("• " + al));
        }

        sections.add("\nRECOMENDAÇÕES INICIAIS");
        sections.addAll(buildRecommendations(athlete, a));

        sections.add("\nVALÊNCIAS A DESENVOLVER");
        sections.add(valencyFocus(athlete));

        if (a.getJiuJitsuDifficulties() != null && !a.getJiuJitsuDifficulties().isEmpty()) {
            sections.add("\nDIFICULDADES TÉCNICAS NO JIU-JITSU");
            a.getJiuJitsuDifficulties().forEach(d -> sections.add("• " + humanize(d.name())));
        }

        return String.join("\n", sections);
    }

    /**
     * Gera a lista de exercícios prescritos a partir das respostas da anamnese.
     * Ordem de prioridade (alta → baixa): lesões ativas, limitações físicas,
     * dificuldades específicas, objetivos. Iniciantes recebem foco preventivo extra.
     */
    public List<PrescribedExercise> buildPrescription(Athlete athlete, Anamnesis a) {
        // Map deduplica por nome do exercício preservando a primeira (maior prioridade) inserida.
        Map<String, PrescribedExercise> out = new LinkedHashMap<>();

        if (a.getJiuJitsuInjuriesCurrent() != null) {
            a.getJiuJitsuInjuriesCurrent().forEach(inj -> addAll(out, prescriptionForInjury(inj, ALTA)));
        }
        if (a.getJiuJitsuInjuriesHad() != null) {
            a.getJiuJitsuInjuriesHad().stream()
                    .filter(inj -> a.getJiuJitsuInjuriesCurrent() == null
                            || !a.getJiuJitsuInjuriesCurrent().contains(inj))
                    .forEach(inj -> addAll(out, prescriptionForInjury(inj, MEDIA)));
        }
        if (a.getPhysicalLimitations() != null) {
            a.getPhysicalLimitations().forEach(lim -> addAll(out, prescriptionForLimitation(lim)));
        }
        if (a.getJiuJitsuDifficulties() != null) {
            a.getJiuJitsuDifficulties().forEach(d -> addAll(out, prescriptionForDifficulty(d)));
        }
        if (a.getImprovementGoals() != null) {
            a.getImprovementGoals().forEach(g -> addAll(out, prescriptionForGoal(g)));
        }

        if (athlete.getLevel() == Athlete.Level.INICIANTE) {
            addAll(out, beginnerBaseline());
        }

        return new ArrayList<>(out.values());
    }

    // --- Mapas de prescrição por entrada ---

    private List<PrescribedExercise> prescriptionForInjury(JiuJitsuInjury inj, PrescribedExercise.Priority priority) {
        return switch (inj) {
            case LOMBALGIA -> List.of(
                    PrescribedExercise.of("Prancha frontal", FORTALECIMENTO, "Lombalgia — estabilização do core", priority),
                    PrescribedExercise.of("Bird-dog", FORTALECIMENTO, "Lombalgia — controle lombo-pélvico", priority),
                    PrescribedExercise.of("Dead bug", FORTALECIMENTO, "Lombalgia — ativação do core profundo", priority),
                    PrescribedExercise.of("Alongamento de isquiotibiais", ALONGAMENTO, "Lombalgia", priority),
                    PrescribedExercise.of("Alongamento de piriforme", ALONGAMENTO, "Lombalgia", priority)
            );
            case LESAO_LCA -> List.of(
                    PrescribedExercise.of("Leg press leve (amplitude controlada)", FORTALECIMENTO, "LCA — fortalecimento de quadríceps", priority),
                    PrescribedExercise.of("Terminal knee extension", FORTALECIMENTO, "LCA — ativação do vasto medial", priority),
                    PrescribedExercise.of("Apoio unipodal em superfície estável", PREVENCAO, "LCA — propriocepção", priority)
            );
            case LESAO_MENISCO -> List.of(
                    PrescribedExercise.of("Ponte de glúteo", FORTALECIMENTO, "Menisco — glúteos sem impacto", priority),
                    PrescribedExercise.of("Ciclismo estacionário (baixa resistência)", FORTALECIMENTO, "Menisco — condicionamento sem impacto", priority),
                    PrescribedExercise.of("Quadríceps isométrico", FORTALECIMENTO, "Menisco — sem agachamento profundo", priority)
            );
            case LESAO_MANGUITO_ROTADOR, TENDINITE_OMBRO -> List.of(
                    PrescribedExercise.of("Rotação externa com elástico", FORTALECIMENTO, "Manguito rotador", priority),
                    PrescribedExercise.of("Band pull-apart", FORTALECIMENTO, "Estabilidade escapular", priority),
                    PrescribedExercise.of("Retração escapular", PREVENCAO, "Postura escapular", priority)
            );
            case LUXACAO_OMBRO -> List.of(
                    PrescribedExercise.of("Estabilização escapular (Y-T-W)", FORTALECIMENTO, "Luxação de ombro — controle escapular", priority),
                    PrescribedExercise.of("Rotação externa isométrica", FORTALECIMENTO, "Luxação de ombro", priority),
                    PrescribedExercise.of("Evitar movimentos acima da cabeça (fase inicial)", PREVENCAO, "Luxação de ombro", priority)
            );
            case ENTORSE_TORNOZELO, ESTIRAMENTO_LIGAMENTAR -> List.of(
                    PrescribedExercise.of("Elevação de calcanhar", FORTALECIMENTO, "Tornozelo — tríceps sural", priority),
                    PrescribedExercise.of("Caminhada em ponta dos pés / calcanhares", FORTALECIMENTO, "Tornozelo — tibial anterior e fibulares", priority),
                    PrescribedExercise.of("Equilíbrio unipodal em base instável", PREVENCAO, "Tornozelo — propriocepção", priority)
            );
            case EPICONDILITE -> List.of(
                    PrescribedExercise.of("Alongamento de extensores de punho", ALONGAMENTO, "Epicondilite", priority),
                    PrescribedExercise.of("Excêntrico de punho com halter leve", FORTALECIMENTO, "Epicondilite — protocolo excêntrico", priority),
                    PrescribedExercise.of("Reduzir pegada intensa temporariamente", PREVENCAO, "Epicondilite", priority)
            );
            case HERNIA_DISCO -> List.of(
                    PrescribedExercise.of("Core estabilizador (prancha, dead bug)", FORTALECIMENTO, "Hérnia de disco", priority),
                    PrescribedExercise.of("Pilates terapêutico (mat)", FORTALECIMENTO, "Hérnia de disco — controle motor", priority),
                    PrescribedExercise.of("Evitar flexão lombar excessiva sob carga", PREVENCAO, "Hérnia de disco", priority)
            );
            case ENTORSE_JOELHO -> List.of(
                    PrescribedExercise.of("Quadríceps isométrico", FORTALECIMENTO, "Entorse de joelho", priority),
                    PrescribedExercise.of("Propriocepção em superfície estável", PREVENCAO, "Entorse de joelho", priority)
            );
            case CONTRATURA_MUSCULAR -> List.of(
                    PrescribedExercise.of("Mobilidade torácica", ALONGAMENTO, "Contratura muscular", priority),
                    PrescribedExercise.of("Liberação miofascial (foam roller)", ALONGAMENTO, "Contratura muscular", priority)
            );
            case HIPEREXTENSAO_COTOVELO -> List.of(
                    PrescribedExercise.of("Fortalecimento de bíceps (curl controlado)", FORTALECIMENTO, "Hiperextensão de cotovelo", priority),
                    PrescribedExercise.of("Estabilização articular do cotovelo", PREVENCAO, "Hiperextensão de cotovelo", priority)
            );
            case ENTORSE_DEDO, INFLAMACAO_DEDO, DEFORMIDADE_DEDO -> List.of(
                    PrescribedExercise.of("Fortalecimento de preensão com bolinha", FORTALECIMENTO, "Dedos/mãos", priority),
                    PrescribedExercise.of("Mobilização articular dos dedos", ALONGAMENTO, "Dedos/mãos", priority),
                    PrescribedExercise.of("Taping preventivo no treino", PREVENCAO, "Dedos/mãos", priority)
            );
            case MICOSE, HERPES_GLADIATORUM, ESCORIACOES -> List.of(
                    PrescribedExercise.of("Higiene rigorosa do kimono e tatame", PREVENCAO, "Pele — infecção", priority),
                    PrescribedExercise.of("Afastamento temporário em fase contagiosa", PREVENCAO, "Pele — infecção", priority)
            );
        };
    }

    private List<PrescribedExercise> prescriptionForLimitation(PhysicalLimitation lim) {
        return switch (lim) {
            case DOR_CRONICA -> List.of(
                    PrescribedExercise.of("Mobilidade global de baixo impacto", ALONGAMENTO, "Dor crônica", MEDIA),
                    PrescribedExercise.of("Respiração diafragmática", PREVENCAO, "Dor crônica — controle autonômico", MEDIA)
            );
            case MOBILIDADE_REDUZIDA -> List.of(
                    PrescribedExercise.of("Mobilidade de quadril (90/90)", ALONGAMENTO, "Mobilidade reduzida", MEDIA),
                    PrescribedExercise.of("Mobilidade torácica (cat-cow, thread-the-needle)", ALONGAMENTO, "Mobilidade reduzida", MEDIA)
            );
            case POS_CIRURGICO -> List.of(
                    PrescribedExercise.of("Protocolo guiado por fisioterapeuta", PREVENCAO, "Pós-cirúrgico — sem progressão autônoma", ALTA)
            );
            case SEM_LIMITACOES, OUTRO -> List.of();
        };
    }

    private List<PrescribedExercise> prescriptionForDifficulty(JiuJitsuDifficulty d) {
        return switch (d) {
            case PASSAR_GUARDA -> List.of(
                    PrescribedExercise.of("Agachamento com salto", FORTALECIMENTO, "Passagem de guarda — explosão", MEDIA),
                    PrescribedExercise.of("Mobilidade de quadril (90/90)", ALONGAMENTO, "Passagem de guarda", MEDIA)
            );
            case REPOR_GUARDA -> List.of(
                    PrescribedExercise.of("Abdominal hollow body", FORTALECIMENTO, "Reposição de guarda — core", MEDIA),
                    PrescribedExercise.of("Alongamento de adutores (rã)", ALONGAMENTO, "Reposição de guarda", MEDIA)
            );
            case FAZER_GUARDA -> List.of(
                    PrescribedExercise.of("V-ups", FORTALECIMENTO, "Manter guarda — resistência de core", MEDIA),
                    PrescribedExercise.of("Adução de quadril com elástico", FORTALECIMENTO, "Manter guarda — adutores", MEDIA)
            );
            case RASPAR -> List.of(
                    PrescribedExercise.of("Hip thrust", FORTALECIMENTO, "Raspagem — explosão de quadril", MEDIA),
                    PrescribedExercise.of("Glute bridge unilateral", FORTALECIMENTO, "Raspagem — glúteos", MEDIA)
            );
            case PROJECOES -> List.of(
                    PrescribedExercise.of("Levantamento terra (técnico)", FORTALECIMENTO, "Projeções — cadeia posterior", MEDIA),
                    PrescribedExercise.of("Equilíbrio dinâmico unipodal", PREVENCAO, "Projeções — base e quedas", MEDIA)
            );
            case FINALIZACOES -> List.of(
                    PrescribedExercise.of("Preensão (farmer walk, dead hang)", FORTALECIMENTO, "Finalizações — grip", MEDIA),
                    PrescribedExercise.of("Mobilidade de ombro (sleeper stretch)", ALONGAMENTO, "Finalizações", MEDIA)
            );
            case MOVIMENTACAO_EM_PE -> List.of(
                    PrescribedExercise.of("Escada de agilidade", FORTALECIMENTO, "Movimentação em pé — agilidade", MEDIA),
                    PrescribedExercise.of("Saltos laterais", FORTALECIMENTO, "Movimentação em pé — explosão lateral", MEDIA)
            );
            case MOVIMENTACAO_NO_CHAO -> List.of(
                    PrescribedExercise.of("Animal flow (bear, crab)", FORTALECIMENTO, "Movimentação no chão", MEDIA),
                    PrescribedExercise.of("Mobilidade global (turkish get-up leve)", FORTALECIMENTO, "Movimentação no chão", MEDIA)
            );
        };
    }

    private List<PrescribedExercise> prescriptionForGoal(ImprovementGoal g) {
        return switch (g) {
            case FLEXIBILIDADE -> List.of(
                    PrescribedExercise.of("Rotina de mobilidade de quadril", ALONGAMENTO, "Flexibilidade", BAIXA),
                    PrescribedExercise.of("Mobilidade de coluna torácica", ALONGAMENTO, "Flexibilidade", BAIXA),
                    PrescribedExercise.of("Mobilidade de ombros", ALONGAMENTO, "Flexibilidade", BAIXA)
            );
            case FORCA -> List.of(
                    PrescribedExercise.of("Agachamento", FORTALECIMENTO, "Força — composto inferior", BAIXA),
                    PrescribedExercise.of("Levantamento terra", FORTALECIMENTO, "Força — cadeia posterior", BAIXA),
                    PrescribedExercise.of("Supino", FORTALECIMENTO, "Força — empurrar horizontal", BAIXA)
            );
            case RESISTENCIA -> List.of(
                    PrescribedExercise.of("Circuito aeróbico (20–30 min)", FORTALECIMENTO, "Resistência", BAIXA),
                    PrescribedExercise.of("Treino intervalado (HIIT 1–2x/sem)", FORTALECIMENTO, "Resistência anaeróbica", BAIXA)
            );
            case EQUILIBRIO -> List.of(
                    PrescribedExercise.of("Apoio unipodal de olhos fechados", PREVENCAO, "Equilíbrio", BAIXA),
                    PrescribedExercise.of("Yoga funcional (fluxo)", PREVENCAO, "Equilíbrio", BAIXA)
            );
            case VELOCIDADE -> List.of(
                    PrescribedExercise.of("Tiros curtos (10–20m)", FORTALECIMENTO, "Velocidade", BAIXA),
                    PrescribedExercise.of("Pliometria leve (box jumps)", FORTALECIMENTO, "Velocidade", BAIXA)
            );
            case RECUPERACAO_LESAO -> List.of(
                    PrescribedExercise.of("Sessões de fisioterapia supervisionadas", PREVENCAO, "Recuperação de lesão", ALTA)
            );
            case CONDICIONAMENTO_GERAL -> List.of(
                    PrescribedExercise.of("150 min/sem de atividade moderada", FORTALECIMENTO, "Condicionamento geral", BAIXA)
            );
        };
    }

    private List<PrescribedExercise> beginnerBaseline() {
        return List.of(
                PrescribedExercise.of("Agachamento livre (técnica)", FORTALECIMENTO, "Base para iniciantes", BAIXA),
                PrescribedExercise.of("Remada baixa", FORTALECIMENTO, "Base para iniciantes — puxar", BAIXA),
                PrescribedExercise.of("Mobilidade geral (10 min/dia)", ALONGAMENTO, "Base para iniciantes", BAIXA),
                PrescribedExercise.of("Caminhada/trote leve", FORTALECIMENTO, "Base aeróbica para iniciantes", BAIXA)
        );
    }

    private void addAll(Map<String, PrescribedExercise> out, List<PrescribedExercise> exs) {
        for (PrescribedExercise ex : exs) out.putIfAbsent(ex.getName(), ex);
    }

    private String humanize(String enumName) {
        return enumName.replace('_', ' ').toLowerCase();
    }

    private String classifyBmi(double bmi) {
        if (bmi < 18.5) return "abaixo do peso";
        if (bmi < 25) return "eutrófico";
        if (bmi < 30) return "sobrepeso";
        return "obesidade";
    }

    private List<String> buildRecommendations(Athlete athlete, Anamnesis a) {
        List<String> recs = new ArrayList<>();

        switch (a.getConditioningLevel()) {
            case SEDENTARIO, BAIXO -> {
                recs.add("• Iniciar com fase adaptativa de 4 semanas, foco em técnica e mobilidade.");
                recs.add("• Volume baixo, 3 sessões/semana, intensidade RPE 5-6.");
            }
            case MODERADO -> {
                recs.add("• Periodização linear, fase de base de 6 semanas antes de aumentar intensidade.");
                recs.add("• 4 sessões/semana, intensidade RPE 6-7.");
            }
            case BOM, ALTO -> {
                recs.add("• Periodização ondulatória, alternando volume e intensidade.");
                recs.add("• 4-6 sessões/semana, blocos específicos por valência.");
            }
        }

        if (athlete.getLevel() == Athlete.Level.INICIANTE) {
            recs.add("• Priorizar movimentos básicos (agachamento, empurrar, puxar, hip-hinge).");
            recs.add("• Foco em exercícios preventivos antes de cargas de alta intensidade.");
        }

        switch (athlete.getPrimaryGoal()) {
            case HIPERTROFIA -> recs.add("• 8-12 reps, 3-4 séries, descanso 60-90s, foco em volume total.");
            case FORCA -> recs.add("• 3-6 reps, 4-6 séries, descanso 2-4min, ênfase em compostos.");
            case RESISTENCIA -> recs.add("• Trabalho aeróbico contínuo + intervalado, séries longas com baixo descanso.");
            case EMAGRECIMENTO -> recs.add("• Combinar força (preservar massa magra) com aeróbico moderado e HIIT 1-2x/sem.");
            case PERFORMANCE_ESPORTIVA -> recs.add("• Periodização específica do esporte, integrando potência, agilidade e gestos técnicos.");
            case REABILITACAO -> recs.add("• Progressão tecidual com cargas controladas, validação por profissional de saúde.");
            case SAUDE_GERAL -> recs.add("• Equilíbrio entre força, aeróbico e mobilidade — 150min/sem de atividade moderada.");
        }

        return recs;
    }

    private String valencyFocus(Athlete a) {
        return switch (a.getSport()) {
            case CORRIDA -> "• Resistência aeróbica e anaeróbica\n• Força de membros inferiores\n• Mobilidade de quadril e tornozelo";
            case CICLISMO -> "• Resistência cardiovascular\n• Força e potência de membros inferiores\n• Estabilidade de core";
            case NATACAO -> "• Resistência aeróbica\n• Mobilidade de ombros e quadril\n• Força funcional de tronco";
            case FUTEBOL, BASQUETE, VOLEI, TENIS -> "• Velocidade e agilidade\n• Potência de membros inferiores\n• Resistência intermitente\n• Coordenação e tempo de reação";
            case MUSCULACAO -> "• Hipertrofia e força máxima\n• Estabilidade articular\n• Mobilidade nos padrões de movimento";
            case CROSSFIT -> "• Capacidade work (resistência metabólica)\n• Força absoluta e relativa\n• Mobilidade e técnica olímpica";
            case LUTAS, JIU_JITSU -> "• Força explosiva e isométrica\n• Resistência anaeróbica\n• Mobilidade de quadril e ombro\n• Preensão manual (grip)\n• Equilíbrio e propriocepção";
            default -> "• Força geral\n• Resistência cardiovascular\n• Mobilidade global";
        };
    }
}
