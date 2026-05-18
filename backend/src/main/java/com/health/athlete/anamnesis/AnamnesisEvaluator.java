package com.health.athlete.anamnesis;

import com.health.athlete.athlete.Athlete;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Gera um relatório automático com base na anamnese e perfil do atleta.
 * Aplica regras heurísticas para destacar pontos de atenção, recomendações
 * iniciais e sinalizar riscos. Pensado como ponto de extensão para um modelo
 * de IA mais sofisticado (regras → ML).
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

        return String.join("\n", sections);
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
            case LUTAS -> "• Força explosiva\n• Resistência anaeróbica\n• Equilíbrio e propriocepção";
            default -> "• Força geral\n• Resistência cardiovascular\n• Mobilidade global";
        };
    }
}
