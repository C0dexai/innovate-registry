
import React from 'react';
import { Button } from './ui/Button';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface PreviewHostProps {
  onClose: () => void;
}

export const PreviewHost: React.FC<PreviewHostProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 73px)'}}>
      <div className="p-4 bg-dark-base-200 border-b border-dark-base-300 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-dark-base-content">Application Preview</h2>
        <Button onClick={onClose} className="!py-2 !px-4 text-sm bg-dark-base-300 hover:bg-dark-base-300/80 text-dark-base-content">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Configuration
        </Button>
      </div>
      <iframe
        src="/preview.html"
        title="Application Preview"
        className="w-full h-full border-0 bg-transparent"
      />
    </div>
  );
};
