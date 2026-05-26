import { useEffect, useState, ReactNode } from 'react';
import { anamnesisApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';
import type {
  Anamnesis, ConditioningLevel, CreateAnamnesisRequest, ImprovementGoal,
  JiuJitsuDifficulty, JiuJitsuInjury, PainLocation, PhysicalLimitation,
} from '@/types/domain';

const DRAFT_KEY = 'anamnesis-draft-v3';

const CONDITIONING: ConditioningLevel[] = ['SEDENTARIO', 'BAIXO', 'MODERADO', 'BOM', 'ALTO'];
const PAIN_LOCATIONS: PainLocation[] = [
  'JOELHO', 'OMBRO', 'LOMBAR', 'CERVICAL', 'QUADRIL', 'TORNOZELO', 'COTOVELO', 'PUNHO',
];

const IMPROVEMENT_GOALS: { value: ImprovementGoal; label: string }[] = [
  { value: 'FORCA', label: 'Força' },
  { value: 'FLEXIBILIDADE', label: 'Flexibilidade' },
  { value: 'RESISTENCIA', label: 'Resistência' },
  { value: 'EQUILIBRIO', label: 'Equilíbrio' },
  { value: 'VELOCIDADE', label: 'Velocidade' },
  { value: 'CONDICIONAMENTO_GERAL', label: 'Condicionamento geral' },
];

const PHYSICAL_LIMITATIONS: { value: PhysicalLimitation; label: string }[] = [
  { value: 'DOR_CRONICA', label: 'Dor crônica' },
  { value: 'MOBILIDADE_REDUZIDA', label: 'Mobilidade reduzida' },
  { value: 'POS_CIRURGICO', label: 'Pós-cirúrgico' },
  { value: 'SEM_LIMITACOES', label: 'Sem limitações' },
  { value: 'OUTRO', label: 'Outro' },
];

const JJ_INJURIES_BY_REGION: { region: string; items: { value: JiuJitsuInjury; label: string }[] }[] = [
  { region: 'Joelho', items: [
    { value: 'ENTORSE_JOELHO', label: 'Entorse de joelho' },
    { value: 'LESAO_MENISCO', label: 'Lesão de menisco' },
    { value: 'LESAO_LCA', label: 'Lesão do LCA' },
  ]},
  { region: 'Ombro', items: [
    { value: 'LUXACAO_OMBRO', label: 'Luxação de ombro' },
    { value: 'TENDINITE_OMBRO', label: 'Tendinite de ombro' },
    { value: 'LESAO_MANGUITO_ROTADOR', label: 'Lesão do manguito rotador' },
  ]},
  { region: 'Dedos / Mãos', items: [
    { value: 'ENTORSE_DEDO', label: 'Entorse de dedo' },
    { value: 'INFLAMACAO_DEDO', label: 'Inflamação nos dedos' },
  ]},
  { region: 'Coluna', items: [
    { value: 'LOMBALGIA', label: 'Lombalgia' },
    { value: 'HERNIA_DISCO', label: 'Hérnia de disco' },
    { value: 'CONTRATURA_MUSCULAR', label: 'Contratura muscular' },
  ]},
  { region: 'Cotovelo', items: [
    { value: 'HIPEREXTENSAO_COTOVELO', label: 'Hiperextensão de cotovelo' },
    { value: 'EPICONDILITE', label: 'Epicondilite' },
  ]},
  { region: 'Tornozelo', items: [
    { value: 'ENTORSE_TORNOZELO', label: 'Entorse de tornozelo' },
    { value: 'ESTIRAMENTO_LIGAMENTAR', label: 'Estiramento ligamentar' },
  ]},
];

const JJ_DIFFICULTIES: { value: JiuJitsuDifficulty; label: string }[] = [
  { value: 'PASSAR_GUARDA', label: 'Passar guarda' },
  { value: 'REPOR_GUARDA', label: 'Repor guarda' },
  { value: 'FAZER_GUARDA', label: 'Fazer guarda' },
  { value: 'RASPAR', label: 'Raspar' },
  { value: 'PROJECOES', label: 'Projeções' },
  { value: 'FINALIZACOES', label: 'Finalizações' },
  { value: 'MOVIMENTACAO_EM_PE', label: 'Movimentação em pé' },
  { value: 'MOVIMENTACAO_NO_CHAO', label: 'Movimentação no chão' },
];

type FormState = {
  conditioningLevel: ConditioningLevel;
  trainingDaysPerWeek: number;
  sessionMinutes: number;
  currentPain: PainLocation[];
  injuryHistory: string;
  recoveringFromInjury: boolean;
  currentInjuryDescription: string;
  improvementGoals: ImprovementGoal[];
  physicalLimitations: PhysicalLimitation[];
  physicalLimitationsOther: string;
  jiuJitsuInjuriesHad: JiuJitsuInjury[];
  jiuJitsuInjuriesCurrent: JiuJitsuInjury[];
  jiuJitsuDifficulties: JiuJitsuDifficulty[];
  restingHeartRate: number;
  averageSleepHours: number;
  perceivedStressLevel: number;
  asymmetryReported: boolean;
  posturalDeviationReported: boolean;
};

const INITIAL_FORM: FormState = {
  conditioningLevel: 'MODERADO',
  trainingDaysPerWeek: 3,
  sessionMinutes: 60,
  currentPain: [],
  injuryHistory: '',
  recoveringFromInjury: false,
  currentInjuryDescription: '',
  improvementGoals: [],
  physicalLimitations: [],
  physicalLimitationsOther: '',
  jiuJitsuInjuriesHad: [],
  jiuJitsuInjuriesCurrent: [],
  jiuJitsuDifficulties: [],
  restingHeartRate: 70,
  averageSleepHours: 7,
  perceivedStressLevel: 5,
  asymmetryReported: false,
  posturalDeviationReported: false,
};

const STEPS = [
  'Perfil Físico',
  'Saúde & Histórico',
  'Limitações & Objetivos',
  'Jiu-Jitsu',
  'Estilo de Vida',
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export interface AnamnesisStepperFormProps {
  onSubmitted: (created: Anamnesis) => void;
  onCancel?: () => void;
  /** Mostrar título da página? Em onboarding, o header é separado. */
  hideTitle?: boolean;
}

export function AnamnesisStepperForm({ onSubmitted, onCancel, hideTitle }: AnamnesisStepperFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => loadDraft());
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* quota — ignore */ }
  }, [form]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: CreateAnamnesisRequest = {
        conditioningLevel: form.conditioningLevel,
        trainingDaysPerWeek: form.trainingDaysPerWeek,
        sessionMinutes: form.sessionMinutes,
        currentPain: form.currentPain,
        injuryHistory: form.injuryHistory
          ? form.injuryHistory.split(',').map((s) => s.trim()).filter(Boolean) : [],
        recoveringFromInjury: form.recoveringFromInjury,
        currentInjuryDescription: form.recoveringFromInjury ? form.currentInjuryDescription : '',
        improvementGoals: form.improvementGoals,
        physicalLimitations: form.physicalLimitations,
        physicalLimitationsOther: form.physicalLimitations.includes('OUTRO')
          ? form.physicalLimitationsOther : '',
        jiuJitsuInjuriesHad: form.jiuJitsuInjuriesHad,
        jiuJitsuInjuriesCurrent: form.jiuJitsuInjuriesCurrent,
        jiuJitsuDifficulties: form.jiuJitsuDifficulties,
        restingHeartRate: form.restingHeartRate,
        averageSleepHours: form.averageSleepHours,
        perceivedStressLevel: form.perceivedStressLevel,
        asymmetryReported: form.asymmetryReported,
        posturalDeviationReported: form.posturalDeviationReported,
      };
      const created = await anamnesisApi.create(payload);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      toast.success('Anamnese registrada e prescrição gerada.');
      onSubmitted(created);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar anamnese.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <StepHeader step={step} title={hideTitle ? undefined : 'Anamnese'} />

      {step === 1 && <Step1 form={form} set={set} />}
      {step === 2 && <Step2 form={form} set={set} togglePain={(p) => set('currentPain', toggle(form.currentPain, p))} />}
      {step === 3 && <Step3 form={form} set={set}
        toggleGoal={(g) => set('improvementGoals', toggle(form.improvementGoals, g))}
        toggleLimitation={(l) => set('physicalLimitations', toggleLimitation(form.physicalLimitations, l))}
      />}
      {step === 4 && <Step4 form={form} set={set}
        toggleHad={(i) => set('jiuJitsuInjuriesHad', toggle(form.jiuJitsuInjuriesHad, i))}
        toggleCurrent={(i) => {
          const cur = toggle(form.jiuJitsuInjuriesCurrent, i);
          set('jiuJitsuInjuriesCurrent', cur);
          if (cur.includes(i) && !form.jiuJitsuInjuriesHad.includes(i)) {
            set('jiuJitsuInjuriesHad', [...form.jiuJitsuInjuriesHad, i]);
          }
        }}
        toggleDifficulty={(d) => set('jiuJitsuDifficulties', toggle(form.jiuJitsuDifficulties, d))}
      />}
      {step === 5 && <Step5 form={form} set={set} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCancel && (
            <button type="button" className="ghost" onClick={onCancel}>
              Cancelar
            </button>
          )}
          {step > 1 && (
            <button type="button" className="ghost" onClick={prev}>
              ← Voltar
            </button>
          )}
        </div>
        <div>
          {step < STEPS.length && (
            <button type="button" onClick={next}>
              Próximo →
            </button>
          )}
          {step === STEPS.length && (
            <button type="button" onClick={submit} disabled={submitting}>
              {submitting ? 'Processando...' : 'Finalizar anamnese'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function toggleLimitation(prev: PhysicalLimitation[], lim: PhysicalLimitation): PhysicalLimitation[] {
  if (lim === 'SEM_LIMITACOES') {
    return prev.includes(lim) ? [] : ['SEM_LIMITACOES'];
  }
  return toggle(prev.filter((x) => x !== 'SEM_LIMITACOES'), lim);
}

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...INITIAL_FORM, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return INITIAL_FORM;
}

function StepHeader({ step, title }: { step: number; title?: string }) {
  const pct = (step / STEPS.length) * 100;
  return (
    <>
      {title && <h3 style={{ marginBottom: 4 }}>{title}</h3>}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, color: 'var(--muted)', marginBottom: 6,
        }}>
          <span>Etapa {step} de {STEPS.length} — <strong style={{ color: 'var(--text)' }}>{STEPS[step - 1]}</strong></span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-elev)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    </>
  );
}

