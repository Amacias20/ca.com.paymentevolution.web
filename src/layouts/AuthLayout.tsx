import { Outlet } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector/ThemeSelector';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import type { DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { text: '🇺🇸 EN', value: 'en' },
  { text: '🇪🇸 ES', value: 'es' },
  { text: '🇫🇷 FR', value: 'fr' },
];

const AuthLayout = () => {
  const { i18n } = useTranslation();
  const currentLang = LANGUAGES.find(l => l.value === i18n.language) ?? LANGUAGES[0];

  const handleLanguageChange = (e: DropDownListChangeEvent) => {
    const lang = (e.value as { value: string }).value;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-sidebar-decoration"></div>
        <div className="auth-logo" style={{ marginBottom: '0', justifyContent: 'flex-start' }}>
          <div className="auth-logo-icon">PE</div>
          <div className="auth-logo-text">
            <span className="auth-logo-name" style={{ color: 'var(--text-heading)' }}>Payment Evolution</span>
            <span className="auth-logo-subtitle" style={{ color: 'var(--text-secondary)' }}>HR Platform</span>
          </div>
        </div>
        
        <div className="auth-sidebar-content">
          <h1 className="auth-sidebar-title">
            Empower your workforce.
          </h1>
          <p className="auth-sidebar-subtitle">
            Manage employees, track absences, and handle HR operations from a single, elegantly designed workspace.
          </p>
        </div>
        
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', zIndex: 2 }}>
          © {new Date().getFullYear()} Payment Evolution. All rights reserved.
        </div>
      </div>

      <div className="auth-main">
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10 }}>
          <DropDownList
            id="auth-language-selector"
            data={LANGUAGES}
            textField="text"
            dataItemKey="value"
            value={currentLang}
            onChange={handleLanguageChange}
            style={{ width: '100px', fontSize: '0.8125rem' }}
          />
          <ThemeSelector />
        </div>

        <div className="auth-card">
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">PE</div>
            <div className="auth-logo-text">
              <span className="auth-logo-name" style={{ color: 'var(--text-heading)' }}>Payment Evolution</span>
              <span className="auth-logo-subtitle" style={{ color: 'var(--text-secondary)' }}>HR Platform</span>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
