import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDark ? 'active' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <FaSun className="theme-toggle-icon" aria-hidden="true" />
      ) : (
        <FaMoon className="theme-toggle-icon" aria-hidden="true" />
      )}
      <span className="theme-toggle-text">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle; 