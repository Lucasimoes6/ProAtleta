import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { anamnesisApi, athleteApi, injuryApi, trainingApi } from '@/api/endpoints';
import { useThemeStore } from '@/store/theme';
import type { Anamnesis, Athlete, Injury, TrainingPlan } from '@/types/domain';

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function DashboardPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const theme = useThemeStore((s) => s.theme);

  const chartColors = useMemo(() => ({
    primary: readCssVar('--primary', '#4fa8ff'),
    grid: readCssVar('--chart-grid', '#2b3457'),
    axis: readCssVar('--chart-axis', '#8b95b1'),
    tooltipBg: readCssVar('--bg-elev', '#1c2444'),
    tooltipBorder: readCssVar('--border', '#2b3457'),
    tooltipText: readCssVar('--text', '#e8ecf3'),
  }), [theme]);

  useEffect(() => {
    athleteApi.me().then((a) => a && setAthlete(a)).catch(() => {});
    anamnesisApi.latest().then((a) => a && setAnamnesis(a)).catch(() => {});
    trainingApi.current().then((p) => p && setPlan(p)).catch(() => {});
    injuryApi.list().then(setInjuries).catch(() => {});
  }, []);

  const completedSessions = plan?.weeks
    .flatMap((w) => w.sessions)
    .filter((s) => s.completed).length ?? 0;
  const totalSessions = plan?.weeks
    .flatMap((w) => w.sessions).length ?? 0;
  const completionRate = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const activeInjuries = injuries.filter((i) => i.status !== 'RECUPERADA').length;

  const phaseData = plan?.weeks.map((w) => ({
    semana: `S${w.weekNumber}`,
    carga: Math.round((w.volumeLoad + w.intensityLoad) / 2),
  })) ?? [];

  return (
    <>
      <header>
        <h2>Olá{athlete?.fullName ? `, ${athlete.fullName.split(' ')[0]}` : ''}!</h2>
        <p>Visão geral da sua jornada de treinamento</p>
      </header>

      {!athlete && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Complete seu perfil</h3>
          <p style={{ margin: '8px 0 16px', color: 'var(--muted)' }}>
            Para receber recomendações personalizadas, preencha seu perfil de atleta.
          </p>
          <Link to="/profile">
            <button>Ir para perfil</button>
          </Link>
        </div>
      )}

      <div className="row cols-3" style={{ marginBottom: 16 }}>
        <div className="card metric">
          <span className="label">Plano atual</span>
          <span className="value">{plan ? plan.currentPhase : '—'}</span>
          {plan && <span className="badge primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            {plan.weeks.length} semanas
          </span>}
        </div>
        <div className="card metric">
          <span className="label">Sessões concluídas</span>
          <span className="value">{completedSessions}/{totalSessions}</span>
          <span className="badge accent" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            {completionRate}% completo
          </span>
        </div>
        <div className="card metric">
          <span className="label">Lesões ativas</span>
          <span className="value">{activeInjuries}</span>
          {activeInjuries > 0 && <span className="badge warning" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            Atenção
          </span>}
        </div>
      </div>

      {plan && phaseData.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>Carga ao longo das semanas</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={phaseData}>
              <defs>
                <linearGradient id="colorCarga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.7} />
                  <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="semana" stroke={chartColors.axis} />
              <YAxis stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{
                  background: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: 8,
                  color: chartColors.tooltipText,
                }}
              />
              <Area type="monotone" dataKey="carga" stroke={chartColors.primary} fillOpacity={1} fill="url(#colorCarga)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {anamnesis && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Resumo da Anamnese</h3>
            <Link to="/anamnesis"><span className="badge">ver detalhes</span></Link>
          </div>
          <div className="row cols-3">
            <div className="metric">
              <span className="label">Condicionamento</span>
              <span className="value" style={{ fontSize: 18 }}>{anamnesis.conditioningLevel}</span>
            </div>
            <div className="metric">
              <span className="label">Sono médio</span>
              <span className="value" style={{ fontSize: 18 }}>{anamnesis.averageSleepHours ?? '—'}h</span>
            </div>
            <div className="metric">
              <span className="label">Estresse</span>
              <span className="value" style={{ fontSize: 18 }}>{anamnesis.perceivedStressLevel ?? '—'}/10</span>
            </div>
          </div>
        </div>
      )}

      {anamnesis?.prescribedExercises && anamnesis.prescribedExercises.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Prescrição de Exercícios</h3>
            <Link to="/anamnesis"><span className="badge">ver todos</span></Link>
          </div>
          <div className="row cols-3">
            <div className="metric">
              <span className="label">💪 Fortalecimento</span>
              <span className="value" style={{ fontSize: 22 }}>
                {anamnesis.prescribedExercises.filter((e) => e.category === 'FORTALECIMENTO').length}
              </span>
            </div>
            <div className="metric">
              <span className="label">🧘 Alongamentos</span>
              <span className="value" style={{ fontSize: 22 }}>
                {anamnesis.prescribedExercises.filter((e) => e.category === 'ALONGAMENTO').length}
              </span>
            </div>
            <div className="metric">
              <span className="label">🛡️ Prevenção</span>
              <span className="value" style={{ fontSize: 22 }}>
                {anamnesis.prescribedExercises.filter((e) => e.category === 'PREVENCAO').length}
              </span>
            </div>
          </div>
          {anamnesis.prescribedExercises.some((e) => e.priority === 'ALTA') && (
            <div style={{ marginTop: 12 }}>
              <span className="badge danger">
                {anamnesis.prescribedExercises.filter((e) => e.priority === 'ALTA').length} de alta prioridade
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
