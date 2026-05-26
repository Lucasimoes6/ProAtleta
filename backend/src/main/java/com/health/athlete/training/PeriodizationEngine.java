package com.health.athlete.training;

import com.health.athlete.anamnesis.Anamnesis;
import com.health.athlete.athlete.Athlete;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Gera um plano de treinamento periodizado com base no perfil do atleta
 * e na sua última anamnese. Usa um modelo linear de 12 semanas dividido
 * em 4 fases (base, intensidade, pico, recuperação) — extensível para
 * ondulatório/bloco no futuro.
 */
@Component
public class PeriodizationEngine {

    private static final int TOTAL_WEEKS = 12;

    public TrainingPlan generate(Athlete athlete, Anamnesis anamnesis, LocalDate startDate) {
        TrainingPlan plan = TrainingPlan.builder()
                .athlete(athlete)
                .name(buildName(athlete))
                .startDate(startDate)
                .endDate(startDate.plusWeeks(TOTAL_WEEKS))
                .currentPhase(TrainingPlan.CyclePhase.BASE)
                .build();

        int sessionsPerWeek = clamp(anamnesis.getTrainingDaysPerWeek(), 2, 6);
        int sessionMinutes = clamp(anamnesis.getSessionMinutes(), 30, 120);

        List<TrainingWeek> weeks = new ArrayList<>();
        for (int w = 1; w <= TOTAL_WEEKS; w++) {
            TrainingPlan.CyclePhase phase = phaseForWeek(w);
            int volume = volumeForPhase(phase, w, anamnesis);
            int intensity = intensityForPhase(phase, w, anamnesis);

            TrainingWeek week = TrainingWeek.builder()
                    .plan(plan)
                    .weekNumber(w)
                    .phase(phase)
                    .volumeLoad(volume)
                    .intensityLoad(intensity)
                    .focus(focusForPhase(phase, athlete))
                    .build();

            week.setSessions(buildSessions(week, athlete, anamnesis, sessionsPerWeek, sessionMinutes));
            weeks.add(week);
        }
        plan.setWeeks(weeks);
        return plan;
    }

    private String buildName(Athlete a) {
        return String.format("Plano %s · %s · %s",
                a.getSport(), a.getPrimaryGoal(), a.getLevel());
    }

    private TrainingPlan.CyclePhase phaseForWeek(int week) {
        if (week <= 4) return TrainingPlan.CyclePhase.BASE;
        if (week <= 8) return TrainingPlan.CyclePhase.INTENSIDADE;
        if (week <= 11) return TrainingPlan.CyclePhase.PICO;
        return TrainingPlan.CyclePhase.RECUPERACAO;
    }

    private int volumeForPhase(TrainingPlan.CyclePhase phase, int week, Anamnesis a) {
        int base = switch (a.getConditioningLevel()) {
            case SEDENTARIO, BAIXO -> 40;
            case MODERADO -> 55;
            case BOM -> 70;
            case ALTO -> 80;
        };
        return switch (phase) {
            case BASE -> base + (week - 1) * 4;       // progressão linear
            case INTENSIDADE -> base + 12;            // estabiliza volume
            case PICO -> base + 6;                    // reduz para qualidade
            case RECUPERACAO -> Math.max(20, base - 25);
        };
    }

    private int intensityForPhase(TrainingPlan.CyclePhase phase, int week, Anamnesis a) {
        int base = switch (a.getConditioningLevel()) {
            case SEDENTARIO, BAIXO -> 50;
            case MODERADO -> 60;
            case BOM -> 70;
            case ALTO -> 75;
        };
        return switch (phase) {
            case BASE -> base;
            case INTENSIDADE -> base + 10 + (week - 5) * 3;
            case PICO -> base + 25;
            case RECUPERACAO -> base - 10;
        };
    }

    private String focusForPhase(TrainingPlan.CyclePhase phase, Athlete a) {
        return switch (phase) {
            case BASE -> "Adaptação anatômica, técnica, base aeróbica";
            case INTENSIDADE -> "Hipertrofia/força, capacidade específica do esporte";
            case PICO -> "Potência, velocidade, transferência ao gesto esportivo";
            case RECUPERACAO -> "Recuperação ativa, mobilidade, prevenção";
        };
    }

