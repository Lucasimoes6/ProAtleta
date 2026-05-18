import { useEffect, useState, FormEvent } from 'react';
import { anamnesisApi } from '@/api/endpoints';
import type { Anamnesis, ConditioningLevel, PainLocation } from '@/types/domain';

const CONDITIONING: ConditioningLevel[] = ['SEDENTARIO', 'BAIXO', 'MODERADO', 'BOM', 'ALTO'];
const PAIN_LOCATIONS: PainLocation[] = [
  'JOELHO', 'OMBRO', 'LOMBAR', 'CERVICAL', 'QUADRIL', 'TORNOZELO', 'COTOVELO', 'PUNHO',
];

export default function AnamnesisPage() {
  const [latest, setLatest] = useState<Anamnesis | null>(null);
  const [form, setForm] = useState({
    conditioningLevel: 'MODERADO' as ConditioningLevel,
    trainingDaysPerWeek: 3,
    sessionMinutes: 60,
    currentPain: [] as PainLocation[],
    injuryHistory: '',
    strengths: '',
    weaknesses: '',
    asymmetryReported: false,
    posturalDeviationReported: false,
    restingHeartRate: 70,
    averageSleepHours: 7,
    perceivedStressLevel: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    anamnesisApi.latest().then((d) => d && setLatest(d)).catch(() => {});
  }, []);

  const togglePain = (p: PainLocation) => {
    setForm((f) => ({
      ...f,
      currentPain: f.currentPain.includes(p)
        ? f.currentPain.filter((x) => x !== p)
        : [...f.currentPain, p],
    }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const created = await anamnesisApi.create({
        ...form,
        injuryHistory: form.injuryHistory ? form.injuryHistory.split(',').map((s) => s.trim()) : [],
        strengths: form.strengths ? form.strengths.split(',').map((s) => s.trim()) : [],
        weaknesses: form.weaknesses ? form.weaknesses.split(',').map((s) => s.trim()) : [],
      });
      setLatest(created);
      setShowForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao registrar anamnese.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <h2>Anamnese Inteligente</h2>
        <p>Coleta de dados clínicos e geração automática de relatório</p>
      </header>

      {error && <div className="error">{error}</div>}

      {latest && !showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3>Última Anamnese</h3>
              <span className="badge">{new Date(latest.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <button onClick={() => setShowForm(true)}>Nova anamnese</button>
          </div>

          <div className="row cols-3" style={{ marginBottom: 20 }}>
            <div className="metric">
              <span className="label">Condicionamento</span>
              <span className="value" style={{ fontSize: 18 }}>{latest.conditioningLevel}</span>
            </div>
            <div className="metric">
              <span className="label">Frequência</span>
              <span className="value" style={{ fontSize: 18 }}>{latest.trainingDaysPerWeek}x/sem</span>
            </div>
            <div className="metric">
              <span className="label">Sessão</span>
              <span className="value" style={{ fontSize: 18 }}>{latest.sessionMinutes} min</span>
            </div>
          </div>

          <h4 style={{ marginBottom: 8 }}>Relatório automático</h4>
          <pre>{latest.autoReport}</pre>
        </div>
      )}

      {(!latest || showForm) && (
        <form onSubmit={submit} className="card">
          <h3 style={{ marginBottom: 16 }}>Questionário</h3>

          <div className="row cols-3">
            <div className="field">
              <label>Nível de condicionamento</label>
              <select
                value={form.conditioningLevel}
                onChange={(e) => setForm({ ...form, conditioningLevel: e.target.value as ConditioningLevel })}
              >
                {CONDITIONING.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Treinos por semana</label>
              <input
                type="number" min={0} max={7}
                value={form.trainingDaysPerWeek}
                onChange={(e) => setForm({ ...form, trainingDaysPerWeek: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Minutos por sessão</label>
              <input
                type="number" min={15} max={240}
                value={form.sessionMinutes}
                onChange={(e) => setForm({ ...form, sessionMinutes: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="field">
            <label>Dores atuais (clique para selecionar)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PAIN_LOCATIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={form.currentPain.includes(p) ? '' : 'ghost'}
                  onClick={() => togglePain(p)}
                  style={{ padding: '6px 12px', fontSize: 13 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Histórico de lesões (separadas por vírgula)</label>
            <input
              value={form.injuryHistory}
              onChange={(e) => setForm({ ...form, injuryHistory: e.target.value })}
              placeholder="Ex: Entorse de tornozelo 2022, Tendinite no ombro 2023"
            />
          </div>

          <div className="row cols-2">
            <div className="field">
              <label>Pontos fortes (separados por vírgula)</label>
              <input
                value={form.strengths}
                onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                placeholder="Ex: Força de pernas, Flexibilidade"
              />
            </div>
            <div className="field">
              <label>Pontos fracos (separados por vírgula)</label>
              <input
                value={form.weaknesses}
                onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
                placeholder="Ex: Resistência aeróbica, Mobilidade torácica"
              />
            </div>
          </div>

          <div className="row cols-2">
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={form.asymmetryReported}
                  onChange={(e) => setForm({ ...form, asymmetryReported: e.target.checked })}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                Notei assimetrias musculares
              </label>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={form.posturalDeviationReported}
                  onChange={(e) => setForm({ ...form, posturalDeviationReported: e.target.checked })}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                Notei desvios posturais
              </label>
            </div>
          </div>

          <div className="row cols-3">
            <div className="field">
              <label>FC repouso (bpm)</label>
              <input
                type="number" min={30} max={220}
                value={form.restingHeartRate}
                onChange={(e) => setForm({ ...form, restingHeartRate: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Sono médio (h)</label>
              <input
                type="number" min={0} max={24}
                value={form.averageSleepHours}
                onChange={(e) => setForm({ ...form, averageSleepHours: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Estresse (1-10)</label>
              <input
                type="number" min={1} max={10}
                value={form.perceivedStressLevel}
                onChange={(e) => setForm({ ...form, perceivedStressLevel: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Gerar relatório'}
            </button>
            {latest && (
              <button type="button" className="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}
