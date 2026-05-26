import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { OnboardingGate } from '@/components/OnboardingGate';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import AnamnesisPage from '@/pages/AnamnesisPage';
import TrainingPage from '@/pages/TrainingPage';
import InjuriesPage from '@/pages/InjuriesPage';
import SettingsPage from '@/pages/SettingsPage';
import ExerciseLibraryPage from '@/pages/ExerciseLibraryPage';
import TermsPage from '@/pages/onboarding/TermsPage';
import PARQPage from '@/pages/onboarding/PARQPage';
import OnboardingAnamnesisPage from '@/pages/onboarding/OnboardingAnamnesisPage';

export default function App() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <OnboardingGate>
        <Routes>
          <Route path="/onboarding/terms" element={<TermsPage />} />
          <Route path="/onboarding/parq" element={<PARQPage />} />
          <Route path="/onboarding/anamnesis" element={<OnboardingAnamnesisPage />} />

          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/anamnesis" element={<AnamnesisPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/injuries" element={<InjuriesPage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OnboardingGate>
    </Layout>
  );
}
