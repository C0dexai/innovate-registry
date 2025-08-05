
import React from 'react';

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => {
  return (
    <div className="glass-card rounded-lg p-6 mb-8 border-[var(--color-primary)]/30">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">{title}</h2>
      <p className="text-[var(--color-text-muted)] mb-6">{description}</p>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default Section;