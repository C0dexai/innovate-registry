import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  accentColor?: 'cyan' | 'purple' | 'green';
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, accentColor = 'cyan' }) => {
  const id = `switch-${label.replace(/\s+/g, '-').toLowerCase()}`;
  
  const colors = {
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  const glowShadow = {
    cyan: 'shadow-[0_0_8px_var(--neon-cyan)]',
    purple: 'shadow-[0_0_8px_var(--neon-purple)]',
    green: 'shadow-[0_0_8px_var(--neon-green)]',
  }

  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={id} 
          type="checkbox" 
          className="sr-only" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? colors[accentColor] : 'bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'} ${checked ? glowShadow[accentColor] : ''}`}></div>
      </div>
      <div className="ml-3 text-sm font-medium text-gray-300">{label}</div>
    </label>
  );
};

export default Switch;