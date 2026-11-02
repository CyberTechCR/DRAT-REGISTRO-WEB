import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { canAccess } from '../auth/authorization';
import { modules } from '../config/modules';

export function AppShell() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  if (!session) return <Navigate to="/login" replace />;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell bg-slate-50 text-slate-900 antialiased">
      <aside className="sidebar shadow-xl">
        <div className="brand">
          <span className="brand-logo"><img src="/senara-logo.png" alt="SENARA" /></span>
          <span><strong>SICAF</strong><small>Panel administrativo</small></span>
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          {modules.filter((module) => canAccess(session.user.role, module.allowedRoles)).map((module) => (
            <NavLink key={module.path} to={module.path} end={module.path === '/'}>
              <span className="nav-icon" aria-hidden="true">{module.shortLabel}</span>{module.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">AD</span>
          <span className="sidebar-user-details"><strong>{session.user.name}</strong><small>{session.user.role}</small></span>
          <button className="logout-button" type="button" onClick={handleLogout}>Salir</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar shadow-sm">
          <div><span className="environment-dot" /> Entorno operativo</div>
          <div className="institution">DRAT · Control institucional</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
