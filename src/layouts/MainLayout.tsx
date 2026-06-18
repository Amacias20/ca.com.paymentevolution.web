import type { DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import ThemeSelector from '../components/ThemeSelector/ThemeSelector';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import AppSidebar from '../components/AppSidebar/AppSidebar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { getTokenUser } from '../utils/jwtUtils';
import { useTranslation } from 'react-i18next';
import { logout } from '../slices/authSlice';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

const LANGUAGES = [
  { text: '🇺🇸 EN', value: 'en' },
  { text: '🇪🇸 ES', value: 'es' },
  { text: '🇫🇷 FR', value: 'fr' },
];

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const currentLang = LANGUAGES.find(l => l.value === i18n.language) ?? LANGUAGES[0];
  const currentUser = getTokenUser();
  const userInitial = currentUser.charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLanguageChange = (e: DropDownListChangeEvent) => {
    const lang = (e.value as { value: string }).value;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <div className="app-header-logo">PE</div>
          <span className="app-header-title">Payment Evolution</span>
        </div>
        <div className="app-header-spacer" />
        <div className="app-header-actions">
          <DropDownList
            id="language-selector"
            data={LANGUAGES}
            textField="text"
            dataItemKey="value"
            value={currentLang}
            onChange={handleLanguageChange}
            style={{ width: '100px', fontSize: '0.8125rem' }}
          />
          <ThemeSelector />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{currentUser}</span>
          <div className="app-header-avatar" title={currentUser}>{userInitial}</div>
          <Button
            onClick={handleLogout}
            themeColor="error"
            fillMode="flat"
            size="small"
            style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            ⎋ {t('common.signOut')}
          </Button>
        </div>
      </header>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`app-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="page-content animate-fade-in">
          <div style={{ padding: '0 0 1rem 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
            <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>🏠 Home</span>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;
              return (
                <span key={to} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
                  <span 
                    onClick={() => !isLast && navigate(to)} 
                    style={{
                      cursor: isLast ? 'default' : 'pointer', 
                      color: isLast ? 'var(--text-primary)' : 'var(--text-muted)', 
                      fontWeight: isLast ? 600 : 400
                    }}
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
                  </span>
                </span>
              );
            })}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;