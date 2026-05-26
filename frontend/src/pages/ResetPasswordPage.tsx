import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordReset(token, password);
      toast.success('Senha redefinida! Faça login com a nova senha.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Token inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Nova senha</h1>
        <p>Defina uma nova senha para sua conta</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Token de redefinição</label>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole o token recebido"
            />
          </div>
          <div className="field">
            <label>Nova senha (mínimo 8 caracteres)</label>
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Atualizando...' : 'Redefinir senha'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link to="/login">← Voltar para login</Link>
        </p>
      </div>
    </div>
  );
}
