import React from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';

  return (
    <button 
      className={`theme-toggle ${theme}`}
      onClick={onToggle}
      style={{ 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        background: 'transparent',
        border: 'none',            
        boxShadow: 'none',
        cursor: 'pointer'
      }}
      aria-label="Toggle Theme"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill={isLight ? "#fbbf24" : "none"} 
        stroke={isLight ? "#fbbf24" : "currentColor"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{
          filter: isLight ? 'drop-shadow(0px 0px 8px rgba(251, 191, 36, 0.6))' : 'none',
          transition: 'all 0.4s ease-in-out' 
        }}
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
      </svg>
    </button>
  );
}