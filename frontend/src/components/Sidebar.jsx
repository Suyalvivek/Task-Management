import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatDate';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><CheckSquare size={14} strokeWidth={2.5} /></div>
        <span>TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" id="nav-dashboard">
          <LayoutDashboard size={15} strokeWidth={1.8} />
          Dashboard
        </NavLink>
        <NavLink to="/projects" id="nav-projects">
          <FolderKanban size={15} strokeWidth={1.8} />
          Projects
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" onClick={handleLogout} id="btn-logout" title="Logout">
          <div className="avatar sm">{getInitials(user?.name)}</div>
          <div className="user-chip-info">
            <div className="user-chip-name">{user?.name}</div>
            <div className="user-chip-email">{user?.email}</div>
          </div>
          <LogOut size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
