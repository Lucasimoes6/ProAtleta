import { useState, FormEvent, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/Toast';

function scorePassword(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte', 'Excelente'];
  const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--warning)', 'var(--accent)', 'var(--accent)'];
  return { score: s, label: labels[s], color: colors[s] };
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'ATHLETE' | 'COACH'>('ATHLETE');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const toast = useToast();

  const strength = useMemo(() => scorePassword(password), [password]);
  const mismatched = confirm.length > 0 && password !== confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({ fullName, email, password, role });
      setAuth(data);
      toast.success(`Bem-vindo, ${data.fullName.split(' ')[0]}!`);
      navigate('/');
    } catch {
      toast.error('Não foi possível cadastrar. Verifique os dados ou tente outro email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Criar conta</h1>
        <p>Comece sua jornada de evolução</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Nome completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Senha (mínimo 8 caracteres)</label>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {password && (
              <div style={{ marginTop: 6 }}>
                <div style={{
                  height: 4,
                  background: 'var(--bg-elev)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(strength.score / 5) * 100}%`,
                    background: strength.color,
                    transition: 'width 0.2s',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>
          <div className="field">
            <label>Confirmar senha</label>
            <input
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={mismatched ? { borderColor: 'var(--danger)' } : undefined}
            />
            {mismatched && (
              <span style={{ fontSize: 11, color: 'var(--danger)' }}>
                As senhas não coincidem
              </span>
            )}
          </div>
          <div className="field">
            <label>Tipo de usuário</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'ATHLETE' | 'COACH')}>
              <option value="ATHLETE">Atleta</option>
              <option value="COACH">Treinador</option>
            </select>
          </div>
          <button type="submit" disabled={loading || mismatched} style={{ width: '100%' }}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
