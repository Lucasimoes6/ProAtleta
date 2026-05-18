export type Role = 'ATHLETE' | 'COACH' | 'ADMIN';

export type Sport =
  | 'FUTEBOL' | 'CORRIDA' | 'CICLISMO' | 'NATACAO' | 'MUSCULACAO' | 'CROSSFIT'
  | 'VOLEI' | 'BASQUETE' | 'TENIS' | 'LUTAS' | 'OUTRO';

export type Level = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'ELITE';

export type Goal =
  | 'HIPERTROFIA' | 'FORCA' | 'RESISTENCIA' | 'EMAGRECIMENTO'
  | 'PERFORMANCE_ESPORTIVA' | 'REABILITACAO' | 'SAUDE_GERAL';

export type ConditioningLevel = 'SEDENTARIO' | 'BAIXO' | 'MODERADO' | 'BOM' | 'ALTO';

export type PainLocation =
  | 'JOELHO' | 'OMBRO' | 'LOMBAR' | 'CERVICAL' | 'QUADRIL' | 'TORNOZELO'
  | 'COTOVELO' | 'PUNHO' | 'NENHUM';

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
  autoReport: string;
  createdAt: string;
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
