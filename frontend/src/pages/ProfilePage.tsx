import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { athleteApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import type { Athlete, Goal, Level } from '@/types/domain';

const LEVELS: Level[] = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'ELITE'];
const GOALS: Goal[] = [
  'HIPERTROFIA', 'FORCA', 'RESISTENCIA', 'EMAGRECIMENTO',
  'PERFORMANCE_ESPORTIVA', 'REABILITACAO', 'SAUDE_GERAL',
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Athlete>>({
    sport: 'JIU_JITSU',
    level: 'INICIANTE',
    primaryGoal: 'PERFORMANCE_ESPORTIVA',
  });
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    athleteApi.me().then((data) => {
      if (data) {
        setProfile({ ...data, sport: 'JIU_JITSU' });
        setIsExistingProfile(true);
      }
    }).catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saved = await athleteApi.upsertMe({
        birthDate: profile.birthDate,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        sport: 'JIU_JITSU',
        level: profile.level,
        primaryGoal: profile.primaryGoal,
        notes: profile.notes,
      });
      setProfile(saved);
      setIsExistingProfile(true);
      toast.success('Perfil salvo com sucesso.');
      if (!isExistingProfile) {
        // Primeira vez: deixa o OnboardingGate re-validar e avançar para o próximo passo.
        navigate('/');
      }
    } catch {
      toast.error('Erro ao salvar perfil. Verifique os campos e tente novamente.');
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
        <p>Esta versão é dedicada a praticantes de Jiu-Jitsu</p>
      </header>

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
            <label>Modalidade</label>
            <input value="Jiu-Jitsu" disabled />
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
