import { useNavigate } from 'react-router-dom';
import { AnamnesisStepperForm } from '@/components/AnamnesisStepperForm';
import { OnboardingProgress } from './TermsPage';

export default function OnboardingAnamnesisPage() {
  const navigate = useNavigate();

  return (
    <>
      <OnboardingProgress step={3} />
      <header>
        <h2>Anamnese</h2>
        <p>Última etapa do onboarding — responda para liberar o aplicativo</p>
      </header>
      <AnamnesisStepperForm
        hideTitle
        onSubmitted={() => navigate('/')}
      />
    </>
  );
}
