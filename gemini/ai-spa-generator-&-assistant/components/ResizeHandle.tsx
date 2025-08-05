import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-full h-full bg-neon-yellow/40 hover:bg-neon-yellow transition-colors duration-200 ease-in-out cursor-col-resize flex-shrink-0 hover:shadow-glow-yellow"
      style={{width: '5px'}}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
    />
  );
};

export default ResizeHandle;