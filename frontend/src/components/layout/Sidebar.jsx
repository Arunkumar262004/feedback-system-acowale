import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAuth();

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header with Brand and Toggle */}
      <div className="sidebar-header">
        {!sidebarCollapsed && (
          <span className="sidebar-brand-text">Acowale Feedback</span>
        )}
        <button
          onClick={toggleSidebar}
          className="menu-toggle-btn"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      <NavLink
        to="/admin/dashboard"
        end
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        title={sidebarCollapsed ? 'Dashboard' : ''}
      >
        <LayoutDashboard size={16} />
        {sidebarCollapsed ? null : <span>Dashboard</span>}
      </NavLink>

      <NavLink
        to="/admin/feedback"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        title={sidebarCollapsed ? 'Feedback' : ''}
      >
        <MessageSquare size={16} />
        {sidebarCollapsed ? null : <span>Feedback</span>}
      </NavLink>
    </aside>
  );
}
