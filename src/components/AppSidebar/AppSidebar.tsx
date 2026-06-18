import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  sectionKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',     labelKey: 'nav.dashboard',    icon: '📊', sectionKey: 'nav.overview' },
  { path: '/employees',     labelKey: 'nav.employees',    icon: '👥', sectionKey: 'nav.management' },
  { path: '/users',         labelKey: 'nav.users',        icon: '🔐' },
  { path: '/roles',         labelKey: 'nav.roles',        icon: '🛡️' },
  { path: '/absence-types', labelKey: 'nav.absenceTypes', icon: '📋', sectionKey: 'nav.attendance' },
  { path: '/absences',      labelKey: 'nav.absences',     icon: '📅' },
  { path: '/reports',       labelKey: 'nav.reports',      icon: '📊', sectionKey: 'nav.reports' },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  let lastSection = '';

  return (
    <aside className={`app-sidebar${collapsed ? ' collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const showSection = item.sectionKey && item.sectionKey !== lastSection;
          if (item.sectionKey) lastSection = item.sectionKey;
          return (
            <div key={item.path}>
              {showSection && (
                <div className="sidebar-section-label">{t(item.sectionKey!)}</div>
              )}
              <div
                className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{t(item.labelKey)}</span>
              </div>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;