// --- Etapas ---

function Step1({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <Section title="Perfil Físico" subtitle="Comece pelo seu nível de atividade atual.">
      <div className="row cols-3">
        <Field label="Nível de condicionamento">
          <select value={form.conditioningLevel} onChange={(e) => set('conditioningLevel', e.target.value as ConditioningLevel)}>
            {CONDITIONING.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Treinos por semana">
          <input type="number" min={0} max={7}
            value={form.trainingDaysPerWeek}
            onChange={(e) => set('trainingDaysPerWeek', Number(e.target.value))} />
        </Field>
        <Field label="Minutos por sessão">
          <input type="number" min={30} max={120}
            value={form.sessionMinutes}
            onChange={(e) => set('sessionMinutes', Number(e.target.value))} />
        </Field>
      </div>
    </Section>
  );
}

function Step2({ form, set, togglePain }: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  togglePain: (p: PainLocation) => void;
}) {
  return (
    <Section title="Saúde & Histórico" subtitle="Dores atuais e lesões recentes.">
      <Field label="Dores atuais (clique para selecionar)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PAIN_LOCATIONS.map((p) => (
            <button key={p} type="button"
              className={form.currentPain.includes(p) ? '' : 'ghost'}
              onClick={() => togglePain(p)}
              style={{ padding: '6px 12px', fontSize: 13 }}>
              {p}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Você está se recuperando de alguma lesão?">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <RadioYN checked={form.recoveringFromInjury === true} label="Sim"
            onChange={() => set('recoveringFromInjury', true)} />
          <RadioYN checked={form.recoveringFromInjury === false} label="Não"
            onChange={() => { set('recoveringFromInjury', false); set('currentInjuryDescription', ''); }} />
        </div>
      </Field>

      {form.recoveringFromInjury && (
        <Field label="Qual lesão?">
          <input value={form.currentInjuryDescription}
            onChange={(e) => set('currentInjuryDescription', e.target.value)}
            placeholder="Descreva a lesão em recuperação" />
        </Field>
      )}

      <Field label="Histórico de lesões (separadas por vírgula, opcional)">
        <input value={form.injuryHistory}
          onChange={(e) => set('injuryHistory', e.target.value)}
          placeholder="Ex: Entorse de tornozelo 2022, Tendinite no ombro 2023" />
      </Field>
    </Section>
  );
}

