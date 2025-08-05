import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track, View } from './types';
import MusicLibrary from './components/MusicLibrary';
import FavoritesList from './components/FavoritesList';
import MusicPlayer from './components/MusicPlayer';
import Icon from './components/Icon';
import RadioStationList from './components/RadioStationList';
import { predefinedStations } from './data/stations';
import EqSettings from './components/EqSettings';
import Pagination from './components/Pagination';
import * as db from './db';

const EQ_FREQUENCIES = [60, 250, 1000, 4000, 16000];
const ITEMS_PER_PAGE_LIBRARY = 6;
const ITEMS_PER_PAGE_FAVORITES = 6;
const ITEMS_PER_PAGE_RADIO = 6;

// FloatingNav component defined in App.tsx to avoid creating new files.
const FloatingNav: React.FC<{ changeView: (view: View) => void; isVisible: boolean }> = ({ changeView, isVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ bottom: 128, right: 32 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, bottom: 0, right: 0 });
  const fabRef = useRef<HTMLDivElement>(null);


  const navItems = [
    { view: View.Library, icon: 'music-note', color: 'cyan', label: 'Library' },
    { view: View.Favorites, icon: 'heart-filled', color: 'pink', label: 'Favorites' },
    { view: View.Radio, icon: 'radio', color: 'green', label: 'Radio' },
  ] as const;

  const colors = {
      cyan: 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_var(--neon-cyan)]',
      pink: 'bg-pink-500 hover:bg-pink-400 shadow-[0_0_15px_var(--neon-pink)]',
      green: 'bg-green-500 hover:bg-green-400 shadow-[0_0_15px_var(--neon-green)]',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') !== fabRef.current?.querySelector('button')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY, bottom: position.bottom, right: position.right };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    const fabSize = 80;
    const newRight = dragStartPos.current.right - dx;
    const newBottom = dragStartPos.current.bottom - dy;
    
    const constrainedRight = Math.max(16, Math.min(newRight, window.innerWidth - fabSize - 16));
    const constrainedBottom = Math.max(16, Math.min(newBottom, window.innerHeight - fabSize - 16));

    setPosition({ bottom: constrainedBottom, right: constrainedRight });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = 'default';
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <div 
        ref={fabRef}
        className="fixed z-[60]"
        style={{ bottom: `${position.bottom}px`, right: `${position.right}px` }}
        onMouseDown={handleMouseDown}
    >
      <div className="relative flex flex-col items-center gap-4">
        {navItems.map((item, index) => (
          <button
            key={item.view}
            onClick={() => {
                if (isDragging) return;
                changeView(item.view);
                setIsOpen(false);
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-black font-semibold transition-all duration-300 transform ${colors[item.color]} ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 -translate-y-4'}`}
            style={{ transitionDelay: `${isOpen ? index * 50 : (navItems.length - index - 1) * 30}ms`}}
            aria-label={`Go to ${item.label}`}
          >
            <Icon name={item.icon} className="w-7 h-7" />
          </button>
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-pink-600 transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-pointer'}`}
          style={{ boxShadow: '0 0 8px var(--neon-pink), 0 0 16px var(--neon-purple), inset 0 0 5px rgba(255,255,255,0.4)' }}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <div className="absolute inset-0 bg-black/20 rounded-full"></div>
          <Icon name={isOpen ? 'close' : 'plus'} className={`w-10 h-10 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const useDragToScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ top: 0, left: 0, x: 0, y: 0 });
  const hasDragged = useRef(false);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startPos.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDragged.current = true;
    }
    scrollRef.current.scrollTop = startPos.current.top - dy;
    scrollRef.current.scrollLeft = startPos.current.left - dx;
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.userSelect = 'auto';
    }
    if (hasDragged.current) {
        e.stopPropagation();
    }
    hasDragged.current = false;
  };
  
  const onMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.userSelect = 'auto';
    }
  };
  
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if(hasDragged.current) {
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
        element.style.cursor = 'grab';
    }
  }, []);

  return { scrollRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onClickCapture };
};


const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [stationTracks, setStationTracks] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);

  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [view, setView] = useState<View>(View.Library);
  const [previousView, setPreviousView] = useState<View>(View.Library);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const [eqBands, setEqBands] = useState<number[]>(new Array(EQ_FREQUENCIES.length).fill(0));
  const [isEqEnabled, setIsEqEnabled] = useState(true);
  const [ampGain, setAmpGain] = useState(1);
  const [isAmpEnabled, setIsAmpEnabled] = useState(false);
  const [isDuckingEnabled, setIsDuckingEnabled] = useState(false);
  const [isDuckingActive, setIsDuckingActive] = useState(false);


  const [currentPages, setCurrentPages] = useState({
    [View.Library]: 1,
    [View.Favorites]: 1,
    [View.Radio]: 1,
  });

  const { scrollRef, ...dragHandlers } = useDragToScroll();

  const audioRef = useRef<HTMLAudioElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const preampGainNodeRef = useRef<GainNode | null>(null);
  const duckingGainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const duckingAnalysisRef = useRef({ consecutiveFrames: 0, animationFrameId: 0 });


  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        await db.openDB();
        const [persistedTracks, persistedFavorites] = await Promise.all([
          db.getTracks(),
          db.getFavorites(),
        ]);
        
        if (persistedTracks.length > 0) {
          setTracks(persistedTracks);
        }
        if (persistedFavorites.length > 0) {
          setFavorites(persistedFavorites);
        }
      } catch (error) {
        console.error("Could not load data from IndexedDB:", error);
      }
    };
    
    loadPersistedData();
    setStationTracks(predefinedStations);
  }, []);

  useEffect(() => {
    setAllTracks([...stationTracks, ...tracks]);
  }, [tracks, stationTracks]);

  const currentTrack = currentTrackIndex !== null ? allTracks[currentTrackIndex] : null;

  const changeView = (newView: View) => {
    if (newView !== View.EQ && view !== newView) {
      setPreviousView(view);
    }
    setView(newView);
  };
  
  const handlePageChange = (viewType: View.Library | View.Favorites | View.Radio) => (page: number) => {
    setCurrentPages(prev => ({ ...prev, [viewType]: page }));
  };


  const setupAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sourceNode = audioContext.createMediaElementSource(audioRef.current);
      const preampGainNode = audioContext.createGain();
      const duckingGainNode = audioContext.createGain();
      const masterGainNode = audioContext.createGain();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;

      const eqNodes = EQ_FREQUENCIES.map((frequency) => {
        const eqNode = audioContext.createBiquadFilter();
        eqNode.type = 'peaking';
        eqNode.frequency.value = frequency;
        eqNode.Q.value = 1;
        return eqNode;
      });
      
      audioContextRef.current = audioContext;
      sourceNodeRef.current = sourceNode;
      preampGainNodeRef.current = preampGainNode;
      duckingGainNodeRef.current = duckingGainNode;
      gainNodeRef.current = masterGainNode;
      eqNodesRef.current = eqNodes;
      analyserNodeRef.current = analyserNode;
    } catch(e) {
      console.error("Web Audio API is not supported by this browser.", e);
    }
  }, []);

  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !sourceNodeRef.current || !preampGainNodeRef.current || !duckingGainNodeRef.current || !gainNodeRef.current || !analyserNodeRef.current) return;
    
    const source = sourceNodeRef.current;
    const preamp = preampGainNodeRef.current;
    const duckingGain = duckingGainNodeRef.current;
    const masterGain = gainNodeRef.current;
    const analyser = analyserNodeRef.current;
    const eqNodes = eqNodesRef.current;

    source.disconnect();
    preamp.disconnect();
    eqNodes.forEach(node => node.disconnect());
    duckingGain.disconnect();
    analyser.disconnect();

    preamp.gain.value = isAmpEnabled ? ampGain : 1;
    masterGain.gain.value = isMuted ? 0 : volume;
    duckingGain.gain.value = isDuckingActive ? 1/3 : 1;
    eqNodes.forEach((node, i) => {
      node.gain.value = eqBands[i];
    });
    
    source.connect(preamp);
    let lastNode: AudioNode = preamp;
    if (isEqEnabled && eqNodes.length > 0) {
      eqNodes.forEach(eqNode => {
        lastNode.connect(eqNode);
        lastNode = eqNode;
      });
    }
    
    lastNode.connect(duckingGain);
    duckingGain.connect(analyser);
    analyser.connect(masterGain);
    masterGain.connect(ctx.destination);

  }, [isEqEnabled, isAmpEnabled, ampGain, volume, isMuted, eqBands, isDuckingActive]);


  useEffect(() => {
    if (!isPlaying || !isDuckingEnabled || !analyserNodeRef.current || !audioContextRef.current) {
        cancelAnimationFrame(duckingAnalysisRef.current.animationFrameId);
        if(isDuckingActive) setIsDuckingActive(false);
        return;
    }

    const analyser = analyserNodeRef.current;
    const audioCtx = audioContextRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const voiceRangeStart = 300; // Hz
    const voiceRangeEnd = 3400; // Hz

    const analyze = () => {
        analyser.getByteFrequencyData(dataArray);

        let voiceEnergy = 0;
        let totalEnergy = 0;

        for(let i = 0; i < analyser.frequencyBinCount; i++) {
            const freq = i * audioCtx.sampleRate / analyser.fftSize;
            const energy = dataArray[i] * dataArray[i];
            totalEnergy += energy;
            if (freq >= voiceRangeStart && freq <= voiceRangeEnd) {
                voiceEnergy += energy;
            }
        }
        
        const voiceRatio = totalEnergy > 0 ? voiceEnergy / totalEnergy : 0;
        
        if (voiceRatio > 0.35) { // Threshold for detecting voice-like frequencies
            duckingAnalysisRef.current.consecutiveFrames = Math.min(duckingAnalysisRef.current.consecutiveFrames + 1, 20);
        } else {
            duckingAnalysisRef.current.consecutiveFrames = Math.max(duckingAnalysisRef.current.consecutiveFrames - 1, 0);
        }
        
        if (duckingAnalysisRef.current.consecutiveFrames > 10 && !isDuckingActive) {
            setIsDuckingActive(true);
        } else if (duckingAnalysisRef.current.consecutiveFrames < 5 && isDuckingActive) {
            setIsDuckingActive(false);
        }
        
        duckingAnalysisRef.current.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
        cancelAnimationFrame(duckingAnalysisRef.current.animationFrameId);
    };

}, [isPlaying, isDuckingEnabled, analyserNodeRef.current, isDuckingActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleCanPlay = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newTracks: Track[] = Array.from(files)
        .filter(file => file.type === 'audio/mpeg' || file.name.endsWith('.pls'))
        .flatMap((file, index) => {
          if (file.name.endsWith('.pls')) {
            console.log("PLS file upload detected. Parsing is not yet implemented.", file.name);
            return [];
          }
          return [{
            id: Date.now() + index,
            name: file.name.replace('.mp3', ''),
            url: URL.createObjectURL(file),
            file: file,
            type: 'file',
            artist: 'Local File',
          }];
        });

      for (const track of newTracks) {
        try {
          await db.addTrack(track);
        } catch (error) {
          console.error(`Failed to save track ${track.name} to DB`, error);
        }
      }

      setTracks(prevTracks => [...prevTracks, ...newTracks]);
      setCurrentPages(p => ({...p, [View.Library]: 1}));
    }
  };

  const playTrack = useCallback((index: number) => {
    if (index >= 0 && index < allTracks.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      if(!audioContextRef.current) {
        setupAudioContext();
      }
    }
  }, [allTracks.length, setupAudioContext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentTrack) {
        if(audio.src !== currentTrack.url) {
            audio.src = currentTrack.url;
        }
        audio.play().catch(error => console.error("Error playing audio:", error));
    } else if (!isPlaying) {
        audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    } else if (allTracks.length > 0) {
      playTrack(0);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex === null || currentTrack?.type !== 'file') return;
    
    const fileTracks = allTracks.map((t, i) => ({...t, originalIndex: i})).filter(t => t.type === 'file');
    const currentFileIndex = fileTracks.findIndex(t => t.id === currentTrack.id);

    if (currentFileIndex !== -1) {
        const nextFileIndex = (currentFileIndex + 1) % fileTracks.length;
        playTrack(fileTracks[nextFileIndex].originalIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex === null || currentTrack?.type !== 'file') return;

    const fileTracks = allTracks.map((t, i) => ({...t, originalIndex: i})).filter(t => t.type === 'file');
    const currentFileIndex = fileTracks.findIndex(t => t.id === currentTrack.id);

     if (currentFileIndex !== -1) {
        const prevFileIndex = (currentFileIndex - 1 + fileTracks.length) % fileTracks.length;
        playTrack(fileTracks[prevFileIndex].originalIndex);
    }
  };
  
  const handleToggleFavorite = async (trackId: number | string) => {
    const currentFavorites = favorites;
    const newFavorites = currentFavorites.includes(trackId)
      ? currentFavorites.filter(id => id !== trackId)
      : [...currentFavorites, trackId];
    
    setFavorites(newFavorites); // Optimistic UI update

    try {
      await db.saveFavorites(newFavorites);
    } catch(e) {
      console.error("Failed to save favorites to DB", e);
      setFavorites(currentFavorites); // Revert on failure
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(audioRef.current){
          audioRef.current.currentTime = Number(e.target.value);
          setCurrentTime(audioRef.current.currentTime);
      }
  };
  
  const handleEnded = () => {
      if (currentTrack?.type === 'file') {
          handleNext();
      }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleEqChange = (bandIndex: number, gain: number) => {
    setEqBands(prevBands => {
      const newBands = [...prevBands];
      newBands[bandIndex] = gain;
      return newBands;
    });
  };

  const handleAmpGainChange = (gain: number) => {
    setAmpGain(gain);
  };

  const userFileTracks = allTracks.filter(t => t.type === 'file');
  const favoriteTracks = allTracks.filter(t => favorites.includes(t.id));

  const paginatedLibrary = userFileTracks.slice(
      (currentPages[View.Library] - 1) * ITEMS_PER_PAGE_LIBRARY,
      currentPages[View.Library] * ITEMS_PER_PAGE_LIBRARY
  );
  const totalLibraryPages = Math.ceil(userFileTracks.length / ITEMS_PER_PAGE_LIBRARY);

  const paginatedFavorites = favoriteTracks.slice(
      (currentPages[View.Favorites] - 1) * ITEMS_PER_PAGE_FAVORITES,
      currentPages[View.Favorites] * ITEMS_PER_PAGE_FAVORITES
  );
  const totalFavoritesPages = Math.ceil(favoriteTracks.length / ITEMS_PER_PAGE_FAVORITES);

  const paginatedRadio = stationTracks.slice(
      (currentPages[View.Radio] - 1) * ITEMS_PER_PAGE_RADIO,
      currentPages[View.Radio] * ITEMS_PER_PAGE_RADIO
  );
  const totalRadioPages = Math.ceil(stationTracks.length / ITEMS_PER_PAGE_RADIO);


  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 flex flex-col font-sans">
      <audio ref={audioRef} onEnded={handleEnded} crossOrigin="anonymous" />
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex flex-col mb-28">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-300 tracking-wider neon-text-glow-cyan">Radio Player</h1>
          <p className="text-gray-400 mt-2">Your personal music and radio hub.</p>
        </header>

        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl flex-grow flex flex-col border border-cyan-400/20 shadow-[0_0_25px_rgba(0,255,255,0.2)]">
          {view !== View.EQ && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-black/30 border border-gray-700 rounded-lg p-1">
                <button onClick={() => changeView(View.Library)} className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${view === View.Library ? 'bg-cyan-400 shadow-[0_0_10px_var(--neon-cyan)] font-on-neon' : 'text-gray-300 hover:bg-cyan-400/20 hover:text-cyan-300'}`}>
                  Library
                </button>
                <button onClick={() => changeView(View.Favorites)} className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${view === View.Favorites ? 'bg-pink-500 shadow-[0_0_10px_var(--neon-pink)] font-on-neon' : 'text-gray-300 hover:bg-pink-500/20 hover:text-pink-400'}`}>
                  Favorites
                </button>
                <button onClick={() => changeView(View.Radio)} className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${view === View.Radio ? 'bg-green-500 shadow-[0_0_10px_var(--neon-green)] font-on-neon' : 'text-gray-300 hover:bg-green-500/20 hover:text-green-400'}`}>
                  Radio
                </button>
              </div>
               <div className="flex items-center gap-4">
                <button onClick={() => changeView(View.EQ)} className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 text-white rounded-lg cursor-pointer hover:bg-purple-600 transition-all duration-300 shadow-[0_0_10px_var(--neon-purple)]">
                    <Icon name="settings" />
                    <span>EQ / Amp</span>
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-pink-600/80 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-all duration-300 shadow-[0_0_10px_var(--neon-pink)]">
                    <Icon name="upload" />
                    <span>Upload MP3s</span>
                    <input type="file" multiple accept=".mp3" onChange={handleFileUpload} className="hidden" />
                </label>
               </div>
            </div>
          )}

          <div ref={scrollRef} {...dragHandlers} className="flex-grow overflow-y-auto no-scrollbar pr-2">
            {view === View.Library && (
              <>
                <MusicLibrary 
                  tracks={paginatedLibrary}
                  favorites={favorites}
                  onSelectTrack={(index) => {
                      const track = paginatedLibrary[index];
                      const originalIndex = allTracks.findIndex(t => t.id === track.id);
                      if(originalIndex !== -1) playTrack(originalIndex);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                />
                <Pagination currentPage={currentPages[View.Library]} totalPages={totalLibraryPages} onPageChange={handlePageChange(View.Library)} />
              </>
            )}
            {view === View.Favorites && (
              <>
                <FavoritesList 
                  tracks={paginatedFavorites}
                  favorites={favorites}
                  onSelectTrack={(trackId) => {
                      const originalIndex = allTracks.findIndex(t => t.id === trackId);
                      if(originalIndex !== -1) playTrack(originalIndex);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                />
                <Pagination currentPage={currentPages[View.Favorites]} totalPages={totalFavoritesPages} onPageChange={handlePageChange(View.Favorites)} />
              </>
            )}
            {view === View.Radio && (
              <>
                <RadioStationList 
                    stations={paginatedRadio}
                    onSelectStation={(index) => {
                        const station = paginatedRadio[index];
                        const originalIndex = allTracks.findIndex(t => t.id === station.id);
                        if(originalIndex !== -1) playTrack(originalIndex);
                    }}
                    currentTrackId={currentTrack?.id}
                    isPlaying={isPlaying}
                />
                <Pagination currentPage={currentPages[View.Radio]} totalPages={totalRadioPages} onPageChange={handlePageChange(View.Radio)} />
              </>
            )}
             {view === View.EQ && (
              <EqSettings
                bands={eqBands}
                onEqChange={handleEqChange}
                isEqEnabled={isEqEnabled}
                onToggleEq={setIsEqEnabled}
                ampGain={ampGain}
                onAmpGainChange={handleAmpGainChange}
                isAmpEnabled={isAmpEnabled}
                onToggleAmp={setIsAmpEnabled}
                isDuckingEnabled={isDuckingEnabled}
                onToggleDucking={setIsDuckingEnabled}
                onBack={() => setView(previousView)}
                analyserNode={analyserNodeRef.current}
              />
            )}
          </div>
        </div>
      </main>

      <FloatingNav changeView={changeView} isVisible={view !== View.EQ} />

      {currentTrack && (
        <MusicPlayer 
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onEqAmpSettings={() => changeView(View.EQ)}
          isEqEnabled={isEqEnabled}
          onToggleEq={setIsEqEnabled}
          isAmpEnabled={isAmpEnabled}
          onToggleAmp={setIsAmpEnabled}
          analyserNode={analyserNodeRef.current}
        />
      )}
    </div>
  );
};

export default App;