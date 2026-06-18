import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSelector = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'light' ? t('theme.dark') : t('theme.light')}
      style={{
        width: 34, height: 34, borderRadius: '8px',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        cursor: 'pointer', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease', flexShrink: 0,
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSelector;