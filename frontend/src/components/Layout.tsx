import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  const { fullName, email, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Athlete Platform</h1>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
        <NavLink to="/anamnesis">Anamnese</NavLink>
        <NavLink to="/training">Treinamento</NavLink>
        <NavLink to="/injuries">Lesões</NavLink>
        <div className="footer">
          <div className="user">
            <strong>{fullName}</strong>
            <br />
            <span>{email}</span>
          </div>
          <button className="ghost" onClick={handleLogout} style={{ width: '100%' }}>
            Sair
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
