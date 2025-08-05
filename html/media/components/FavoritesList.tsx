import React from 'react';
import { Track } from '../types';
import Icon from './Icon';

interface FavoritesListProps {
  tracks: Track[];
  favorites: (number | string)[];
  currentTrackId?: number | string | null;
  isPlaying: boolean;
  onSelectTrack: (trackId: number | string) => void;
  onToggleFavorite: (trackId: number | string) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ tracks, favorites, onSelectTrack, onToggleFavorite, currentTrackId, isPlaying }) => {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500/80">
        <Icon name="heart-outline" className="w-24 h-24 mb-4 text-pink-500/30" style={{filter: `drop-shadow(0 0 10px var(--neon-pink))`}} />
        <h2 className="text-2xl font-semibold text-gray-400">No Favorites Yet</h2>
        <p className="mt-2 text-gray-500">Click the heart icon on a song to add it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-h-[352px]">
      {tracks.map((track) => (
        <div
          key={track.id}
          className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
             currentTrackId === track.id
              ? 'bg-pink-400/10 border-pink-400/50 shadow-[0_0_10px_rgba(255,16,240,0.4)]'
              : 'border-transparent hover:bg-gray-700/50'
          }`}
          onClick={() => onSelectTrack(track.id)}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-gray-800/80 rounded-md flex items-center justify-center mr-4">
           {currentTrackId === track.id && isPlaying ? (
                 <div className="w-4 h-4 flex justify-between items-end">
                    <span className="w-1 h-full bg-pink-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                    <span style={{animationDelay: '0.2s'}} className="w-1 h-1/2 bg-pink-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                    <span style={{animationDelay: '0.4s'}} className="w-1 h-full bg-pink-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                </div>
            ) : (
              <Icon name={track.type === 'stream' ? 'radio' : 'music-note'} className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-grow">
            <p className={`font-semibold truncate ${currentTrackId === track.id ? 'text-pink-400' : 'text-white'}`}>
              {track.name}
            </p>
            <p className="text-sm text-gray-400">{track.artist || (track.type === 'file' ? 'MP3 Audio' : 'Radio Stream')}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track.id);
            }}
            className="p-2 rounded-full text-gray-400 hover:bg-pink-500/20 transition-colors duration-200"
          >
            {favorites.includes(track.id) ? (
                 <Icon name="heart-filled" className="w-5 h-5 text-pink-500" style={{filter: `drop-shadow(0 0 8px var(--neon-pink))`}} />
            ) : (
                 <Icon name="heart-outline" className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
