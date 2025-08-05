
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import type { LivePreviewLayout, ProjectDetails, LivePreviewComponent } from './types';

// Helper to get data from localStorage
const getPreviewData = (): { layout: LivePreviewLayout | null; details: ProjectDetails | null } => {
    try {
        const layoutData = localStorage.getItem('kara-preview-data');
        const projectData = localStorage.getItem('kara-project-details');
        return {
            layout: layoutData ? JSON.parse(layoutData) : null,
            details: projectData ? JSON.parse(projectData) : null,
        };
    } catch (e) {
        console.error("Failed to parse preview data from localStorage", e);
        return { layout: null, details: null };
    }
};

const ComponentCard: React.FC<{ component: LivePreviewComponent }> = ({ component }) => (
    <div className="bg-dark-base-200 p-4 rounded-lg border border-dark-base-300 w-full transition-all hover:border-[var(--theme-primary)] hover:shadow-lg">
        <h4 className="font-bold text-[var(--theme-primary)] text-lg">{component.name}</h4>
        <p className="text-sm text-dark-base-content/70 mt-1 mb-3">{component.description}</p>
        <div className="flex flex-wrap gap-2">
            {component.elements.map((el, i) => (
                <div key={i} className="bg-dark-base-300 text-dark-base-content/90 text-xs px-2 py-1 rounded-full">
                    {el}
                </div>
            ))}
        </div>
    </div>
);

const PreviewPage: React.FC = () => {
    const [data, setData] = useState<{ layout: LivePreviewLayout | null; details: ProjectDetails | null }>({ layout: null, details: null });
    const isEmbedded = window.self !== window.top;

    useEffect(() => {
        const previewData = getPreviewData();
        setData(previewData);
        if (previewData.layout?.theme.primaryColor) {
            document.documentElement.style.setProperty('--theme-primary', previewData.layout.theme.primaryColor);
        }
         if (previewData.layout?.theme.font) {
            const fontLink = document.getElementById('dynamic-google-font');
            if (fontLink) {
              fontLink.remove();
            }
            const link = document.createElement('link');
            link.id = 'dynamic-google-font';
            link.href = `https://fonts.googleapis.com/css2?family=${previewData.layout.theme.font.replace(/ /g, '+')}:wght@400;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            document.body.style.fontFamily = `'${previewData.layout.theme.font}', sans-serif`;
        }
    }, []);

    if (!data.layout || !data.details) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
                <h1 className="text-3xl font-bold text-dark-base-content mb-2">No Preview Data Found</h1>
                <p className="text-dark-base-content/70 mb-6">Please generate a new application preview from the KARA Project Initiator.</p>
                {!isEmbedded && (
                    <button onClick={() => window.close()} className="px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors">
                        Close Window
                    </button>
                )}
            </div>
        );
    }
    
    const { layout, details } = data;

    const mainContent = (
         <main className="container mx-auto p-4 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="p-6 bg-dark-base-200 rounded-lg sticky top-24">
                        <h2 className="text-lg font-bold mb-4">Design Specification</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-dark-base-content/70">Layout Type:</span>
                                <span className="font-semibold text-[var(--theme-primary)]">{layout.layoutType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-dark-base-content/70">Primary Color:</span>
                                <div className="flex items-center gap-2">
                                   <span className="font-mono text-xs">{layout.theme.primaryColor}</span>
                                   <div className="w-5 h-5 rounded-full border border-dark-base-300" style={{ backgroundColor: layout.theme.primaryColor }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-base-content/70">Theme Mode:</span>
                                <span className="font-semibold capitalize">{layout.theme.mode}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-dark-base-content/70">Font Family:</span>
                                <span className="font-semibold">{layout.theme.font}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                     <h2 className="text-lg font-bold">UI Components</h2>
                    {layout.components.map(component => (
                        <ComponentCard key={component.name} component={component} />
                    ))}
                </div>
            </div>
        </main>
    );

    return (
        <div className={`font-sans ${layout.theme.mode === 'light' ? 'bg-base-100 text-base-content' : 'bg-dark-base-100 text-dark-base-content'}`}>
             <style>{`
                :root { 
                    --theme-primary: ${layout.theme.primaryColor};
                    --theme-font: '${layout.theme.font}', sans-serif;
                }
                body {
                    font-family: var(--theme-font);
                    background-color: transparent; /* Allows iframe background to be controlled by parent */
                }
                .bg-dark-base-100 {
                    ${isEmbedded ? 'background-color: transparent !important;' : ''}
                }
            `}</style>
            {!isEmbedded && (
                <header className="bg-dark-base-200/50 backdrop-blur-sm sticky top-0 z-10 border-b border-dark-base-300">
                    <div className="container mx-auto p-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-dark-base-content">
                                {details.overview.projectName}
                            </h1>
                            <p className="text-sm text-dark-base-content/60">
                                Live Application Preview
                            </p>
                        </div>
                        <button onClick={() => window.close()} className="text-sm text-dark-base-content/70 hover:text-brand-secondary transition-colors">
                            Close
                        </button>
                    </div>
                </header>
            )}

            {mainContent}

            {!isEmbedded && (
                <footer className="text-center p-4 mt-8 border-t border-dark-base-300">
                    <p className="text-xs text-dark-base-content/50">This is a conceptual wireframe generated by KARA. Not a functional application.</p>
                </footer>
            )}
        </div>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<PreviewPage />);
