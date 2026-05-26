import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { athleteApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';

const TERMO_RESPONSABILIDADE = `Estou ciente de que este aplicativo é uma ferramenta de orientação e auxílio de performance esportiva, não substituindo avaliação médica ou fisioterapêutica presencial. Assumo plena responsabilidade por todas as atividades físicas praticadas com base nas orientações fornecidas pelo aplicativo, isentando os desenvolvedores e profissionais vinculados de qualquer responsabilidade sobre lesões ou agravamentos decorrentes da prática.`;

const TERMO_DADOS = `Autorizo o uso dos meus dados de saúde e desempenho exclusivamente para geração de prescrições personalizadas dentro desta plataforma. Meus dados não serão compartilhados com terceiros.`;

export default function TermsPage() {
  const [responsibilityTerm, setResponsibility] = useState(false);
  const [dataUsageTerm, setDataUsage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const canSubmit = responsibilityTerm && dataUsageTerm;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await athleteApi.acceptTerms({ responsibilityTerm, dataUsageTerm });
      toast.success('Termos aceitos.');
      navigate('/onboarding/parq');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar aceite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OnboardingProgress step={1} />
      <header>
        <h2>Termos de Uso</h2>
        <p>Leia com atenção e marque os dois itens para continuar</p>
      </header>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>1. Termo de Responsabilidade para Prática de Atividade Física</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
          {TERMO_RESPONSABILIDADE}
        </p>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={responsibilityTerm}
            onChange={(e) => setResponsibility(e.target.checked)}
            style={{ width: 'auto', marginTop: 2 }}
          />
          <span style={{ color: 'var(--text)' }}>Li e aceito o Termo de Responsabilidade.</span>
        </label>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 8 }}>2. Política de Uso de Dados</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
          {TERMO_DADOS}
        </p>
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={dataUsageTerm}
            onChange={(e) => setDataUsage(e.target.checked)}
            style={{ width: 'auto', marginTop: 2 }}
          />
          <span style={{ color: 'var(--text)' }}>Li e aceito a Política de Uso de Dados.</span>
        </label>
      </div>

      <button onClick={submit} disabled={!canSubmit || submitting}>
        {submitting ? 'Salvando...' : 'Concordar e Continuar'}
      </button>
    </>
  );
}

export function OnboardingProgress({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Termos', 'PAR-Q', 'Anamnese'];
  return (
    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? 'var(--accent)' : current ? 'var(--primary)' : 'var(--bg-elev)',
                color: done || current ? 'white' : 'var(--muted)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {done ? '✓' : n}
              </div>
              <div style={{
                marginLeft: 8,
                fontSize: 13,
                fontWeight: current ? 600 : 400,
                color: current ? 'var(--text)' : 'var(--muted)',
              }}>
                {label}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: done ? 'var(--accent)' : 'var(--border)',
                  margin: '0 12px',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
