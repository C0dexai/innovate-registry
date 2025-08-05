import React from 'react';
import Switch from './Switch';
import Icon from './Icon';
import SpectrumAnalyzer from './SpectrumAnalyzer';


interface EqSettingsProps {
    bands: number[];
    onEqChange: (bandIndex: number, gain: number) => void;
    isEqEnabled: boolean;
    onToggleEq: (enabled: boolean) => void;
    ampGain: number;
    onAmpGainChange: (gain: number) => void;
    isAmpEnabled: boolean;
    onToggleAmp: (enabled: boolean) => void;
    isDuckingEnabled: boolean;
    onToggleDucking: (enabled: boolean) => void;
    onBack: () => void;
    analyserNode: AnalyserNode | null;
}

const EQ_FREQUENCIES = ['60', '250', '1k', '4k', '16k'];
const AMP_GAIN_MIN = 0.5;
const AMP_GAIN_MAX = 1.5;

const EqSettings: React.FC<EqSettingsProps> = ({
    bands, onEqChange, isEqEnabled, onToggleEq,
    ampGain, onAmpGainChange, isAmpEnabled, onToggleAmp,
    isDuckingEnabled, onToggleDucking,
    onBack, analyserNode
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 neon-text-glow-cyan">Settings</h2>
        <button onClick={onBack} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">
          Back
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {/* EQ Section */}
            <div className="w-full md:w-2/3 p-6 bg-black/30 rounded-lg border border-cyan-400/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">5-Band Equalizer</h3>
                <Switch label="EQ Enabled" checked={isEqEnabled} onChange={onToggleEq} accentColor="cyan" />
            </div>
            <div className={`flex justify-around items-end h-48 transition-opacity duration-300 ${isEqEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {bands.map((gain, index) => (
                <div key={index} className="flex flex-col items-center">
                    <div className="relative h-40 flex items-center">
                        <input
                        type="range" min="-20" max="20" step="1" value={gain}
                        onChange={(e) => onEqChange(index, Number(e.target.value))}
                        className="appearance-none w-2 h-40 bg-gray-700 rounded-full cursor-pointer eq-slider"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                        disabled={!isEqEnabled}
                        />
                    </div>
                    <span className="text-sm text-gray-400 mt-3">{EQ_FREQUENCIES[index]}</span>
                </div>
                ))}
            </div>
            </div>
            
            {/* Amp Section */}
            <div className="w-full md:w-1/3 p-6 bg-black/30 rounded-lg border border-purple-500/20 shadow-[0_0_15px_rgba(198,40,249,0.2)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Amp Gain</h3>
                <Switch label="Amp Enabled" checked={isAmpEnabled} onChange={onToggleAmp} accentColor="purple" />
                </div>
                <div className={`flex flex-col items-center justify-center h-full transition-opacity duration-300 ${isAmpEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <Icon name="amp" className="w-16 h-16 text-purple-400 mb-4" style={{filter: `drop-shadow(0 0 10px var(--neon-purple))`}}/>
                <input
                    type="range" min={AMP_GAIN_MIN} max={AMP_GAIN_MAX} step="0.01" value={ampGain}
                    onChange={(e) => onAmpGainChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer amp-slider"
                    disabled={!isAmpEnabled}
                />
                <span className="text-lg font-mono mt-4 text-white">{(ampGain * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>

        {/* Smart Features Section */}
        <div className="w-full p-6 bg-black/30 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <h3 className="text-xl font-semibold mb-4">Smart Features</h3>
            <div className="flex items-center">
                <Switch label="Auto Volume Ducking" checked={isDuckingEnabled} onChange={onToggleDucking} accentColor="green" />
            </div>
            <p className="text-sm text-gray-400 mt-2 pl-16">
                Automatically lowers volume when voice-like frequencies are detected in the audio.
            </p>
        </div>

        {/* Spectrum Analyzer Section */}
        {analyserNode && (
            <div className="w-full p-6 bg-black/30 rounded-lg border border-gray-700/50 shadow-lg h-40 flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-400">Spectrum</h3>
                <div className="flex-grow">
                    <SpectrumAnalyzer analyserNode={analyserNode} />
                </div>
            </div>
        )}

      </div>
      
       <style>{`
        .eq-slider { background: #374151; border-radius: 9999px; width: 0.75rem; }
        .eq-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: var(--neon-cyan); cursor: pointer; border-radius: 50%; border: 3px solid #083344; box-shadow: var(--glow-cyan); }
        .eq-slider::-moz-range-thumb { width: 24px; height: 24px; background: var(--neon-cyan); cursor: pointer; border-radius: 50%; border: 3px solid #083344; box-shadow: var(--glow-cyan); }

        .amp-slider { -webkit-appearance: none; appearance: none; background: rgba(198,40,249,0.3); }
        .amp-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--neon-purple); border: 2px solid #4a044e; box-shadow: var(--glow-purple); border-radius: 50%; }
        .amp-slider::-moz-range-thumb { width: 20px; height: 20px; background: var(--neon-purple); border: 2px solid #4a044e; box-shadow: var(--glow-purple); border-radius: 50%; }
      `}</style>
    </div>
  );
};

export default EqSettings;