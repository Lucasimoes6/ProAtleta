import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parqApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import { OnboardingProgress } from './TermsPage';

const QUESTIONS = [
  'Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionado por profissionais de saúde?',
  'Você sente dores no peito quando pratica atividade física?',
  'No último mês, você sentiu dores no peito quando praticou atividade física?',
  'Você apresenta desequilíbrio devido à tontura e/ou perda de consciência?',
  'Você possui algum problema ósseo ou articular que poderia ser piorado pela atividade física?',
  'Você toma atualmente algum medicamento para pressão arterial e/ou problema de coração?',
  'Sabe de alguma outra razão pela qual você não deve praticar atividade física?',
];

export default function PARQPage() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(7).fill(null));
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const allAnswered = answers.every((a) => a !== null);
  const hasAnyRisk = useMemo(() => answers.some((a) => a === true), [answers]);
  const canSubmit = allAnswered && (!hasAnyRisk || acceptedRisk);

  const set = (idx: number, value: boolean) =>
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await parqApi.submit({
        q1: answers[0]!, q2: answers[1]!, q3: answers[2]!, q4: answers[3]!,
        q5: answers[4]!, q6: answers[5]!, q7: answers[6]!,
        acceptedRisk: hasAnyRisk ? acceptedRisk : undefined,
      });
      toast.success('PAR-Q registrado.');
      navigate('/onboarding/anamnesis');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao salvar PAR-Q.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OnboardingProgress step={2} />
      <header>
        <h2>PAR-Q — Questionário de Prontidão para Atividade Física</h2>
        <p>Responda Sim ou Não a cada pergunta abaixo</p>
      </header>

      <div className="card" style={{ marginBottom: 16 }}>
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '14px 0',
            borderBottom: i < QUESTIONS.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--primary)' }}>{i + 1}.</strong> {q}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                className={answers[i] === false ? '' : 'ghost'}
                onClick={() => set(i, false)}
                style={{ padding: '6px 18px', fontSize: 13, minWidth: 60 }}
              >
                Não
              </button>
              <button
                type="button"
                className={answers[i] === true ? 'danger' : 'ghost'}
                onClick={() => set(i, true)}
                style={{ padding: '6px 18px', fontSize: 13, minWidth: 60 }}
              >
                Sim
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasAnyRisk && (
        <div className="card" style={{
          marginBottom: 16,
          borderColor: 'var(--warning)',
          background: 'rgba(245, 158, 11, 0.05)',
        }}>
          <h4 style={{ color: 'var(--warning)', marginBottom: 8 }}>⚠ Atenção</h4>
          <p style={{ marginBottom: 12 }}>
            Com base nas suas respostas, recomendamos que você consulte um médico antes
            de iniciar atividades físicas. Você pode continuar, mas assume total
            responsabilidade pela prática.
          </p>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={acceptedRisk}
              onChange={(e) => setAcceptedRisk(e.target.checked)}
              style={{ width: 'auto', marginTop: 2 }}
            />
            <span>Declaro estar ciente do risco e assumo total responsabilidade pela minha prática.</span>
          </label>
        </div>
      )}

      <button onClick={submit} disabled={!canSubmit || submitting}>
        {submitting ? 'Enviando...' : 'Continuar para Anamnese'}
      </button>
    </>
  );
}
