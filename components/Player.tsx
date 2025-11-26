import React, { useEffect, useRef, useState } from 'react';
import { RadioStation } from '../types';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';

interface PlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onError: () => void;
}

const Player: React.FC<PlayerProps> = ({ station, isPlaying, onTogglePlay, onError }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (station) {
        audioRef.current.src = station.url_resolved;
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Playback prevented or failed:", error);
              onError(); // Signal parent to update state to paused
            });
          }
        }
      } else {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, [station, isPlaying, onError]);

  useEffect(() => {
    if (audioRef.current) {
        if(isPlaying) {
             audioRef.current.play().catch(() => onError());
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, onError]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!station) {
    return (
        <div className="h-24 flex items-center justify-center text-gray-500 text-sm border-t border-white/10 bg-black/40 backdrop-blur-md">
            Select a country to start listening
        </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl p-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        {/* Station Info */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className="w-12 h-12 rounded-lg bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10 relative">
             {station.favicon && !imgError ? (
                 <img 
                    src={station.favicon} 
                    alt="logo" 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)}
                />
             ) : (
                <Radio className="w-6 h-6 text-cyan-400" />
             )}
             {isPlaying && (
                 <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
             )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate text-lg">{station.name}</h3>
            <p className="text-cyan-400 text-xs uppercase tracking-wider truncate">
              {station.country} • {station.bitrate ? `${station.bitrate}kbps` : 'Live'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>

          <div className="hidden md:flex items-center gap-2 group">
            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        <audio 
            ref={audioRef} 
            crossOrigin="anonymous" 
            onEnded={() => onTogglePlay()} // Handle stream end
            onError={(e) => {
                console.error("Audio error", e);
                onError();
            }}
        />
      </div>
    </div>
  );
};

export default Player;
