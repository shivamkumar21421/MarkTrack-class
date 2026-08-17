import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>
      <div className="topbar-user">
        <div className="topbar-user-info">
          <div className="topbar-user-name">{user?.name}</div>
          <div className="topbar-user-role">{user?.role}</div>
        </div>
        <div className="avatar">{initials}</div>
        <button className="btn btn-ghost btn-icon" onClick={logout} title="Logout" aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
