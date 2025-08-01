


import React, { useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { RealtimeSessionStatus } from '../types';
import { MicrophoneIcon, SquareIcon, BotIcon, UserIcon, ToggleLeftIcon, ToggleRightIcon } from './Icons';

export const Realtime: React.FC = () => {
    const { realtimeSession, startRealtimeSession, stopRealtimeSession, toggleAiControlMode, apiKeys } = useContext(AppContext);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [realtimeSession.transcript]);

    const handleStart = () => {
        if (realtimeSession.status === RealtimeSessionStatus.IDLE || realtimeSession.status === RealtimeSessionStatus.ERROR) {
            startRealtimeSession();
        }
    };

    const handleStop = () => {
        if (realtimeSession.status === RealtimeSessionStatus.CONNECTED) {
            stopRealtimeSession();
        }
    };

    const getStatusIndicator = () => {
        switch (realtimeSession.status) {
            case RealtimeSessionStatus.IDLE: return <div className="w-3 h-3 rounded-full bg-gray-500" title="Idle"></div>;
            case RealtimeSessionStatus.CONNECTING: return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" title="Connecting..."></div>;
            case RealtimeSessionStatus.CONNECTED: return <div className="w-3 h-3 rounded-full bg-green-500" title="Connected"></div>;
            case RealtimeSessionStatus.ERROR: return <div className="w-3 h-3 rounded-full bg-red-500" title={`Error: ${realtimeSession.errorDetails}`}></div>;
            case RealtimeSessionStatus.CLOSING: return <div className="w-3 h-3 rounded-full bg-yellow-500" title="Closing..."></div>;
            default: return null;
        }
    };

    const isControlModeDisabled = realtimeSession.status === RealtimeSessionStatus.IDLE || realtimeSession.status === RealtimeSessionStatus.ERROR;

    return (
        <div className="flex h-full bg-primary text-bright-text">
            <div className="w-1/3 min-w-[350px] flex flex-col border-r border-secondary p-6">
                <h2 className="text-3xl font-bold">Realtime Conversation</h2>
                <p className="text-dim-text mt-2">Speak directly with an AI assistant for a fluid, voice-first interaction.</p>

                {!apiKeys.openai && (
                    <div className="mt-6 p-3 bg-highlight/20 text-highlight rounded-lg text-center text-sm">
                        Please set up your OpenAI API key in 'Integrations' to use Realtime chat.
                    </div>
                )}
                
                <div className="mt-8 flex items-center justify-center gap-6">
                     <button
                        onClick={handleStart}
                        disabled={realtimeSession.status !== RealtimeSessionStatus.IDLE && realtimeSession.status !== RealtimeSessionStatus.ERROR || !apiKeys.openai}
                        className="w-24 h-24 bg-green-600 hover:bg-green-500 rounded-full flex flex-col items-center justify-center transition-all disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        <MicrophoneIcon className="w-10 h-10 mb-1" />
                        <span className="text-xs font-semibold">START</span>
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={realtimeSession.status !== RealtimeSessionStatus.CONNECTED}
                        className="w-24 h-24 bg-red-600 hover:bg-red-500 rounded-full flex flex-col items-center justify-center transition-all disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        <SquareIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs font-semibold">STOP</span>
                    </button>
                </div>
                
                 <div className="mt-8 pt-6 border-t border-secondary space-y-4">
                     <h4 className="text-sm font-semibold text-dim-text">AI CONTROL MODE</h4>
                     <div className="flex items-center gap-3">
                        <button onClick={toggleAiControlMode} className="text-dim-text disabled:opacity-50 disabled:cursor-not-allowed" disabled={isControlModeDisabled}>
                            {realtimeSession.isAiControlEnabled ? <ToggleRightIcon className="w-10 h-10 text-accent"/> : <ToggleLeftIcon className="w-10 h-10"/>}
                        </button>
                        <div>
                             <p className={`font-semibold ${realtimeSession.isAiControlEnabled ? 'text-accent' : 'text-bright-text'}`}>
                                {realtimeSession.isAiControlEnabled ? 'Enabled' : 'Disabled'}
                            </p>
                            <p className="text-xs text-dim-text">Allow AI to execute commands.</p>
                        </div>
                     </div>
                 </div>

                 <div className="mt-auto pt-6 border-t border-secondary">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-dim-text">SESSION STATUS</h4>
                        {getStatusIndicator()}
                    </div>
                    {realtimeSession.status === RealtimeSessionStatus.ERROR && (
                        <p className="text-xs text-red-400 mt-2">{realtimeSession.errorDetails}</p>
                    )}
                </div>
            </div>
            <div className={`flex-grow flex flex-col bg-[#0d1117] p-4 transition-all ${realtimeSession.isAiControlEnabled ? 'ring-2 ring-accent ring-inset' : ''}`}>
                 <h3 className="text-lg font-bold text-bright-text mb-4 flex-shrink-0">Live Transcript</h3>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {realtimeSession.transcript.map(item => (
                        <div key={item.id} className={`flex items-start gap-3 ${item.source === 'user' ? 'justify-end' : ''}`}>
                            {item.source === 'ai' && <BotIcon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />}
                            <div className={`max-w-xl p-3 rounded-lg text-sm ${item.source === 'user' ? 'bg-accent/80 text-white' : 'bg-secondary text-bright-text'} ${!item.isFinal ? 'opacity-70' : ''}`}>
                                {item.text}
                            </div>
                            {item.source === 'user' && <UserIcon className="w-6 h-6 text-dim-text flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                    {realtimeSession.isSpeaking && (
                         <div className="flex items-start gap-3">
                            <BotIcon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                            <div className="max-w-xl p-3 rounded-lg text-sm bg-secondary text-bright-text">
                                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse mr-2"></span>
                                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse mr-2 delay-75"></span>
                                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
            </div>
        </div>
    );
};
