import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { trainingApi } from '@/api/endpoints';
import type { TrainingPlan, TrainingWeek } from '@/types/domain';

const PHASE_COLORS: Record<string, string> = {
  BASE: '#4fa8ff',
  INTENSIDADE: '#f59e0b',
  PICO: '#ef4444',
  RECUPERACAO: '#6ee7b7',
};

export default function TrainingPage() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<TrainingWeek | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainingApi.current().then((p) => {
      if (p) {
        setPlan(p);
        setSelectedWeek(p.weeks?.[0] ?? null);
      }
    }).catch(() => {});
  }, []);

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const newPlan = await trainingApi.generate();
      setPlan(newPlan);
      setSelectedWeek(newPlan.weeks[0]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Faça uma anamnese antes de gerar o plano.');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (sessionId: string) => {
    await trainingApi.completeSession(sessionId);
    const refreshed = await trainingApi.current();
    setPlan(refreshed);
    if (selectedWeek) {
      const updated = refreshed.weeks.find((w) => w.id === selectedWeek.id);
      if (updated) setSelectedWeek(updated);
    }
  };

  if (!plan) {
    return (
      <>
        <header>
          <h2>Plano de Treinamento</h2>
          <p>Periodização inteligente baseada na sua anamnese</p>
        </header>
        {error && <div className="error">{error}</div>}
        <div className="card empty">
          <h3>Nenhum plano ativo</h3>
          <p style={{ margin: '12px 0 20px' }}>
            Gere automaticamente um plano de 12 semanas baseado no seu perfil.
          </p>
          <button onClick={generate} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar plano'}
          </button>
        </div>
      </>
    );
  }

  const chartData = plan.weeks.map((w) => ({
    semana: `S${w.weekNumber}`,
    volume: w.volumeLoad,
    intensidade: w.intensityLoad,
    phase: w.phase,
  }));

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>{plan.name}</h2>
          <p>
            {new Date(plan.startDate).toLocaleDateString('pt-BR')} →{' '}
            {new Date(plan.endDate).toLocaleDateString('pt-BR')} ·{' '}
            <span className="badge primary">{plan.currentPhase}</span>
          </p>
        </div>
        <button className="ghost" onClick={generate} disabled={loading}>
          Regerar plano
        </button>
      </header>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Curva de Periodização (12 semanas)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b3457" />
            <XAxis dataKey="semana" stroke="#8b95b1" />
            <YAxis stroke="#8b95b1" />
            <Tooltip
              contentStyle={{ background: '#1c2444', border: '1px solid #2b3457', borderRadius: 8 }}
            />
            <Legend />
            <Line type="monotone" dataKey="volume" stroke="#4fa8ff" strokeWidth={2} />
            <Line type="monotone" dataKey="intensidade" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Selecione a semana</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {plan.weeks.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWeek(w)}
              className={selectedWeek?.id === w.id ? '' : 'ghost'}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                borderLeft: `3px solid ${PHASE_COLORS[w.phase]}`,
              }}
            >
              S{w.weekNumber}
            </button>
          ))}
        </div>
      </div>

      {selectedWeek && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3>Semana {selectedWeek.weekNumber} · {selectedWeek.phase}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{selectedWeek.focus}</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="metric">
                <span className="label">Volume</span>
                <span className="value" style={{ fontSize: 18 }}>{selectedWeek.volumeLoad}%</span>
              </div>
              <div className="metric">
                <span className="label">Intensidade</span>
                <span className="value" style={{ fontSize: 18 }}>{selectedWeek.intensityLoad}%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {selectedWeek.sessions.map((s) => (
              <div key={s.id} className="card" style={{ background: 'var(--bg-elev)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <strong>{s.dayOfWeek}</strong> · {s.title}
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {s.durationMinutes} min · {s.description}
                    </div>
                  </div>
                  <button
                    className={s.completed ? 'ghost' : ''}
                    onClick={() => !s.completed && completeSession(s.id)}
                    disabled={s.completed}
                    style={{ padding: '6px 12px', fontSize: 13 }}
                  >
                    {s.completed ? '✓ Concluído' : 'Marcar concluído'}
                  </button>
                </div>
                <table style={{ width: '100%', fontSize: 13, marginTop: 8 }}>
                  <thead>
                    <tr style={{ color: 'var(--muted)', textAlign: 'left' }}>
                      <th>Exercício</th>
                      <th>Séries</th>
                      <th>Reps</th>
                      <th>Carga</th>
                      <th>Descanso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.exercises.map((e) => (
                      <tr key={e.id}>
                        <td style={{ padding: '6px 0' }}>
                          <strong>{e.name}</strong>
                          {e.instructions && (
                            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{e.instructions}</div>
                          )}
                        </td>
                        <td>{e.sets ?? '-'}</td>
                        <td>{e.reps ?? '-'}</td>
                        <td>{e.load ?? '-'}</td>
                        <td>{e.rest ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Distribuição da semana</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={selectedWeek.sessions.map((s) => ({
                  dia: s.dayOfWeek.slice(0, 3),
                  duracao: s.durationMinutes,
                }))}
              >
                <XAxis dataKey="dia" stroke="#8b95b1" />
                <YAxis stroke="#8b95b1" />
                <Tooltip
                  contentStyle={{ background: '#1c2444', border: '1px solid #2b3457', borderRadius: 8 }}
                />
                <Bar dataKey="duracao" fill="#4fa8ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
