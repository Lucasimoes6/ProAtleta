import { useEffect, useState } from 'react';
import { exerciseLibraryApi } from '@/api/endpoints';
import type {
  LibraryExercise, LibraryExerciseCategory, LibraryExerciseStage,
} from '@/types/domain';

const CATEGORY_ICONS: Record<LibraryExerciseCategory, string> = {
  MOBILIDADE: '🏃',
  PREVENTIVO: '🛡️',
  FORTALECIMENTO: '💪',
  ALONGAMENTO: '🧘',
  PLIOMETRICO: '⚡',
};

const CATEGORIES: LibraryExerciseCategory[] =
  ['MOBILIDADE', 'PREVENTIVO', 'FORTALECIMENTO', 'ALONGAMENTO', 'PLIOMETRICO'];

const STAGES: LibraryExerciseStage[] = ['PREVENCAO', 'REABILITACAO', 'PERFORMANCE'];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<LibraryExerciseCategory | ''>('');
  const [stage, setStage] = useState<LibraryExerciseStage | ''>('');
  const [region, setRegion] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    exerciseLibraryApi
      .list({
        category: category || undefined,
        stage: stage || undefined,
        region: region || undefined,
      })
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, [category, stage, region]);

  const filtered = exercises.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    items: filtered.filter((e) => e.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <header>
        <h2>Banco de Exercícios</h2>
        <p>Explore os exercícios disponíveis para prescrição</p>
      </header>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row cols-3" style={{ marginBottom: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as LibraryExerciseCategory | '')}>
              <option value="">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Estágio</label>
            <select value={stage} onChange={(e) => setStage(e.target.value as LibraryExerciseStage | '')}>
              <option value="">Todos</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Região anatômica</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Ex: joelho, ombro, core"
            />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Buscar por nome</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite parte do nome"
          />
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="skeleton" style={{ height: 80, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 80, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 80 }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty">Nenhum exercício encontrado com esses filtros.</div>
      )}

      {!loading && byCategory.map((group) => (
        <div className="card" key={group.category} style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>
            {CATEGORY_ICONS[group.category]} {group.category}
            <span className="badge" style={{ marginLeft: 8 }}>{group.items.length}</span>
          </h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {group.items.map((ex) => <ExerciseCard key={ex.id} ex={ex} />)}
          </div>
        </div>
      ))}
    </>
  );
}

function ExerciseCard({ ex }: { ex: LibraryExercise }) {
  return (
    <div style={{
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
        <strong style={{ fontSize: 14 }}>{ex.name}</strong>
        <span className="badge">{ex.difficultyLevel}</span>
      </div>
      {ex.description && (
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{ex.description}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
        {ex.sets && <span>📊 {ex.sets} séries</span>}
        {ex.repetitions && <span>🔁 {ex.repetitions} reps</span>}
        {ex.durationSeconds && <span>⏱ {ex.durationSeconds}s</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {ex.stage.map((s) => (
          <span key={s} className="badge primary" style={{ fontSize: 11 }}>{s}</span>
        ))}
        {ex.targetRegions.map((r) => (
          <span key={r} className="badge" style={{ fontSize: 11 }}>{r}</span>
        ))}
      </div>
      {ex.indicatedFor.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
          <strong>Indicado para:</strong> {ex.indicatedFor.join(', ')}
        </div>
      )}
      {ex.contraindicatedFor.length > 0 && (
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--danger)' }}>
          <strong>⚠ Contraindicado:</strong> {ex.contraindicatedFor.join(', ')}
        </div>
      )}
    </div>
  );
}
