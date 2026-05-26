export type Role = 'ATHLETE' | 'COACH' | 'ADMIN';

export type Sport =
  | 'FUTEBOL' | 'CORRIDA' | 'CICLISMO' | 'NATACAO' | 'MUSCULACAO' | 'CROSSFIT'
  | 'VOLEI' | 'BASQUETE' | 'TENIS' | 'LUTAS' | 'JIU_JITSU' | 'OUTRO';

export type Level = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'ELITE';

export type Goal =
  | 'HIPERTROFIA' | 'FORCA' | 'RESISTENCIA' | 'EMAGRECIMENTO'
  | 'PERFORMANCE_ESPORTIVA' | 'REABILITACAO' | 'SAUDE_GERAL';

export type ConditioningLevel = 'SEDENTARIO' | 'BAIXO' | 'MODERADO' | 'BOM' | 'ALTO';

export type PainLocation =
  | 'JOELHO' | 'OMBRO' | 'LOMBAR' | 'CERVICAL' | 'QUADRIL' | 'TORNOZELO'
  | 'COTOVELO' | 'PUNHO' | 'NENHUM';

export type ImprovementGoal =
  | 'FORCA' | 'FLEXIBILIDADE' | 'RESISTENCIA' | 'EQUILIBRIO' | 'VELOCIDADE'
  | 'RECUPERACAO_LESAO' | 'CONDICIONAMENTO_GERAL';

export type PhysicalLimitation =
  | 'DOR_CRONICA' | 'MOBILIDADE_REDUZIDA' | 'POS_CIRURGICO' | 'SEM_LIMITACOES' | 'OUTRO';

export type JiuJitsuInjury =
  | 'ENTORSE_JOELHO' | 'LESAO_MENISCO' | 'LESAO_LCA'
  | 'LUXACAO_OMBRO' | 'TENDINITE_OMBRO' | 'LESAO_MANGUITO_ROTADOR'
  | 'ENTORSE_DEDO' | 'INFLAMACAO_DEDO' | 'DEFORMIDADE_DEDO'
  | 'LOMBALGIA' | 'HERNIA_DISCO' | 'CONTRATURA_MUSCULAR'
  | 'HIPEREXTENSAO_COTOVELO' | 'EPICONDILITE'
  | 'ENTORSE_TORNOZELO' | 'ESTIRAMENTO_LIGAMENTAR'
  | 'MICOSE' | 'HERPES_GLADIATORUM' | 'ESCORIACOES';

export type JiuJitsuDifficulty =
  | 'PASSAR_GUARDA' | 'REPOR_GUARDA' | 'FAZER_GUARDA' | 'RASPAR'
  | 'PROJECOES' | 'FINALIZACOES' | 'MOVIMENTACAO_EM_PE' | 'MOVIMENTACAO_NO_CHAO';

export type PrescribedExerciseCategory = 'FORTALECIMENTO' | 'ALONGAMENTO' | 'PREVENCAO';
export type PrescribedExercisePriority = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface PrescribedExercise {
  name: string;
  category: PrescribedExerciseCategory;
  indication?: string;
  priority: PrescribedExercisePriority;
}

export type CyclePhase = 'BASE' | 'INTENSIDADE' | 'PICO' | 'RECUPERACAO';

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'
  | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface Athlete {
  id: string;
  email: string;
  fullName: string;
  age: number;
  birthDate: string;
  heightCm?: number;
  weightKg?: number;
  sport: Sport;
  level: Level;
  primaryGoal: Goal;
  notes?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  onboardingCompletedAt?: string;
}

export interface OnboardingStatus {
  hasProfile: boolean;
  termsAccepted: boolean;
  parqAnswered: boolean;
  anamnesisAnswered: boolean;
  onboardingCompleted: boolean;
}

export interface PARQResponse {
  id: string;
  athleteId: string;
  q1: boolean; q2: boolean; q3: boolean; q4: boolean;
  q5: boolean; q6: boolean; q7: boolean;
  hasAnyRisk: boolean;
  acceptedRisk: boolean;
  answeredAt: string;
}

