import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import type { OnboardingStatus } from '@/types/domain';

const ONBOARDING_PATHS = [
  '/onboarding/terms',
  '/onboarding/parq',
  '/onboarding/anamnesis',
];

/**
 * Decide para onde mandar o usuário com base no estado de onboarding:
 *   1. Sem perfil de atleta → /profile
 *   2. Sem termos aceitos → /onboarding/terms
 *   3. PAR-Q não respondido → /onboarding/parq
 *   4. Anamnese não respondida → /onboarding/anamnesis
 * Permite que o usuário fique numa página de onboarding atual ou avance,
 * mas não consegue acessar Dashboard/Treinamento/Lesões antes de terminar.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  // Cacheia o status enquanto o onboarding estiver completo. Reavalia em
  // mudança de rota apenas até o usuário terminar — depois disso, o status
  // não muda mais por simples navegação, então não vale o request extra
  // (que ainda dava flash visual de skeleton a cada page change).
  useEffect(() => {
    if (status?.onboardingCompleted) return;
    setLoading(true);
    setErrored(false);
    authApi.onboardingStatus()
      .then((s) => { setStatus(s); setErrored(false); })
      .catch(() => { setStatus(null); setErrored(true); })
      .finally(() => setLoading(false));
  }, [location.pathname, status?.onboardingCompleted]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 24, width: 220, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 120, width: '100%' }} />
      </div>
    );
  }

  if (errored || status === null) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 8 }}>Não foi possível carregar sua sessão</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
          Sua sessão pode ter expirado ou a conta não existe mais. Faça login novamente.
        </p>
        <button onClick={() => { logout(); navigate('/login'); }}>
          Voltar para o login
        </button>
      </div>
    );
  }

  const path = location.pathname;
  const isProfile = path === '/profile';
  const isOnboarding = ONBOARDING_PATHS.some((p) => path.startsWith(p));
  const isSettings = path === '/settings';

  // Settings sempre permitido (mudar senha / excluir conta).
  if (isSettings) return <>{children}</>;

  if (!status.hasProfile) {
    return isProfile ? <>{children}</> : <Navigate to="/profile" replace />;
  }
  if (!status.termsAccepted) {
    return path === '/onboarding/terms' ? <>{children}</> : <Navigate to="/onboarding/terms" replace />;
  }
  if (!status.parqAnswered) {
    return path === '/onboarding/parq' ? <>{children}</> : <Navigate to="/onboarding/parq" replace />;
  }
  if (!status.anamnesisAnswered) {
    return path === '/onboarding/anamnesis' ? <>{children}</> : <Navigate to="/onboarding/anamnesis" replace />;
  }

  // Onboarding completo: se ainda estiver numa rota de onboarding, manda pra home.
  if (isOnboarding) return <Navigate to="/" replace />;
  return <>{children}</>;
}
