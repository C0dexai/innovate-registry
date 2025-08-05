
import React from 'react';
import { LivePreviewLayout } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LayoutIcon } from './icons/LayoutIcon';

interface LivePreviewProps {
  data: LivePreviewLayout | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

const WireframeComponent: React.FC<{
    component: LivePreviewLayout['components'][0];
    themeColor: string;
}> = ({ component, themeColor }) => {
    return (
        <div className="bg-dark-base-100/50 p-4 rounded-lg border border-dark-base-300 w-full">
            <h4 className="font-bold" style={{ color: themeColor }}>{component.name}</h4>
            <p className="text-xs text-dark-base-content/70 mt-1 mb-3">{component.description}</p>
            <div className="flex flex-wrap gap-2">
                {component.elements.map((el, i) => (
                    <div key={i} className="bg-dark-base-300/80 text-dark-base-content/90 text-xs px-2 py-1 rounded">
                        {el}
                    </div>
                ))}
            </div>
        </div>
    );
};

const LivePreview: React.FC<LivePreviewProps> = ({ data, isLoading, error, onGenerate }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <SpinnerIcon className="w-12 h-12 text-brand-secondary animate-spin-slow" />
          <p className="mt-4 text-md text-dark-base-content/80">Visualizing UI...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[200px] flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Preview Error</h3>
            <p className="text-red-400/90 bg-red-900/20 p-3 rounded-md text-sm">{error}</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
            <LayoutIcon className="w-12 h-12 text-dark-base-300 mb-4" />
            <h3 className="text-lg font-semibold">Visualize Your Application</h3>
            <p className="text-sm text-dark-base-content/70 max-w-xs mt-1 mb-4">Let KARA generate a conceptual UI wireframe based on your project definition.</p>
            <Button onClick={onGenerate} disabled={isLoading} className="!py-2 !px-4 text-sm">
                {isLoading ? 'Generating...' : 'Visualize Application UI'}
                <SparklesIcon className="w-4 h-4 ml-2" />
            </Button>
        </div>
      );
    }

    return (
        <div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-dark-base-content">Application Preview</h3>
                    <p className="text-sm text-dark-base-content/60">
                        Layout: <span className="font-semibold" style={{color: data.theme.primaryColor}}>{data.layoutType}</span> | Theme: <span className="capitalize">{data.theme.mode}</span>
                    </p>
                </div>
                 <button onClick={onGenerate} disabled={isLoading} title="Regenerate Preview" className="p-2 text-dark-base-content/60 hover:text-brand-accent transition-colors disabled:opacity-50">
                    <SparklesIcon className="w-5 h-5"/>
                 </button>
            </div>

            <div className="space-y-3 p-4 bg-dark-base-100 rounded-lg border-2 border-dashed border-dark-base-300">
                {data.components.map(component => (
                    <WireframeComponent key={component.name} component={component} themeColor={data.theme.primaryColor} />
                ))}
            </div>
        </div>
    );
  };

  return <Card>{renderContent()}</Card>;
};

export default LivePreview;
