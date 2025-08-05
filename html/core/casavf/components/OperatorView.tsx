
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CuaAction } from '../types';
import { generateCuaAction } from '../services/geminiService';
import { MicIcon, StopIcon, CrosshairIcon } from './FileIcons';
import LoadingSpinner from './LoadingSpinner';

type SessionState = 'idle' | 'requesting' | 'listening' | 'processing' | 'guiding' | 'finished' | 'error';

// Speech Recognition and Synthesis setup (similar to AgentView)
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart: (() => void) | null;
    onresult: ((event: any) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const OperatorView: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [userTask, setUserTask] = useState('');
    const [currentAction, setCurrentAction] = useState<CuaAction | null>(null);
    const [actionHistory, setActionHistory] = useState<CuaAction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    const voices = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        // Init Speech APIs
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const isSupported = !!SpeechRecognition && 'speechSynthesis' in window;
        if (isSupported) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            speechRecognitionRef.current = recognition;
            
            const loadVoices = () => { voices.current = window.speechSynthesis.getVoices(); };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            setError("Voice features are not supported in this browser.");
        }
        
        return () => stopSession(); // Cleanup on unmount
    }, []);

    const speak = useCallback((text: string) => {
        if (!text || voices.current.length === 0) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const femaleVoice = voices.current.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
        utterance.voice = femaleVoice || voices.current.find(v => v.lang.startsWith('en')) || voices.current[0];
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    }, []);

    const startSession = async () => {
        if (streamRef.current) stopSession();
        setSessionState('requesting');
        setError(null);
        setCurrentAction(null);
        setActionHistory([]);
        setUserTask('');
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 10, max: 15 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            stream.getVideoTracks()[0].onended = () => stopSession();
            setSessionState('listening');
            speak("Operator mode activated. Awaiting your command.");
        } catch (err) {
            console.error("Screen capture failed:", err);
            setError("Permission denied. To use Operator Mode, please click 'Start Session' again and allow screen sharing when prompted.");
            setSessionState('error');
        }
    };

    const stopSession = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        speechRecognitionRef.current?.abort();
        window.speechSynthesis.cancel();
        if (videoRef.current) videoRef.current.srcObject = null;
        setSessionState('idle');
    };

    const processNextStep = useCallback(async (taskOverride?: string) => {
        const currentTask = taskOverride || userTask;
        if (!streamRef.current || !videoRef.current || !currentTask) return;

        setSessionState('processing');
        setError(null);
        setCurrentAction(null);
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError("Failed to capture screen frame.");
            setSessionState('error');
            return;
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        
        try {
            const action = await generateCuaAction(currentTask, actionHistory, imageBase64);
            setCurrentAction(action);
            
            if (action.action_type === 'done') {
                speak(action.summary || "Task completed.");
                setSessionState('finished');
            } else {
                speak(action.thought);
                setSessionState('guiding');
                setActionHistory(prev => [...prev, action]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setSessionState('error');
        }

    }, [userTask, actionHistory]);
    
    const handleMicClick = () => {
        if (!speechRecognitionRef.current || sessionState !== 'listening') return;
        const recognition = speechRecognitionRef.current;
        
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            if (e.error === 'no-speech' || e.error === 'audio-capture') {
                setError("No speech detected. Please try again.");
            } else if (e.error === 'not-allowed') {
                setError("Microphone access denied by browser settings.");
            } else {
                setError(`Voice recognition error: ${e.error}`);
            }
            setIsListening(false);
        };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setUserTask(transcript);
            speak(`Understood. Your task is: ${transcript}. Starting analysis.`);
            processNextStep(transcript);
        };
        recognition.start();
    };

    const isSessionActive = sessionState !== 'idle' && sessionState !== 'error';

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">Operator Mode</h2>
                <p className="text-lg text-neutral-300 font-light max-w-3xl mx-auto">Guide the operation with your voice. Kara's systems will analyze and direct.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 relative min-h-[50vh] flex flex-col">
                {/* Video and Overlay */}
                <div className="relative flex-grow bg-black rounded-md flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />

                    {sessionState === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-center p-4">
                            <CrosshairIcon className="w-16 h-16 text-red-500/50 mb-4" />
                            <h3 className="text-2xl font-bold text-white uppercase">Start a session to begin</h3>
                            <p className="text-slate-400">The agent will require screen sharing permission.</p>
                        </div>
                    )}
                     {currentAction?.action_type === 'click' && currentAction.coordinates && videoRef.current && (
                        <div className="cua-indicator" style={{ 
                            top: `${currentAction.coordinates.y * 100}%`, 
                            left: `${currentAction.coordinates.x * 100}%`,
                        }} />
                     )}
                </div>
                
                {/* Controls and Status */}
                {isSessionActive && (
                    <div className={`flex-shrink-0 mt-4 p-3 bg-slate-800/50 rounded-md border border-slate-700 transition-shadow duration-300 ${sessionState === 'listening' ? 'listening-glow' : ''}`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                             <div className="w-full sm:w-auto">
                                <p className="text-red-400 text-sm uppercase font-bold tracking-wider">Status: {sessionState}</p>
                                <p className="text-white text-lg h-7">
                                    {sessionState === 'listening' && "Click the mic to give your command..."}
                                    {sessionState === 'processing' && "Analyzing screen, please wait..."}
                                    {sessionState === 'guiding' && "Awaiting you to perform the action."}
                                    {sessionState === 'finished' && "Operation complete."}
                                </p>
                             </div>
                             <div className="flex items-center gap-2">
                                {sessionState === 'listening' && (
                                    <button onClick={handleMicClick} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-700 animate-pulse' : 'bg-red-900/80 hover:bg-red-800'}`}>
                                        {isListening ? <StopIcon className="text-white"/> : <MicIcon className="text-white" />}
                                    </button>
                                )}
                                {sessionState === 'guiding' && (
                                    <button onClick={() => processNextStep()} className="bg-red-700 text-white font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors uppercase tracking-wider">
                                        Next Step
                                    </button>
                                )}
                             </div>
                        </div>
                        {currentAction && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                                <p className="text-sm text-slate-400">Agent's Thought: <span className="text-slate-200 italic">"{currentAction.thought}"</span></p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={isSessionActive ? stopSession : startSession}
                        className="bg-slate-700 text-white font-bold py-2 px-6 rounded-md hover:bg-slate-600 transition-colors uppercase tracking-wider"
                    >
                       {isSessionActive ? 'End Session' : 'Start Session'}
                    </button>
                </div>

                 {error && (
                    <div className="mt-4 text-center bg-red-900/50 border border-red-700 p-3 rounded-lg">
                        <h3 className="font-bold text-red-400 uppercase">System Alert</h3>
                        <p className="text-neutral-300">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperatorView;