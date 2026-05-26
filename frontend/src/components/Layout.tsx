import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Props {
  children: ReactNode;
}

function initials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]);
}

export function Layout({ children }: Props) {
  const { fullName, email, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar no-print">
        <h1>Athlete Platform</h1>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
        <NavLink to="/anamnesis">Anamnese</NavLink>
        <NavLink to="/exercises">Exercícios</NavLink>
        <NavLink to="/training">Treinamento</NavLink>
        <NavLink to="/injuries">Lesões</NavLink>
        <div className="footer">
          <div className="user-menu" ref={menuRef}>
            <button
              className="ghost"
              onClick={() => setMenuOpen((v) => !v)}
              style={{ width: '100%', textAlign: 'left', padding: 8 }}
            >
              <div className="user-row" style={{ marginBottom: 0 }}>
                <div className="avatar">{initials(fullName)}</div>
                <div className="info">
                  <strong>{fullName ?? '—'}</strong>
                  <span>{email ?? ''}</span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {menuOpen ? '▾' : '▸'}
                </span>
              </div>
            </button>
            {menuOpen && (
              <div className="user-menu-popup">
                <Link to="/settings" onClick={() => setMenuOpen(false)}>
                  Configurações
                </Link>
                <button type="button" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
