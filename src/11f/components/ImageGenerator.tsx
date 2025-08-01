import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { SparklesIcon, Trash2Icon, LightbulbIcon, BotIcon } from './Icons';

const ImageGenerator: React.FC = () => {
    const { generatedImages, generateImages, deleteGeneratedImage, apiKeys } = useContext(AppContext);
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic city skyline at dusk, with flying vehicles and neon lights.');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim() || !apiKeys.gemini) return;
        setIsLoading(true);
        try {
            await generateImages(prompt);
        } catch (error) {
            console.error("Failed to generate image from UI:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this image?")) {
            deleteGeneratedImage(id);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full bg-primary text-bright-text">
            {/* Control Panel */}
            <div className="col-span-1 lg:col-span-1 bg-primary border-r border-secondary p-6 flex flex-col gap-6">
                <div>
                    <h2 className="text-3xl font-bold">Image Generator</h2>
                    <p className="text-dim-text mt-1">Create images with the Imagen 3 model.</p>
                </div>

                {!apiKeys.gemini && (
                     <div className="p-3 bg-highlight/20 text-highlight rounded-lg text-center text-sm">
                        Please set up your Gemini API key in the 'Integrations' tab to use the image generator.
                    </div>
                )}
                
                <div className="space-y-4">
                     <div>
                        <label htmlFor="prompt" className="block text-sm font-semibold text-dim-text mb-2">Prompt (The more detailed, the better)</label>
                        <textarea
                            id="prompt"
                            rows={6}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-secondary p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                            placeholder="e.g., A majestic white tiger walking through a snowy forest"
                        />
                    </div>
                    <div>
                        <label htmlFor="aspect-ratio" className="block text-sm font-semibold text-dim-text mb-2">Aspect Ratio</label>
                         <select id="aspect-ratio" className="w-full bg-secondary p-3 rounded-md border border-slate-600 focus:ring-accent focus:border-accent text-sm">
                            <option>1:1 (Square)</option>
                            <option>16:9 (Widescreen)</option>
                            <option>9:16 (Portrait)</option>
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !apiKeys.gemini}
                    className="w-full mt-2 bg-accent text-white py-3 px-4 rounded-lg hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-bold transition-all"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-6 h-6"/>
                            Generate Image
                        </>
                    )}
                </button>
                <div className="mt-auto p-4 bg-secondary/50 rounded-lg flex items-start gap-3 text-sm">
                    <LightbulbIcon className="w-6 h-6 text-highlight flex-shrink-0 mt-1"/>
                    <p className="text-dim-text">
                        <strong>Hint:</strong> Try describing styles like "pixel art," "watercolor painting," or "photorealistic" to guide the AI.
                    </p>
                </div>
            </div>

            {/* Gallery Panel */}
            <div className="col-span-1 lg:col-span-2 bg-[#0d1117] overflow-y-auto p-6">
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center">
                         <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                         <p className="mt-4 text-lg font-semibold">Generating your masterpiece...</p>
                    </div>
                )}
                {generatedImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-dim-text">
                        <BotIcon className="w-24 h-24 text-slate-700"/>
                        <h3 className="mt-4 text-2xl font-bold text-bright-text">Your Gallery is Empty</h3>
                        <p className="mt-2 max-w-sm">Use the panel on the left to generate your first image. Your creations will appear here and be saved for your next session.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {generatedImages.map(image => (
                             <div key={image.id} className="group relative bg-secondary rounded-lg overflow-hidden shadow-lg">
                                <img src={`data:image/jpeg;base64,${image.base64}`} alt={image.prompt} className="w-full h-auto object-cover aspect-square"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-xs text-white line-clamp-3">{image.prompt}</p>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete Image"
                                    >
                                        <Trash2Icon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;