import React, { useState } from 'react';
import {
  Music,
  Mic,
  Play,
  Pause,
  Download,
  Plus,
  Sparkles,
  Volume2,
  X,
  Radio,
  Sliders,
} from 'lucide-react';
import { AudioTrack } from '../utils/timeline';

interface AudioStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAudioTrack: (track: AudioTrack) => void;
  currentTime: number;
}

export const AudioStudioModal: React.FC<AudioStudioModalProps> = ({
  isOpen,
  onClose,
  onAddAudioTrack,
  currentTime,
}) => {
  const [activeTab, setActiveTab] = useState<'tts' | 'music'>('tts');

  // TTS State
  const [ttsScript, setTtsScript] = useState('In a world where intelligence and vision converge, the future belongs to those who dare to dream.');
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [ttsStyle, setTtsStyle] = useState('Cinematic trailer narrator, deep and authoritative');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('Epic cinematic orchestral swelling with brass and dramatic percussion');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState('Epic Cinematic Score');

  if (!isOpen) return null;

  // Generate TTS
  const handleGenerateTts = async () => {
    if (!ttsScript.trim()) return;
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsScript,
          voice: ttsVoice,
          style: ttsStyle,
        }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setTtsAudioUrl(data.audioUrl);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Generate Music
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        setMusicAudioUrl(data.audioUrl);
        setMusicTitle(data.title || 'AI Soundtrack');
      }
    } catch (err) {
      console.error('Music error:', err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleInsertTtsToTimeline = () => {
    if (!ttsAudioUrl) return;
    const newTrack: AudioTrack = {
      id: 'audio_' + Date.now(),
      title: `Voiceover: ${ttsVoice} (${ttsScript.slice(0, 16)}...)`,
      sourceUrl: ttsAudioUrl,
      type: 'tts',
      startTime: Math.floor(currentTime),
      duration: 8,
      volume: 1,
    };
    onAddAudioTrack(newTrack);
    onClose();
  };

  const handleInsertMusicToTimeline = () => {
    if (!musicAudioUrl) return;
    const newTrack: AudioTrack = {
      id: 'music_' + Date.now(),
      title: musicTitle,
      sourceUrl: musicAudioUrl,
      type: 'music',
      startTime: 0,
      duration: 30,
      volume: 0.7,
    };
    onAddAudioTrack(newTrack);
    onClose();
  };

  const musicPresets = [
    'Cinematic Orchestral Theme with strings and horns',
    'Cyberpunk Synthwave 2099 high-energy driving beat',
    'Emotional Ambient Piano with atmospheric pads',
    'Action Thriller Percussion and brass stabs',
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e1222] border border-[#232a44] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#1f263d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <Music className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Audio &amp; Voice Studio</h2>
              <p className="text-[11px] text-slate-400">
                gemini-3.8-flash-tts &bull; Lyria Music Generation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-[#14192b] p-0.5 rounded-lg border border-[#242b46]">
              <button
                onClick={() => setActiveTab('tts')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'tts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Voiceover (gemini-3.8-flash-tts)
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'music' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Music (Lyria)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181e33] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'tts' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Narration Script
                </label>
                <textarea
                  rows={3}
                  value={ttsScript}
                  onChange={(e) => setTtsScript(e.target.value)}
                  placeholder="Enter narration or dialogue..."
                  className="w-full bg-[#14192b] border border-[#242b46] rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Voice Persona
                  </label>
                  <select
                    value={ttsVoice}
                    onChange={(e) => setTtsVoice(e.target.value)}
                    className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Kore">Kore (Authoritative &amp; Rich)</option>
                    <option value="Puck">Puck (Energetic &amp; Crisp)</option>
                    <option value="Fenrir">Fenrir (Deep Cinematic)</option>
                    <option value="Zephyr">Zephyr (Warm &amp; Natural)</option>
                    <option value="Charon">Charon (Mysterious &amp; Dark)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Delivery Style
                  </label>
                  <input
                    type="text"
                    value={ttsStyle}
                    onChange={(e) => setTtsStyle(e.target.value)}
                    placeholder="e.g. Dramatic, whisper, energetic..."
                    className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateTts}
                disabled={isGeneratingTts || !ttsScript.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isGeneratingTts ? 'Synthesizing Audio with Gemini TTS...' : 'Generate Voiceover Audio'}</span>
              </button>

              {/* Player Preview */}
              {ttsAudioUrl && (
                <div className="bg-[#121628] border border-[#232b45] rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Voiceover Sample</span>
                      <span className="text-[10px] text-slate-400">{ttsVoice} &bull; {ttsStyle}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <audio controls src={ttsAudioUrl} className="h-8 w-44" />
                    <button
                      onClick={handleInsertTtsToTimeline}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Timeline</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Music Soundtrack Prompt
                </label>
                <textarea
                  rows={3}
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Describe your musical vision..."
                  className="w-full bg-[#14192b] border border-[#242b46] rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Genre Presets */}
              <div className="flex flex-wrap gap-1.5">
                {musicPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMusicPrompt(preset)}
                    className="text-[11px] bg-[#141829] hover:bg-[#1d2238] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-[#21273d] transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateMusic}
                disabled={isGeneratingMusic || !musicPrompt.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Music className="w-3.5 h-3.5" />
                <span>{isGeneratingMusic ? 'Composing Score with Lyria...' : 'Generate AI Music Track'}</span>
              </button>

              {/* Music Player Preview */}
              {musicAudioUrl && (
                <div className="bg-[#121628] border border-[#232b45] rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">{musicTitle}</span>
                      <span className="text-[10px] text-slate-400">Lyria 30s Soundtrack</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <audio controls src={musicAudioUrl} className="h-8 w-44" />
                    <button
                      onClick={handleInsertMusicToTimeline}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Soundtrack</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
