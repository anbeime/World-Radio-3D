import React, { useState, useEffect, useCallback } from 'react';
import Globe3D from './components/Globe3D';
import Player from './components/Player';
import { fetchStationsByCountry } from './services/radioService';
import { fetchCulturalInsight } from './services/geminiService';
import { RadioStation } from './types';
import { Radio, MapPin, Music, Loader2, Info, Sparkles, Play } from 'lucide-react';

const App: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  
  // Cultural Info State
  const [culturalInsight, setCulturalInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Handle Country Selection
  const handleCountrySelect = useCallback(async (code: string, name: string) => {
    if (code === selectedCountryCode) return;
    
    setSelectedCountryCode(code);
    setSelectedCountryName(name);
    setIsLoadingStations(true);
    setStations([]);
    setIsLoadingInsight(true);
    setCulturalInsight(null);

    // Fetch Stations
    try {
        const fetchedStations = await fetchStationsByCountry(code);
        setStations(fetchedStations);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingStations(false);
    }

    // Fetch Insight
    try {
        const insight = await fetchCulturalInsight(name);
        setCulturalInsight(insight);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingInsight(false);
    }
  }, [selectedCountryCode]);

  const handleStationSelect = (station: RadioStation) => {
    if (currentStation?.stationuuid === station.stationuuid) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  const handlePlayToggle = () => {
    if (currentStation) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Header / Brand */}
      <div className="absolute top-0 left-0 p-6 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center backdrop-blur-md">
                <Radio className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                WORLD RADIO
                </h1>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Live Global Tuner</p>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <Globe3D 
          onCountrySelect={handleCountrySelect} 
          selectedCountryCode={selectedCountryCode}
        />

        {/* Floating Sidebar (Right Side) */}
        <div className={`
          absolute top-0 right-0 h-full w-full sm:w-96 
          bg-gradient-to-l from-black via-black/90 to-transparent 
          transform transition-transform duration-500 ease-in-out z-20
          pointer-events-none flex flex-col justify-end sm:justify-start
          ${selectedCountryCode ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="pointer-events-auto h-[60%] sm:h-full w-full sm:w-80 ml-auto bg-black/60 backdrop-blur-xl border-l border-white/10 flex flex-col pt-20 pb-24 sm:pb-32 px-6 overflow-hidden">
            
            {/* Country Header */}
            {selectedCountryName && (
              <div className="mb-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <MapPin size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">Now Exploring</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 leading-none">{selectedCountryName}</h2>
                
                {/* AI Insight Box */}
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 mb-6">
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                    </div>
                    {isLoadingInsight ? (
                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Asking Gemini about the vibe...</span>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-200 leading-relaxed italic">
                            "{culturalInsight}"
                        </p>
                    )}
                </div>
              </div>
            )}

            {/* Station List */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-black/80 backdrop-blur-xl py-2 z-10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Music size={14} /> 
                    Top Stations
                </h3>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">{stations.length}</span>
              </div>

              {isLoadingStations ? (
                 <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    <span className="text-sm">Scanning frequencies...</span>
                 </div>
              ) : stations.length === 0 ? (
                 <div className="text-center py-8 text-gray-500 text-sm">
                    No active streams found for this region. <br/> Try spinning the globe!
                 </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {stations.map((station) => {
                    const isActive = currentStation?.stationuuid === station.stationuuid;
                    const isPlayingCurrent = isActive && isPlaying;
                    
                    return (
                      <button
                        key={station.stationuuid}
                        onClick={() => handleStationSelect(station)}
                        className={`
                          w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 group
                          ${isActive 
                            ? 'bg-cyan-500/20 border border-cyan-500/50' 
                            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                          }
                        `}
                      >
                        <div className={`
                            w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-colors
                            ${isActive ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}
                        `}>
                            {isPlayingCurrent ? (
                                <div className="flex gap-[2px] h-3 items-end">
                                    <div className="w-1 bg-black animate-[bounce_0.6s_infinite] h-2"></div>
                                    <div className="w-1 bg-black animate-[bounce_0.8s_infinite] h-3"></div>
                                    <div className="w-1 bg-black animate-[bounce_0.5s_infinite] h-1"></div>
                                </div>
                            ) : (
                                <Play size={12} fill="currentColor" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className={`font-medium truncate text-sm ${isActive ? 'text-cyan-300' : 'text-gray-200'}`}>
                                {station.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                {station.tags && <span className="truncate max-w-[120px]">{station.tags}</span>}
                            </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Bar */}
      <Player 
        station={currentStation} 
        isPlaying={isPlaying} 
        onTogglePlay={handlePlayToggle}
        onError={() => setIsPlaying(false)}
      />
      
      {/* Help / Instructions Overlay (Initial only) */}
      {!selectedCountryCode && (
         <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center text-center pointer-events-none animate-pulse">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm mb-2">
                <MapPin className="text-white" />
            </div>
            <p className="text-sm text-gray-300 font-light tracking-wide bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                Click a country to tune in
            </p>
         </div>
      )}
    </div>
  );
};

export default App;