import React from 'react';

export default function LifeCard({ as: Component = 'section', accent, className = '', children, ...props }) {
  return (
    <Component
      className={`life-card ${className}`}
      style={accent ? { '--life-card-accent': accent } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
