import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, MeResponse } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function SettingsPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    authApi.me().then((data) => {
      setMe(data);
      setFullName(data.fullName);
      setEmail(data.email);
    }).catch(() => toast.error('Erro ao carregar dados da conta.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const auth = await authApi.updateProfile({ fullName, email });
      setAuth(auth);
      toast.success('Perfil atualizado.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  const doDelete = async () => {
    try {
      await authApi.deleteAccount();
      toast.success('Conta excluída.');
      logout();
      navigate('/login');
    } catch {
      toast.error('Erro ao excluir conta.');
    }
  };

  return (
    <>
      <header>
        <h2>Configurações</h2>
        <p>Gerencie suas informações de conta e segurança</p>
      </header>

      <form onSubmit={saveProfile} className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Dados da conta</h3>
        <div className="row cols-2">
          <div className="field">
            <label>Nome completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="row cols-2">
          <div className="field">
            <label>Tipo de conta</label>
            <input value={me?.role ?? ''} disabled />
          </div>
          <div className="field">
            <label>Membro desde</label>
            <input
              value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString('pt-BR') : ''}
              disabled
            />
          </div>
        </div>
        <button type="submit" disabled={savingProfile}>
          {savingProfile ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <form onSubmit={savePassword} className="card">
        <h3 style={{ marginBottom: 12 }}>Alterar senha</h3>
        <div className="field">
          <label>Senha atual</label>
          <input
            type="password" required autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="row cols-2">
          <div className="field">
            <label>Nova senha (mín. 8)</label>
            <input
              type="password" minLength={8} required autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Confirmar nova senha</label>
            <input
              type="password" minLength={8} required autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={savingPassword}>
          {savingPassword ? 'Atualizando...' : 'Alterar senha'}
        </button>
      </form>

      <div className="danger-zone">
        <h4>Zona de perigo</h4>
        <p>
          Excluir sua conta apaga permanentemente seu perfil, anamneses, planos de
          treino e histórico de lesões. Esta ação é irreversível.
        </p>
        <button className="danger" onClick={() => setConfirmDelete(true)}>
          Excluir minha conta
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir conta permanentemente"
        message="Todos os seus dados (perfil, anamneses, plano de treinos e lesões) serão apagados. Não há como desfazer."
        confirmLabel="Excluir conta"
        cancelLabel="Cancelar"
        danger
        requireText="EXCLUIR"
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
