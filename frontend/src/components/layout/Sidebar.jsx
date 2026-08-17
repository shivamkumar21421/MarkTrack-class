import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  PencilLine,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const teacherLinks = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/teacher/tests', label: 'Tests', icon: ClipboardList },
  { to: '/teacher/marks', label: 'Marks Entry', icon: PencilLine },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/marks', label: 'My Marks', icon: ClipboardList },
  { to: '/student/performance', label: 'Performance', icon: BarChart3 },
];

export default function Sidebar({ role, isOpen, onClose }) {
  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GraduationCap size={20} />
            MarkTrack
          </div>
          <div className="sidebar-brand-subtitle">Monthly Test & Marks Management</div>
        </div>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
