
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LayoutIcon } from './icons/LayoutIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';

interface PreviewLauncherProps {
  hasPreviewData: boolean;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onOpen: () => void;
}

const PreviewLauncher: React.FC<PreviewLauncherProps> = ({ hasPreviewData, isLoading, error, onGenerate, onOpen }) => {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <SpinnerIcon className="w-12 h-12 text-brand-primary animate-spin-slow" />
          <p className="mt-4 text-md text-dark-base-content/80">Visualizing UI...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[200px] flex flex-col justify-center items-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Preview Error</h3>
            <p className="text-red-400/90 bg-red-900/20 p-3 rounded-md text-sm mb-4">{error}</p>
            <Button onClick={onGenerate} disabled={isLoading} className="!py-2 !px-4 text-sm">
                Try Again
            </Button>
        </div>
      );
    }

    if (hasPreviewData) {
       return (
        <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
            <LayoutIcon className="w-12 h-12 text-brand-primary mb-4" />
            <h3 className="text-lg font-semibold">Preview Generated</h3>
            <p className="text-sm text-dark-base-content/70 max-w-xs mt-1 mb-4">Your conceptual application UI is ready to be viewed.</p>
            <div className="flex gap-2">
                <Button onClick={onOpen} className="!py-2 !px-4 text-sm">
                    Open Preview
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                </Button>
                 <Button onClick={onGenerate} title="Regenerate" className="!p-2.5 text-sm !font-bold bg-dark-base-300 hover:bg-dark-base-300/80 text-dark-base-content/80">
                    <SparklesIcon className="w-4 h-4 text-brand-secondary" />
                 </Button>
            </div>
        </div>
      );
    }
    
    // Initial state
    return (
        <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
            <LayoutIcon className="w-12 h-12 text-dark-base-300 mb-4" />
            <h3 className="text-lg font-semibold">Visualize Your Application</h3>
            <p className="text-sm text-dark-base-content/70 max-w-xs mt-1 mb-4">Let KARA generate a conceptual UI from your project definition.</p>
            <Button onClick={onGenerate} disabled={isLoading} className="!py-2 !px-4 text-sm">
                Visualize Application UI
                <SparklesIcon className="w-4 h-4 ml-2" />
            </Button>
        </div>
      );
  };

  return <Card>{renderContent()}</Card>;
};

export default PreviewLauncher;