    private List<TrainingSession> buildSessions(TrainingWeek week, Athlete athlete,
                                                Anamnesis anamnesis,
                                                int sessionsPerWeek, int sessionMinutes) {
        List<DayOfWeek> days = distributeDays(sessionsPerWeek);
        List<TrainingSession> sessions = new ArrayList<>();

        for (int i = 0; i < days.size(); i++) {
            SessionTemplate t = pickTemplate(athlete, anamnesis, week.getPhase(), i, days.size());
            TrainingSession session = TrainingSession.builder()
                    .week(week)
                    .dayOfWeek(days.get(i))
                    .title(t.title)
                    .durationMinutes(sessionMinutes)
                    .description(t.description)
                    .build();
            session.setExercises(buildExercises(session, t, week.getPhase()));
            sessions.add(session);
        }
        return sessions;
    }

    private List<DayOfWeek> distributeDays(int count) {
        return switch (count) {
            case 2 -> List.of(DayOfWeek.TUESDAY, DayOfWeek.FRIDAY);
            case 3 -> List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY);
            case 4 -> List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);
            case 5 -> List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.FRIDAY, DayOfWeek.SATURDAY);
            case 6 -> List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY);
            default -> List.of(DayOfWeek.WEDNESDAY);
        };
    }

    private record SessionTemplate(String title, String description, List<ExerciseTemplate> exercises) {}
    private record ExerciseTemplate(String name, Integer sets, String reps, String load, String rest, String tip) {}

    private SessionTemplate pickTemplate(Athlete athlete, Anamnesis a,
                                         TrainingPlan.CyclePhase phase, int index, int total) {
        boolean upperFocus = index % 2 == 0;

        return switch (athlete.getSport()) {
            case CORRIDA, CICLISMO -> aerobicTemplate(phase, index);
            case FUTEBOL, BASQUETE, VOLEI, TENIS, LUTAS, JIU_JITSU ->
                    sportSpecificTemplate(phase, index, total);
            case NATACAO -> aerobicTemplate(phase, index);
            case CROSSFIT -> crossfitTemplate(phase, index);
            default -> upperFocus ? upperBodyStrength(phase) : lowerBodyStrength(phase);
        };
    }

    private SessionTemplate upperBodyStrength(TrainingPlan.CyclePhase phase) {
        return new SessionTemplate(
                "Força — Membros Superiores",
                "Foco em padrões de empurrar e puxar com progressão de carga.",
                List.of(
                        new ExerciseTemplate("Supino reto", 4, repsForPhase(phase), loadForPhase(phase), "90s",
                                "Mantenha escápulas retraídas, pés firmes no chão."),
                        new ExerciseTemplate("Remada curvada", 4, repsForPhase(phase), loadForPhase(phase), "90s",
                                "Coluna neutra, puxe com cotovelos alinhados ao tronco."),
                        new ExerciseTemplate("Desenvolvimento militar", 3, repsForPhase(phase), loadForPhase(phase), "75s",
                                "Core ativado, evite hiperextensão lombar."),
                        new ExerciseTemplate("Puxada alta", 3, "10-12", "RPE 7", "60s",
                                "Inicie com escápulas, finalize com cotovelos."),
                        new ExerciseTemplate("Rosca direta + tríceps testa", 3, "10-12", "moderada", "45s",
                                "Bi-set para finalizar o treino.")
                ));
    }

    private SessionTemplate lowerBodyStrength(TrainingPlan.CyclePhase phase) {
        return new SessionTemplate(
                "Força — Membros Inferiores",
                "Padrões de agachamento, hip-hinge e estabilidade unilateral.",
                List.of(
                        new ExerciseTemplate("Agachamento livre", 4, repsForPhase(phase), loadForPhase(phase), "120s",
                                "Joelhos alinhados aos pés, profundidade até paralelo."),
                        new ExerciseTemplate("Stiff", 4, repsForPhase(phase), loadForPhase(phase), "90s",
                                "Hip-hinge dominante, leve flexão de joelhos."),
                        new ExerciseTemplate("Afundo búlgaro", 3, "10-12 cada perna", "RPE 7", "60s",
                                "Trabalha assimetria e estabilidade unilateral."),
                        new ExerciseTemplate("Elevação pélvica", 3, "12-15", "moderada", "45s",
                                "Ativação de glúteos, contrair no topo 2s."),
                        new ExerciseTemplate("Prancha + dead bug", 3, "30-45s", "peso corporal", "30s",
                                "Estabilidade de core, evite báscula pélvica.")
                ));
    }

    private SessionTemplate aerobicTemplate(TrainingPlan.CyclePhase phase, int index) {
        if (phase == TrainingPlan.CyclePhase.BASE || index == 0) {
            return new SessionTemplate(
                    "Base Aeróbica",
                    "Trabalho contínuo em zona 2 — eficiência mitocondrial.",
                    List.of(
                            new ExerciseTemplate("Aquecimento progressivo", 1, "10min", "leve", "—",
                                    "Iniciar lentamente, subir até 70% FC máx."),
                            new ExerciseTemplate("Bloco contínuo zona 2", 1, "30-50min", "Z2 (60-70% FC máx)", "—",
                                    "Conseguir conversar normalmente. Foco em volume."),
                            new ExerciseTemplate("Desaquecimento", 1, "5-10min", "leve", "—",
                                    "Reduzir intensidade gradualmente.")
                    ));
        }
        return new SessionTemplate(
                "Intervalado Aeróbico",
                "Estímulos curtos em alta intensidade com recuperação ativa.",
                List.of(
                        new ExerciseTemplate("Aquecimento dinâmico", 1, "10-15min", "leve→moderado", "—",
                                "Inclua exercícios de mobilidade."),
                        new ExerciseTemplate("Intervalado 4x4min", 4, "4min", "Z4 (85-90% FC máx)", "3min Z2",
                                "Manter ritmo constante em cada série."),
                        new ExerciseTemplate("Desaquecimento", 1, "10min", "leve", "—",
                                "Volta à calma com alongamento.")
                ));
    }

    private SessionTemplate sportSpecificTemplate(TrainingPlan.CyclePhase phase, int index, int total) {
        if (index == total - 1) {
            return new SessionTemplate(
                    "Específico do Esporte",
                    "Integração de força + gestos do esporte.",
                    List.of(
                            new ExerciseTemplate("Aquecimento neuromuscular", 1, "10min", "leve", "—",
                                    "Saltos baixos, deslocamentos laterais, multidirecionais."),
                            new ExerciseTemplate("Sprints curtos", 6, "15-20m", "máxima", "60-90s",
                                    "Recuperação completa entre tiros."),
                            new ExerciseTemplate("Pliometria", 4, "6-8 saltos", "máxima", "90s",
                                    "Box jumps ou drops jumps com pouso suave."),
                            new ExerciseTemplate("Agility ladder", 3, "2 séries", "—", "60s",
                                    "Variar padrões a cada série.")
                    ));
        }
        return index % 2 == 0 ? lowerBodyStrength(phase) : upperBodyStrength(phase);
    }

    private SessionTemplate crossfitTemplate(TrainingPlan.CyclePhase phase, int index) {
        return new SessionTemplate(
                index % 2 == 0 ? "Strength + MetCon" : "EMOM/AMRAP",
                "Misto de força e condicionamento metabólico.",
                List.of(
                        new ExerciseTemplate("Aquecimento dinâmico", 1, "10min", "leve", "—",
                                "Mobilidade global + ativação."),
                        new ExerciseTemplate("Strength: Back Squat", 5, "5", loadForPhase(phase), "120s",
                                "Foco em técnica e barra estável."),
                        new ExerciseTemplate("MetCon 12min AMRAP", 1, "AMRAP", "intensidade alta", "—",
                                "10 burpees, 15 KB swings, 20 air squats."),
                        new ExerciseTemplate("Cool-down + mobilidade", 1, "10min", "leve", "—",
                                "Alongamento + foam rolling.")
                ));
    }

    private String repsForPhase(TrainingPlan.CyclePhase phase) {
        return switch (phase) {
            case BASE -> "10-12";
            case INTENSIDADE -> "6-8";
            case PICO -> "3-5";
            case RECUPERACAO -> "12-15";
        };
    }

    private String loadForPhase(TrainingPlan.CyclePhase phase) {
        return switch (phase) {
            case BASE -> "60-70% 1RM (RPE 6-7)";
            case INTENSIDADE -> "75-85% 1RM (RPE 7-8)";
            case PICO -> "85-92% 1RM (RPE 8-9)";
            case RECUPERACAO -> "50-60% 1RM (RPE 5)";
        };
    }

    private List<Exercise> buildExercises(TrainingSession session, SessionTemplate template,
                                          TrainingPlan.CyclePhase phase) {
        List<Exercise> result = new ArrayList<>();
        int idx = 1;
        for (ExerciseTemplate t : template.exercises) {
            result.add(Exercise.builder()
                    .session(session)
                    .orderIndex(idx++)
                    .name(t.name())
                    .sets(t.sets())
                    .reps(t.reps())
                    .load(t.load())
                    .rest(t.rest())
                    .instructions(t.tip())
                    .build());
        }
        return result;
    }

    private int clamp(Integer value, int min, int max) {
        if (value == null) return min;
        return Math.max(min, Math.min(max, value));
    }
}
