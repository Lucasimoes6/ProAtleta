import { useEffect, useMemo, useState } from 'react';
import { anamnesisApi } from '@/api/endpoints';
import { AnamnesisStepperForm } from '@/components/AnamnesisStepperForm';
import type { Anamnesis, PrescribedExercise } from '@/types/domain';

export default function AnamnesisPage() {
  const [latest, setLatest] = useState<Anamnesis | null>(null);
  const [history, setHistory] = useState<Anamnesis[]>([]);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    anamnesisApi.history().then((items) => {
      setHistory(items);
      setLatest(items[0] ?? null);
    }).catch(() => {});
  };

  useEffect(refresh, []);

  return (
    <>
      <header>
        <h2>Anamnese Inteligente</h2>
        <p>Coleta de dados clínicos e geração automática de relatório + prescrição</p>
      </header>

      {latest && !showForm && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16, flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <h3>Última Anamnese</h3>
                <span className="badge">{new Date(latest.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="no-print" style={{ display: 'flex', gap: 8 }}>
                <button className="ghost" onClick={() => window.print()}>
                  📄 Exportar PDF
                </button>
                <button onClick={() => setShowForm(true)}>Nova anamnese</button>
              </div>
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

          <PrescriptionCard exercises={latest.prescribedExercises ?? []} />

          {history.length > 1 && (
            <div className="card no-print" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 12 }}>Histórico de anamneses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 10).map((a, idx) => {
                  const date = new Date(a.createdAt);
                  const isLatest = idx === 0;
                  return (
                    <div key={a.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--bg-elev)', border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`badge ${isLatest ? 'primary' : ''}`}>
                          {date.toLocaleDateString('pt-BR')}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                          {a.conditioningLevel} · {a.trainingDaysPerWeek}x/sem · {a.sessionMinutes}min
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {(a.prescribedExercises?.length ?? 0) > 0 && (
                          <span className="badge accent">
                            {a.prescribedExercises!.length} exercícios
                          </span>
                        )}
                        {!isLatest && (
                          <button type="button" className="ghost"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => setLatest(a)}>
                            Ver
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {(!latest || showForm) && (
        <AnamnesisStepperForm
          onSubmitted={(created) => {
            setLatest(created);
            setHistory((h) => [created, ...h]);
            setShowForm(false);
          }}
          onCancel={latest ? () => setShowForm(false) : undefined}
        />
      )}
    </>
  );
}

function PrescriptionCard({ exercises }: { exercises: PrescribedExercise[] }) {
  const [tab, setTab] = useState<'FORTALECIMENTO' | 'ALONGAMENTO' | 'PREVENCAO'>('FORTALECIMENTO');

  const grouped = useMemo(() => ({
    FORTALECIMENTO: exercises.filter((e) => e.category === 'FORTALECIMENTO'),
    ALONGAMENTO: exercises.filter((e) => e.category === 'ALONGAMENTO'),
    PREVENCAO: exercises.filter((e) => e.category === 'PREVENCAO'),
  }), [exercises]);

  if (exercises.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 8 }}>Exercícios Prescritos para Você</h3>
        <p style={{ color: 'var(--muted)' }}>
          Nenhum exercício específico foi prescrito automaticamente.
          Adicione lesões, dificuldades ou objetivos no questionário para receber recomendações.
        </p>
      </div>
    );
  }

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: 'FORTALECIMENTO', label: '💪 Fortalecimento', count: grouped.FORTALECIMENTO.length },
    { key: 'ALONGAMENTO', label: '🧘 Alongamentos', count: grouped.ALONGAMENTO.length },
    { key: 'PREVENCAO', label: '🛡️ Prevenção', count: grouped.PREVENCAO.length },
  ];

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>Exercícios Prescritos para Você</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.key} type="button"
            className={tab === t.key ? '' : 'ghost'}
            onClick={() => setTab(t.key)}
            style={{ padding: '6px 12px', fontSize: 13 }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {grouped[tab].length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Nenhum exercício nesta categoria.</p>
        )}
        {grouped[tab].map((ex, i) => (
          <ExerciseRow key={`${ex.name}-${i}`} ex={ex} />
        ))}
      </div>
    </div>
  );
}

function ExerciseRow({ ex }: { ex: PrescribedExercise }) {
  const priorityClass =
    ex.priority === 'ALTA' ? 'danger'
    : ex.priority === 'MEDIA' ? 'warning'
    : 'primary';

  return (
    <div style={{
      background: 'var(--bg-elev)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 12,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{ex.name}</div>
        {ex.indication && (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Indicado para: {ex.indication}
          </div>
        )}
      </div>
      <span className={`badge ${priorityClass}`}>{ex.priority}</span>
    </div>
  );
}
