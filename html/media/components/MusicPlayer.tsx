import React, { useState } from 'react';
import { Track } from '../types';
import Icon from './Icon';
import SpectrumAnalyzer from './SpectrumAnalyzer';


interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onEqAmpSettings: () => void;
  isEqEnabled: boolean;
  onToggleEq: (enabled: boolean) => void;
  isAmpEnabled: boolean;
  onToggleAmp: (enabled: boolean) => void;
  analyserNode: AnalyserNode | null;
}

const formatTime = (time: number) => {
    if (!isFinite(time)) return '...'; 
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const MIN_DB = -60;
const MAX_DB = 0;
const dbToLinear = (db: number) => Math.pow(10, db / 20);
const linearToDb = (linear: number) => {
    if (linear === 0) return MIN_DB;
    const db = 20 * Math.log10(linear);
    return isFinite(db) ? db : MIN_DB;
};


const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, isPlaying, onPlayPause, onNext, onPrevious, 
  currentTime, duration, onSeek, 
  volume, isMuted, onVolumeChange, onMuteToggle,
  onEqAmpSettings, isEqEnabled, onToggleEq, isAmpEnabled, onToggleAmp,
  analyserNode
}) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    if (track.type !== 'stream' || !track.url) return;
    try {
      await navigator.clipboard.writeText(track.url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy stream URL: ', err);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dbValue = Number(e.target.value);
    const linearValue = dbToLinear(dbValue);
    onVolumeChange(linearValue);
  };


  return (
    <>
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/70 backdrop-blur-xl border-t-2 border-cyan-400/50 shadow-[0_-5px_20px_-5px_rgba(0,255,255,0.3)] z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        {track.type === 'file' && (
          <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
              <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={onSeek}
                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer neon-slider"
              />
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/4">
            <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-700">
                <Icon name={track.type === 'stream' ? 'radio' : 'music-note'} className="w-6 h-6 text-cyan-300" style={{filter: 'drop-shadow(0 0 5px var(--neon-cyan))'}}/>
            </div>
            <div>
              <p className="font-bold text-white truncate">{track.name}</p>
              <p className="text-sm text-gray-400">{track.artist || 'Now Playing'}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative h-14">
             {analyserNode && <SpectrumAnalyzer analyserNode={analyserNode} isMuted={isMuted} />}
             <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/10">
                <button onClick={onPrevious} className="text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400" disabled={track.type === 'stream'}>
                    <Icon name="previous" className="w-8 h-8" />
                </button>
                <button
                    onClick={onPlayPause}
                    className="text-cyan-300 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-110"
                    style={{filter: 'drop-shadow(var(--glow-cyan))'}}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Icon name="pause-circle" className="w-14 h-14" /> : <Icon name="play" className="w-14 h-14" />}
                </button>
                <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400" disabled={track.type === 'stream'}>
                    <Icon name="next" className="w-8 h-8" />
                </button>
             </div>
          </div>


          <div className="w-1/3 flex items-center justify-end gap-2 sm:gap-4">
             <button
              onClick={handleShare}
              disabled={track.type !== 'stream'}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed group relative"
              aria-label="Share Stream URL"
            >
              <Icon name="share" className="w-5 h-5" />
              <span className={`absolute -top-8 right-0 text-xs px-2 py-1 rounded-md transition-all duration-300 pointer-events-none ${shareStatus === 'copied' ? 'opacity-100 bg-green-500 text-white' : 'opacity-0'} ${track.type !== 'stream' ? 'group-hover:opacity-100 bg-gray-600' : 'group-hover:opacity-100 bg-gray-600'}`}>
                {shareStatus === 'copied' ? 'Copied!' : track.type !== 'stream' ? 'Local file' : 'Copy URL'}
              </span>
            </button>
            <button 
                onClick={() => onToggleEq(!isEqEnabled)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isEqEnabled ? 'bg-cyan-400 font-on-neon shadow-[var(--glow-cyan)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                <Icon name="eq" className="w-4 h-4"/>
                EQ
            </button>
            <button 
                onClick={() => onToggleAmp(!isAmpEnabled)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isAmpEnabled ? 'bg-purple-500 font-on-neon shadow-[var(--glow-purple)]' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                <Icon name="amp" className="w-4 h-4"/>
                AMP
            </button>
            <button onClick={onEqAmpSettings} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                <Icon name="settings" className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 w-40 md:w-48">
              <div onClick={onMuteToggle} className="w-8 h-8 cursor-pointer flex items-center justify-center">
                  {analyserNode && <SpectrumAnalyzer analyserNode={analyserNode} isMuted={isMuted || volume === 0} />}
              </div>
              <input
                type="range"
                min={MIN_DB}
                max={MAX_DB}
                step="1"
                value={isMuted ? MIN_DB : linearToDb(volume)}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer neon-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
    <style>{`
      .neon-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: rgba(0, 255, 255, 0.2);
        border-radius: 3px;
        outline: none;
        transition: background .2s;
      }
      .neon-slider:hover {
        background: rgba(0, 255, 255, 0.4);
      }
      .neon-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        background: var(--neon-cyan);
        cursor: pointer;
        border-radius: 50%;
        box-shadow: var(--glow-cyan);
        border: 2px solid #0e7490;
      }
      .neon-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: var(--neon-cyan);
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #0e7490;
        box-shadow: var(--glow-cyan);
      }
    `}</style>
    </>
  );
};

export default MusicPlayer;