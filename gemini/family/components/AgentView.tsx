
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, ChatMessage } from '../types';
import { Chat, createChatSession, sendMessage } from '../services/geminiService';
import { loadMessages, saveMessages, initDB } from '../services/dbService';
import LoadingSpinner from './LoadingSpinner';
import TypingIndicator from './TypingIndicator';
import { MicIcon, StopIcon } from './FileIcons';

// Minimal type definitions for Web Speech API to satisfy TypeScript
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart: (() => void) | null;
    onresult: ((event: any) => void) | null; // Use any for the event to keep it simple
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null; // Use any for the event
}

// Extend the Window interface
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface AgentViewProps {
  agent: Agent;
}

const AgentView: React.FC<AgentViewProps> = ({ agent }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial greeting
  const [isChatLoading, setIsChatLoading] = useState(false); // For user messages
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Voice Chat State
  const [isListening, setIsListening] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);
  
  // Initialize DB and Speech APIs
  useEffect(() => {
    initDB().catch(err => console.error("Failed to initialize DB", err));
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && 'speechSynthesis' in window;
    setIsVoiceSupported(isSupported);

    if (isSupported) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        speechRecognitionRef.current = recognition;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices.filter(v => v.lang.startsWith('en')));
        };

        // Voices might load asynchronously.
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    } else {
        setVoiceError("Voice features not supported in this browser.");
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isVoiceSupported || voices.length === 0 || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    let voiceToUse: SpeechSynthesisVoice | undefined;

    // 1. Prioritize user's selected voice for this agent
    if (selectedVoiceURI) {
        voiceToUse = voices.find(v => v.voiceURI === selectedVoiceURI);
    }

    // 2. If no user selection or selected voice not found, use fallback logic
    if (!voiceToUse) {
        if (agent.gender === 'Female') {
            voiceToUse = voices.find(v => v.name.includes('Female')) || voices.find(v => v.name.includes('Zira')) || voices.find(v => v.name.includes('Samantha'));
        } else {
            voiceToUse = voices.find(v => v.name.includes('Male')) || voices.find(v => v.name.includes('David')) || voices.find(v => v.name.includes('Tom'));
        }
        // Final fallback to any english voice
        if (!voiceToUse) {
            voiceToUse = voices[0];
        }
    }

    utterance.voice = voiceToUse || null;
    utterance.pitch = 1;
    utterance.rate = 1.1;
    utterance.volume = 1;
    utterance.onstart = () => setIsAgentSpeaking(true);
    utterance.onend = () => setIsAgentSpeaking(false);
    utterance.onerror = (e) => {
        setIsAgentSpeaking(false);
        console.warn(`Speech synthesis error for voice URI "${selectedVoiceURI}":`, e);
        setVoiceError("The selected voice could not be used. Please choose another.");
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isVoiceSupported, voices, selectedVoiceURI, agent.gender]);

  const sendUserMessage = useCallback(async (message: string) => {
    if (!chatSession || !message.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    setError(null);
    setVoiceError(null);
    
    try {
      const response = await sendMessage(chatSession, message);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
      speak(response);
    } catch(err) {
      setError("Lost the connection. This agent is unavailable.");
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatSession, isChatLoading, speak]);


  useEffect(() => {
    isInitialLoad.current = true;
    setIsLoading(true);
    setError(null);
    setMessages([]);
    setInputValue('');
    window.speechSynthesis.cancel();
    speechRecognitionRef.current?.abort();

    const initializeChat = async () => {
      try {
        const savedVoiceURI = localStorage.getItem(`voice-for-${agent.name}`) || '';
        setSelectedVoiceURI(savedVoiceURI);
        
        const newChat = createChatSession(agent.personality_prompt);
        setChatSession(newChat);

        const loadedMessages = await loadMessages(agent.name);
        
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          const greeting = await sendMessage(newChat, "Introduce yourself to the user in one or two sharp, in-character sentences. Address them directly.");
          const firstMessage: ChatMessage = { role: 'model', content: greeting };
          setMessages([firstMessage]);
          speak(greeting);
        }
      } catch (err) {
        setError("Failed to connect with the agent's core systems.");
        console.error(err);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };
    
    initializeChat();

    return () => {
        window.speechSynthesis.cancel();
        speechRecognitionRef.current?.abort();
        setChatSession(null);
    };
  }, [agent, speak]);
  
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (messages.length > 0) {
      saveMessages(agent.name, messages).catch(err => {
        console.error("Failed to save chat history:", err);
      });
    }
  }, [messages, agent.name]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendUserMessage(inputValue);
      setInputValue('');
    }
  };

  const handleVoiceToggle = () => {
    if (!speechRecognitionRef.current || isAgentSpeaking) return;

    const recognition = speechRecognitionRef.current;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    
    finalTranscriptRef.current = '';
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscriptRef.current.trim()) {
        sendUserMessage(finalTranscriptRef.current);
        setInputValue('');
      }
    };
    recognition.onerror = (event: any) => {
      setVoiceError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      finalTranscriptRef.current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInputValue(finalTranscriptRef.current + interimTranscript);
    };

    recognition.start();
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newURI = e.target.value;
      setSelectedVoiceURI(newURI);
      if (newURI) {
          localStorage.setItem(`voice-for-${agent.name}`, newURI);
      } else {
          localStorage.removeItem(`voice-for-${agent.name}`);
      }
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg">
      <header className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-700/50 gap-4">
        <div>
          <h2 className={`text-xl font-bold uppercase ${agent.name === 'Kara' ? 'kara-glow text-red-500' : 'text-white'}`}>{agent.name}</h2>
          <p className="text-red-400 font-light">{agent.role}</p>
        </div>
        {isVoiceSupported && voices.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="voice-select" className="text-sm font-medium text-slate-400 flex-shrink-0">Voice:</label>
            <select 
                id="voice-select"
                value={selectedVoiceURI}
                onChange={handleVoiceChange}
                className="bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition w-full"
                aria-label={`Select voice for ${agent.name}`}
            >
                <option value="">Default ({agent.gender})</option>
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
            </select>
          </div>
        )}
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : error && messages.length === 0 ? (
          <div className="text-center text-red-500 p-4">
              <h3 className="text-xl font-bold mb-2 uppercase">System Anomaly</h3>
              <p>{error}</p>
          </div>
        ) : (
          messages.map((msg, index) => (
             <div key={index} className={`flex items-end my-3 gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                        agent.gender === 'Female' ? 'bg-fuchsia-900/50 border-fuchsia-600/50 neon-glow-fuchsia' : 'bg-cyan-900/50 border-cyan-600/50 neon-glow-cyan'
                    } ${isAgentSpeaking ? 'agent-speaking-glow' : ''}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${agent.gender === 'Female' ? 'text-fuchsia-300' : 'text-cyan-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                )}
                <div className={`max-w-md md:max-w-lg p-3 rounded-lg prose prose-invert prose-p:font-light prose-headings:uppercase max-w-none ${msg.role === 'user' ? 'bg-blue-900/50 text-white' : 'bg-slate-800 text-cyan-200'}`}>
                    {msg.content.split('\n').filter(p => p.trim() !== "").map((paragraph, pIndex) => (
                        <p key={pIndex} className="mb-2 last:mb-0">{paragraph}</p>
                    ))}
                </div>
            </div>
          ))
        )}
        {isChatLoading && <TypingIndicator />}
        {error && messages.length > 0 && <p className="text-center text-red-500 text-sm mt-2">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
        {voiceError && <p className="text-center text-yellow-500 text-sm mb-2">{voiceError}</p>}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${agent.name}...`}
            disabled={isLoading || isChatLoading || isAgentSpeaking}
            className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          {isVoiceSupported && (
            <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isAgentSpeaking}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 listening-glow' : 'bg-slate-700 hover:bg-slate-600'} disabled:bg-slate-800 disabled:cursor-not-allowed`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
                {isListening ? <StopIcon className="h-6 w-6 text-white" /> : <MicIcon className="h-6 w-6 text-white" />}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || isChatLoading || !inputValue.trim() || isAgentSpeaking}
            className="bg-red-700 text-white font-bold p-2 rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentView;