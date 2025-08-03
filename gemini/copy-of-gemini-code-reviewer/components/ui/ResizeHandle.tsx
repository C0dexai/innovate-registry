import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  direction: 'vertical' | 'horizontal';
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown, direction }) => {
  const baseClasses = "bg-slate-800 hover:bg-violet-600 transition-colors duration-200 z-10 flex items-center justify-center group";
  const directionClasses = direction === 'vertical' 
    ? "w-2.5 h-full cursor-col-resize" 
    : "h-2.5 w-full cursor-row-resize";
    
  const gripDots = (
    <div className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} gap-1`}>
      <span className="w-1 h-1 bg-slate-600 group-hover:bg-violet-300 rounded-full transition-colors duration-200"></span>
      <span className="w-1 h-1 bg-slate-600 group-hover:bg-violet-300 rounded-full transition-colors duration-200"></span>
      <span className="w-1 h-1 bg-slate-600 group-hover:bg-violet-300 rounded-full transition-colors duration-200"></span>
    </div>
  );

  return (
    <div
      className={`${baseClasses} ${directionClasses}`}
      onMouseDown={onMouseDown}
    >
      {gripDots}
    </div>
  );
};

export default ResizeHandle;
