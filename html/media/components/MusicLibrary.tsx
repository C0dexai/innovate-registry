import React from 'react';
import { Track } from '../types';
import Icon from './Icon';

interface MusicLibraryProps {
  tracks: Track[];
  favorites: (number | string)[];
  currentTrackId?: number | string | null;
  isPlaying: boolean;
  onSelectTrack: (index: number) => void;
  onToggleFavorite: (trackId: number | string) => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ tracks, favorites, onSelectTrack, onToggleFavorite, currentTrackId, isPlaying }) => {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500/80">
        <Icon name="music-note" className="w-24 h-24 mb-4 text-cyan-400/30" style={{filter: `drop-shadow(0 0 10px var(--neon-cyan))`}} />
        <h2 className="text-2xl font-semibold text-gray-400">Your Library is Empty</h2>
        <p className="mt-2 text-gray-500">Upload some MP3 files to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-h-[440px]">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
            currentTrackId === track.id
              ? 'bg-cyan-400/10 border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
              : 'border-transparent hover:bg-gray-700/50'
          }`}
          onClick={() => onSelectTrack(index)}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-gray-800/80 rounded-md flex items-center justify-center mr-4">
            {currentTrackId === track.id && isPlaying ? (
                 <div className="w-4 h-4 flex justify-between items-end">
                    <span className="w-1 h-full bg-cyan-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                    <span style={{animationDelay: '0.2s'}} className="w-1 h-1/2 bg-cyan-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                    <span style={{animationDelay: '0.4s'}} className="w-1 h-full bg-cyan-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                </div>
            ) : (
              <Icon name="music-note" className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-grow">
            <p className={`font-semibold truncate ${currentTrackId === track.id ? 'text-cyan-300' : 'text-white'}`}>
              {track.name}
            </p>
            <p className="text-sm text-gray-400">{track.artist || 'MP3 Audio'}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track.id);
            }}
            className="p-2 rounded-full text-gray-400 hover:bg-pink-500/20 transition-colors duration-200 opacity-50 group-hover:opacity-100"
          >
            {favorites.includes(track.id) ? (
              <Icon name="heart-filled" className="w-5 h-5 text-pink-500" style={{filter: `drop-shadow(0 0 8px var(--neon-pink))`}} />
            ) : (
              <Icon name="heart-outline" className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default MusicLibrary;