function Step3({ form, set, toggleGoal, toggleLimitation: tlim }: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleGoal: (g: ImprovementGoal) => void;
  toggleLimitation: (l: PhysicalLimitation) => void;
}) {
  return (
    <Section title="Limitações & Objetivos" subtitle="O que você quer evoluir e o que precisa adaptar.">
      <Field label="Quais pontos você quer melhorar?">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {IMPROVEMENT_GOALS.map((g) => (
            <button key={g.value} type="button"
              className={form.improvementGoals.includes(g.value) ? '' : 'ghost'}
              onClick={() => toggleGoal(g.value)}
              style={{ padding: '6px 12px', fontSize: 13 }}>
              {g.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Você possui alguma limitação física?">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PHYSICAL_LIMITATIONS.map((l) => (
            <button key={l.value} type="button"
              className={form.physicalLimitations.includes(l.value) ? '' : 'ghost'}
              onClick={() => tlim(l.value)}
              style={{ padding: '6px 12px', fontSize: 13 }}>
              {l.label}
            </button>
          ))}
        </div>
        {form.physicalLimitations.includes('OUTRO') && (
          <input style={{ marginTop: 8 }}
            value={form.physicalLimitationsOther}
            onChange={(e) => set('physicalLimitationsOther', e.target.value)}
            placeholder="Descreva a limitação" />
        )}
      </Field>
    </Section>
  );
}

function Step4({ form, toggleHad, toggleCurrent, toggleDifficulty }: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  toggleHad: (i: JiuJitsuInjury) => void;
  toggleCurrent: (i: JiuJitsuInjury) => void;
  toggleDifficulty: (d: JiuJitsuDifficulty) => void;
}) {
  return (
    <Section title="Jiu-Jitsu" subtitle="Lesões características da modalidade e suas dificuldades técnicas.">
      <Field label="Lesões comuns no Jiu-Jitsu">
        <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>
          Marque as lesões que você já teve e/ou tem atualmente.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {JJ_INJURIES_BY_REGION.map((region) => (
            <div key={region.region} style={{
              background: 'var(--bg-elev)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>
                {region.region}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                columnGap: 16, rowGap: 4, alignItems: 'center',
              }}>
                <div />
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Já tive</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Tenho atualmente</div>
                {region.items.map((item) => {
                  const cur = form.jiuJitsuInjuriesCurrent.includes(item.value);
                  return (
                    <ItemRow key={item.value} label={item.label} highlighted={cur}
                      hadChecked={form.jiuJitsuInjuriesHad.includes(item.value)}
                      currentChecked={cur}
                      onToggleHad={() => toggleHad(item.value)}
                      onToggleCurrent={() => toggleCurrent(item.value)} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Quais são suas maiores dificuldades técnicas?">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {JJ_DIFFICULTIES.map((d) => (
            <button key={d.value} type="button"
              className={form.jiuJitsuDifficulties.includes(d.value) ? '' : 'ghost'}
              onClick={() => toggleDifficulty(d.value)}
              style={{ padding: '6px 12px', fontSize: 13 }}>
              {d.label}
            </button>
          ))}
        </div>
      </Field>
    </Section>
  );
}

function Step5({ form, set }: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  return (
    <Section title="Estilo de Vida" subtitle="Dados clínicos e percepção do corpo.">
      <div className="row cols-3">
        <Field label="FC repouso (bpm)">
          <input type="number" min={30} max={220}
            value={form.restingHeartRate}
            onChange={(e) => set('restingHeartRate', Number(e.target.value))} />
        </Field>
        <Field label="Sono médio (h)">
          <input type="number" min={0} max={24}
            value={form.averageSleepHours}
            onChange={(e) => set('averageSleepHours', Number(e.target.value))} />
        </Field>
        <Field label="Estresse (1-10)">
          <input type="number" min={1} max={10}
            value={form.perceivedStressLevel}
            onChange={(e) => set('perceivedStressLevel', Number(e.target.value))} />
        </Field>
      </div>
      <div className="row cols-2">
        <Field label="Notei assimetrias musculares">
          <div style={{ display: 'flex', gap: 16 }}>
            <RadioYN checked={form.asymmetryReported} label="Sim"
              onChange={() => set('asymmetryReported', true)} />
            <RadioYN checked={!form.asymmetryReported} label="Não"
              onChange={() => set('asymmetryReported', false)} />
          </div>
        </Field>
        <Field label="Notei desvios posturais">
          <div style={{ display: 'flex', gap: 16 }}>
            <RadioYN checked={form.posturalDeviationReported} label="Sim"
              onChange={() => set('posturalDeviationReported', true)} />
            <RadioYN checked={!form.posturalDeviationReported} label="Não"
              onChange={() => set('posturalDeviationReported', false)} />
          </div>
        </Field>
      </div>
    </Section>
  );
}

// --- Subcomponentes ---

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div>
      <h4 style={{ marginBottom: 4 }}>{title}</h4>
      {subtitle && <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function RadioYN({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ width: 'auto' }} />
      {label}
    </label>
  );
}

function ItemRow({ label, highlighted, hadChecked, currentChecked, onToggleHad, onToggleCurrent }: {
  label: string;
  highlighted: boolean;
  hadChecked: boolean;
  currentChecked: boolean;
  onToggleHad: () => void;
  onToggleCurrent: () => void;
}) {
  return (
    <>
      <div style={{
        fontSize: 13,
        color: highlighted ? 'var(--warning)' : 'var(--text)',
        fontWeight: highlighted ? 600 : 400,
      }}>
        {label}{highlighted && ' ⚠'}
      </div>
      <input type="checkbox" checked={hadChecked} onChange={onToggleHad}
        style={{ width: 'auto', justifySelf: 'center' }} />
      <input type="checkbox" checked={currentChecked} onChange={onToggleCurrent}
        style={{ width: 'auto', justifySelf: 'center' }} />
    </>
  );
}