export type LibraryExerciseCategory =
  'MOBILIDADE' | 'PREVENTIVO' | 'FORTALECIMENTO' | 'ALONGAMENTO' | 'PLIOMETRICO';

export type LibraryExerciseStage = 'PREVENCAO' | 'REABILITACAO' | 'PERFORMANCE';

export type LibraryExerciseDifficulty = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';

export interface LibraryExercise {
  id: string;
  name: string;
  description?: string;
  category: LibraryExerciseCategory;
  targetRegions: string[];
  indicatedFor: string[];
  contraindicatedFor: string[];
  stage: LibraryExerciseStage[];
  difficultyLevel: LibraryExerciseDifficulty;
  sets?: number;
  repetitions?: number;
  durationSeconds?: number;
  createdAt: string;
}

export interface Anamnesis {
  id: string;
  athleteId: string;
  conditioningLevel: ConditioningLevel;
  trainingDaysPerWeek: number;
  sessionMinutes: number;
  currentPain: PainLocation[];
  injuryHistory: string[];
  strengths: string[];
  weaknesses: string[];
  asymmetryReported?: boolean;
  posturalDeviationReported?: boolean;
  restingHeartRate?: number;
  averageSleepHours?: number;
  perceivedStressLevel?: number;
  recoveringFromInjury?: boolean;
  currentInjuryDescription?: string;
  improvementGoals?: ImprovementGoal[];
  physicalLimitations?: PhysicalLimitation[];
  physicalLimitationsOther?: string;
  jiuJitsuInjuriesHad?: JiuJitsuInjury[];
  jiuJitsuInjuriesCurrent?: JiuJitsuInjury[];
  jiuJitsuDifficulties?: JiuJitsuDifficulty[];
  prescribedExercises?: PrescribedExercise[];
  autoReport: string;
  createdAt: string;
}

/**
 * Payload aceito pelo POST /api/anamnesis. Não inclui campos calculados
 * (id, athleteId, autoReport, prescribedExercises, createdAt).
 */
export interface CreateAnamnesisRequest {
  conditioningLevel: ConditioningLevel;
  trainingDaysPerWeek: number;
  sessionMinutes: number;
  currentPain: PainLocation[];
  injuryHistory: string[];
  strengths?: string[];
  weaknesses?: string[];
  asymmetryReported?: boolean;
  posturalDeviationReported?: boolean;
  restingHeartRate?: number;
  averageSleepHours?: number;
  perceivedStressLevel?: number;
  recoveringFromInjury?: boolean;
  currentInjuryDescription?: string;
  improvementGoals?: ImprovementGoal[];
  physicalLimitations?: PhysicalLimitation[];
  physicalLimitationsOther?: string;
  jiuJitsuInjuriesHad?: JiuJitsuInjury[];
  jiuJitsuInjuriesCurrent?: JiuJitsuInjury[];
  jiuJitsuDifficulties?: JiuJitsuDifficulty[];
}

export interface Exercise {
  id: string;
  orderIndex: number;
  name: string;
  sets?: number;
  reps?: string;
  load?: string;
  rest?: string;
  instructions?: string;
}

export interface TrainingSession {
  id: string;
  dayOfWeek: DayOfWeek;
  title: string;
  durationMinutes: number;
  description?: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface TrainingWeek {
  id: string;
  weekNumber: number;
  phase: CyclePhase;
  volumeLoad: number;
  intensityLoad: number;
  focus?: string;
  sessions: TrainingSession[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  currentPhase: CyclePhase;
  weeks: TrainingWeek[];
}

export interface Injury {
  id: string;
  type: string;
  region: string;
  severity: 'LEVE' | 'MODERADA' | 'GRAVE';
  status: 'ATIVA' | 'EM_REABILITACAO' | 'RECUPERADA';
  onsetDate: string;
  resolvedDate?: string;
  description?: string;
  rehabProtocol?: string;
}
