import React, { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  Film,
  Navigation,
} from 'lucide-react';
import { parseGroundingChunks, GroundingSource } from '../utils/grounding';

interface GroundingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (prompt: string) => void;
}

export const GroundingDrawer: React.FC<GroundingDrawerProps> = ({
  isOpen,
  onClose,
  onApplyPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps'>('search');
  const [searchQuery, setSearchQuery] = useState('Cyberpunk architecture viral trends 2026');
  const [mapsQuery, setMapsQuery] = useState('Shinjuku Neon Alley Tokyo viewpoints');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  if (!isOpen) return null;

  const handleSearchGrounding = async () => {
    if (!searchQuery.trim() || isLoading) return;
    setIsLoading(true);
    setResultText(null);
    setSources([]);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResultText(data.text);
      setSources(parseGroundingChunks(data.chunks));
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapsGrounding = async () => {
    if (!mapsQuery.trim() || isLoading) return;
    setIsLoading(true);
    setResultText(null);
    setSources([]);

    try {
      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery,
          latitude: 35.6762,
          longitude: 139.6503,
        }),
      });
      const data = await res.json();
      setResultText(data.text);
      setSources(parseGroundingChunks(data.chunks));
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0c0f1c] border-l border-[#1f263d] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 border-b border-[#1f263d] flex items-center justify-between bg-[#0e1222]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Google Grounding Intelligence</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Search Trends &amp; Location Scouting with Gemini 3.8 Flash</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d33] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-[#090b14] border-b border-[#1b2034] flex items-center space-x-2">
        <button
          onClick={() => {
            setActiveTab('search');
            setResultText(null);
            setSources([]);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'search'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-[#121524]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Search Trends (googleSearch)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('maps');
            setResultText(null);
            setSources([]);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'maps'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-[#121524]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Location Scout (googleMaps)</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 border-b border-[#1f263d] bg-[#0e1222]">
        {activeTab === 'search' ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchGrounding()}
              placeholder="Query live trends, news, or viral concepts..."
              className="flex-1 bg-[#14192b] border border-[#242b46] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSearchGrounding}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Ground'}
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={mapsQuery}
              onChange={(e) => setMapsQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMapsGrounding()}
              placeholder="e.g. Cinematic vistas in Iceland, Shibuya crossing..."
              className="flex-1 bg-[#14192b] border border-[#242b46] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleMapsGrounding}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Scouting...' : 'Scout'}
            </button>
          </div>
        )}
      </div>

      {/* Results Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-300 font-medium">
              {activeTab === 'search'
                ? 'Retrieving live Google Search data & generating scene briefs...'
                : 'Scouting real-world Google Maps coordinates & lighting hours...'}
            </p>
          </div>
        )}

        {resultText && (
          <div className="space-y-4">
            <div className="bg-[#121626] border border-[#202740] rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {resultText}
            </div>

            {/* Grounding Source Links (MANDATORY FOR MAPS & SEARCH) */}
            {sources.length > 0 && (
              <div className="bg-[#0e1220] border border-[#1f263d] rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Grounding Sources &amp; Google Links
                </span>
                <div className="space-y-1.5">
                  {sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-[#14192b] hover:bg-[#1c223c] border border-[#232a44] text-xs text-cyan-300 hover:text-cyan-200 transition-colors group"
                    >
                      <span className="truncate pr-2">{src.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onApplyPrompt(resultText.slice(0, 160));
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center space-x-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Use Grounded Finding in Video Generator</span>
            </button>
          </div>
        )}

        {!resultText && !isLoading && (
          <div className="text-center py-16 text-slate-500 text-xs">
            Enter a topic or location to get real-time Google Grounding insights for your film.
          </div>
        )}
      </div>
    </div>
  );
};
