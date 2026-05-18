import { useEffect, useState, FormEvent } from 'react';
import { injuryApi } from '@/api/endpoints';
import type { Injury } from '@/types/domain';

const TYPES = ['MUSCULAR', 'LIGAMENTAR', 'TENDINOSA', 'OSSEA', 'ARTICULAR', 'MENISCAL', 'OUTRA'];
const REGIONS = [
  'JOELHO', 'OMBRO', 'LOMBAR', 'CERVICAL', 'QUADRIL', 'TORNOZELO', 'COTOVELO', 'PUNHO',
  'COXA', 'PANTURRILHA', 'BRACO', 'ANTEBRACO', 'OUTRO',
];
const SEVERITIES = ['LEVE', 'MODERADA', 'GRAVE'];

export default function InjuriesPage() {
  const [list, setList] = useState<Injury[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Injury | null>(null);
  const [form, setForm] = useState({
    type: 'MUSCULAR',
    region: 'JOELHO',
    severity: 'LEVE',
    onsetDate: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const refresh = () => injuryApi.list().then(setList).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await injuryApi.create(form as Partial<Injury>);
      await refresh();
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const resolve = async (id: string) => {
    await injuryApi.resolve(id);
    await refresh();
    if (selected?.id === id) setSelected(null);
  };

  const severityClass = (s: string) =>
    s === 'GRAVE' ? 'danger' : s === 'MODERADA' ? 'warning' : '';

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>Lesões e Reabilitação</h2>
          <p>Registre lesões para receber protocolos personalizados</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancelar' : 'Nova lesão'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
          <div className="row cols-2">
            <div className="field">
              <label>Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Região</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="row cols-2">
            <div className="field">
              <label>Gravidade</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Data de início</label>
              <input
                type="date"
                value={form.onsetDate}
                onChange={(e) => setForm({ ...form, onsetDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Registrar e gerar protocolo'}
          </button>
        </form>
      )}

      {list.length === 0 && !showForm && (
        <div className="card empty">
          <h3>Sem lesões registradas</h3>
          <p>Você está em dia com sua saúde. Bons treinos!</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {list.map((i) => (
          <div key={i.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4>
                  {i.region} · {i.type}{' '}
                  <span className={`badge ${severityClass(i.severity)}`}>{i.severity}</span>
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                  Início: {new Date(i.onsetDate).toLocaleDateString('pt-BR')} ·{' '}
                  Status: <span className="badge">{i.status}</span>
                </p>
                {i.description && <p style={{ marginTop: 8 }}>{i.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="ghost"
                  onClick={() => setSelected(selected?.id === i.id ? null : i)}
                  style={{ fontSize: 13, padding: '6px 12px' }}
                >
                  {selected?.id === i.id ? 'Fechar' : 'Ver protocolo'}
                </button>
                {i.status !== 'RECUPERADA' && (
                  <button
                    onClick={() => resolve(i.id)}
                    style={{ fontSize: 13, padding: '6px 12px' }}
                  >
                    Marcar recuperada
                  </button>
                )}
              </div>
            </div>
            {selected?.id === i.id && i.rehabProtocol && (
              <pre style={{ marginTop: 16 }}>{i.rehabProtocol}</pre>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
