import React from 'react';

export default function GlassCard({ children, className = '', hover = false }) {
  return (
    <div
      className={`
        bg-white
        border border-stone-200/90
        rounded-2xl
        shadow-sm
        transition-all duration-200
        ${hover ? 'hover:border-stone-300 hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
