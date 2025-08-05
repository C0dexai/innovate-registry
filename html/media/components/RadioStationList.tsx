import React from 'react';
import { Track } from '../types';
import Icon from './Icon';

interface RadioStationListProps {
  stations: Track[];
  onSelectStation: (index: number) => void;
  currentTrackId?: number | string | null;
  isPlaying: boolean;
}

const RadioStationList: React.FC<RadioStationListProps> = ({ stations, onSelectStation, currentTrackId, isPlaying }) => {
  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500/80">
        <Icon name="radio" className="w-24 h-24 mb-4 text-green-400/30" style={{filter: `drop-shadow(0 0 10px var(--neon-green))`}}/>
        <h2 className="text-2xl font-semibold text-gray-400">No Radio Stations Loaded</h2>
        <p className="mt-2 text-gray-500">Check back later for more stations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-h-[352px]">
      {stations.map((station, index) => (
        <div
          key={station.id}
          className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
            currentTrackId === station.id
              ? 'bg-green-400/10 border-green-400/50 shadow-[0_0_10px_rgba(57,255,20,0.4)]'
              : 'border-transparent hover:bg-gray-700/50'
          }`}
          onClick={() => onSelectStation(index)}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-gray-800/80 rounded-md flex items-center justify-center mr-4">
            {currentTrackId === station.id && isPlaying ? (
              <div className="w-4 h-4 flex justify-between items-end">
                  <span className="w-1 h-full bg-green-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                  <span style={{animationDelay: '0.2s'}} className="w-1 h-1/2 bg-green-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
                  <span style={{animationDelay: '0.4s'}} className="w-1 h-full bg-green-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"/>
              </div>
            ) : (
              <Icon name="radio" className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-grow">
            <p className={`font-semibold truncate ${currentTrackId === station.id ? 'text-green-400' : 'text-white'}`}>
              {station.name}
            </p>
            <p className="text-sm text-gray-400">{station.artist || 'Radio Stream'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RadioStationList;
