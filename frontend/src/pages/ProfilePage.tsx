import { useEffect, useState, FormEvent } from 'react';
import { athleteApi } from '@/api/endpoints';
import type { Athlete, Goal, Level, Sport } from '@/types/domain';

const SPORTS: Sport[] = [
  'FUTEBOL', 'CORRIDA', 'CICLISMO', 'NATACAO', 'MUSCULACAO', 'CROSSFIT',
  'VOLEI', 'BASQUETE', 'TENIS', 'LUTAS', 'OUTRO',
];
const LEVELS: Level[] = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'ELITE'];
const GOALS: Goal[] = [
  'HIPERTROFIA', 'FORCA', 'RESISTENCIA', 'EMAGRECIMENTO',
  'PERFORMANCE_ESPORTIVA', 'REABILITACAO', 'SAUDE_GERAL',
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Athlete>>({
    sport: 'CORRIDA',
    level: 'INICIANTE',
    primaryGoal: 'SAUDE_GERAL',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    athleteApi.me().then((data) => {
      if (data) setProfile(data);
    }).catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const saved = await athleteApi.upsertMe(profile);
      setProfile(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Erro ao salvar perfil. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof Athlete>(key: K, value: Athlete[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  return (
    <>
      <header>
        <h2>Perfil do Atleta</h2>
        <p>Conte sobre você para receber um plano personalizado</p>
      </header>

      {error && <div className="error">{error}</div>}
      {saved && (
        <div style={{ marginBottom: 16 }}>
          <span className="badge accent">Perfil salvo com sucesso</span>
        </div>
      )}

      <form onSubmit={submit} className="card">
        <div className="row cols-2">
          <div className="field">
            <label>Data de nascimento</label>
            <input
              type="date"
              required
              value={profile.birthDate ?? ''}
              onChange={(e) => update('birthDate', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Esporte</label>
            <select
              value={profile.sport}
              onChange={(e) => update('sport', e.target.value as Sport)}
            >
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="row cols-2">
          <div className="field">
            <label>Altura (cm)</label>
            <input
              type="number"
              step="0.1"
              value={profile.heightCm ?? ''}
              onChange={(e) => update('heightCm', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={profile.weightKg ?? ''}
              onChange={(e) => update('weightKg', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="row cols-2">
          <div className="field">
            <label>Nível</label>
            <select
              value={profile.level}
              onChange={(e) => update('level', e.target.value as Level)}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Objetivo principal</label>
            <select
              value={profile.primaryGoal}
              onChange={(e) => update('primaryGoal', e.target.value as Goal)}
            >
              {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Observações</label>
          <textarea
            rows={3}
            value={profile.notes ?? ''}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Restrições, preferências, contexto..."
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
    </>
  );
}
