import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <button
          id="btn-theme-toggle"
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
