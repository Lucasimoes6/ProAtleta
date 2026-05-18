package com.health.athlete.injury;

import org.springframework.stereotype.Component;

/**
 * Protocolos de reabilitação simplificados por região e gravidade.
 * Estes são pontos de partida educativos — qualquer reabilitação real
 * exige acompanhamento de fisioterapeuta/médico.
 */
@Component
public class RehabProtocols {

    public String generate(Injury.Region region, Injury.Severity severity) {
        StringBuilder sb = new StringBuilder();
        sb.append("PROTOCOLO INICIAL — ").append(region).append(" (").append(severity).append(")\n\n");

        sb.append("FASE 1 — Controle da dor e proteção (0-7 dias):\n");
        sb.append("• Repouso relativo, evitar gestos que reproduzam dor\n");
        sb.append("• Crioterapia 15-20min, 3-4x/dia nas primeiras 48-72h\n");
        sb.append("• Avaliação por profissional de saúde\n\n");

        sb.append("FASE 2 — Restauração de mobilidade e ativação (1-3 semanas):\n");
        sb.append(specificRecovery(region));
        sb.append("\n");

        sb.append("FASE 3 — Reforço progressivo (3-6 semanas):\n");
        sb.append("• Cargas leves a moderadas, progressão a cada 7-10 dias\n");
        sb.append("• Exercícios isométricos → concêntricos → excêntricos\n");
        sb.append("• Reforço de musculatura adjacente para suporte\n\n");

        sb.append("FASE 4 — Retorno funcional (6+ semanas):\n");
        sb.append("• Reintroduzir gestos esportivos progressivamente\n");
        sb.append("• Trabalho de propriocepção e estabilidade\n");
        sb.append("• Retorno completo apenas com simetria e ausência de dor\n\n");

        if (severity == Injury.Severity.GRAVE) {
            sb.append("ATENÇÃO: Lesão classificada como grave. Acompanhamento médico/fisioterapêutico é obrigatório. ");
            sb.append("Os tempos sugeridos podem ser estendidos significativamente.");
        }
        return sb.toString();
    }

    private String specificRecovery(Injury.Region region) {
        return switch (region) {
            case JOELHO -> "• Mobilidade passiva e ativa de flexão/extensão\n"
                    + "• Ativação de glúteos (ponte, clamshell)\n"
                    + "• Quadríceps isométrico, leg extension leve\n";
            case OMBRO -> "• Mobilidade pendular, círculos\n"
                    + "• Ativação do manguito rotador (rotações com banda elástica)\n"
                    + "• Estabilidade escapular (retração, depressão)\n";
            case LOMBAR -> "• Cat-cow, child pose, mobilidade segmentar\n"
                    + "• Ativação de core profundo (transverso abdominal)\n"
                    + "• Hip-hinge sem carga\n";
            case TORNOZELO -> "• Mobilidade dorsiflexão\n"
                    + "• Equilíbrio em superfície estável → instável\n"
                    + "• Fortalecimento de fibulares e tibial posterior\n";
            case QUADRIL -> "• Mobilidade em flexão, extensão, abdução\n"
                    + "• Ativação de glúteo médio e máximo\n"
                    + "• Alongamento de flexores do quadril\n";
            default -> "• Mobilidade ativa progressiva da região\n"
                    + "• Ativação muscular sem carga\n"
                    + "• Trabalho neuromuscular de baixa intensidade\n";
        };
    }
}
