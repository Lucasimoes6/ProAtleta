import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { useToast } from '@/components/Toast';

/**
 * Em produção, o backend enviaria o token por email e o usuário entraria
 * direto no link recebido. No modo dev/local, o endpoint devolve o token
 * no body — exibimos um botão "Abrir link de reset" para o fluxo offline.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDevToken(null);
    try {
      const res = await authApi.requestPasswordReset(email);
      if (res.token) {
        setDevToken(res.token);
        toast.success('Token gerado. Use o link abaixo.');
      } else {
        toast.info(res.message ?? 'Se o email existir, um token foi gerado.');
      }
    } catch {
      toast.error('Erro ao solicitar reset. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="card auth-card">
        <h1>Esqueci a senha</h1>
        <p>Informe seu email para receber um link de redefinição</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </form>

        {devToken && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Modo dev — em produção este token seria enviado por email.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/reset-password?token=${devToken}`)}
              style={{ width: '100%' }}
            >
              Abrir link de reset
            </button>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link to="/login">← Voltar para login</Link>
        </p>
      </div>
    </div>
  );
}
