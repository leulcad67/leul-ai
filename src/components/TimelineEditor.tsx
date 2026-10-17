import React, { useRef, useState } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  Plus,
  Type,
  Volume2,
  Music,
  Video,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  VideoClip,
  TextOverlay,
  AudioTrack,
  calculateEffectiveClipDuration,
  calculateTotalTimelineDuration,
  formatTimeCode,
  formatSecondsOnly,
  MAX_PROJECT_DURATION_SECONDS,
} from '../utils/timeline';

interface TimelineEditorProps {
  clips: VideoClip[];
  onUpdateClips: (clips: VideoClip[]) => void;
  textOverlays: TextOverlay[];
  onUpdateTextOverlays: (overlays: TextOverlay[]) => void;
  audioTracks: AudioTrack[];
  onUpdateAudioTracks: (tracks: AudioTrack[]) => void;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  clips,
  onUpdateClips,
  textOverlays,
  onUpdateTextOverlays,
  audioTracks,
  onUpdateAudioTracks,
  currentTime,
  onSeek,
  selectedClipId,
  onSelectClip,
}) => {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(8); // pixels per second
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [newTextContent, setNewTextContent] = useState('');
  const [newTextStyle, setNewTextStyle] = useState<'bold' | 'neon' | 'subtitles' | 'cinematic'>('cinematic');
  const [newTextColor, setNewTextColor] = useState('#ffffff');
  const [newTextPosition, setNewTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');

  const totalDuration = calculateTotalTimelineDuration(clips);
  const timelineWidth = Math.max(800, MAX_PROJECT_DURATION_SECONDS * zoomLevel);

  // Handle timeline click to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const targetSeconds = Math.max(0, Math.min(MAX_PROJECT_DURATION_SECONDS, clickX / zoomLevel));
    onSeek(targetSeconds);
  };

  // Delete a clip
  const handleDeleteClip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateClips(clips.filter((c) => c.id !== id));
    if (selectedClipId === id) onSelectClip(null);
  };

  // Duplicate a clip
  const handleDuplicateClip = (clip: VideoClip, e: React.MouseEvent) => {
    e.stopPropagation();
    const newClip: VideoClip = {
      ...clip,
      id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: `${clip.title} (Copy)`,
    };
    onUpdateClips([...clips, newClip]);
  };

  // Split active clip at playhead
  const handleSplitClipAtPlayhead = () => {
    if (clips.length === 0) return;
    let accumulated = 0;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const effDur = calculateEffectiveClipDuration(clip);
      if (currentTime > accumulated && currentTime < accumulated + effDur) {
        const offset = (currentTime - accumulated) * clip.speed;
        const splitPoint = clip.trimStart + offset;

        const leftPart: VideoClip = {
          ...clip,
          trimEnd: splitPoint,
        };
        const rightPart: VideoClip = {
          ...clip,
          id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: `${clip.title} (Pt 2)`,
          trimStart: splitPoint,
        };

        const updated = [...clips];
        updated.splice(i, 1, leftPart, rightPart);
        onUpdateClips(updated);
        return;
      }
      accumulated += effDur;
    }
  };

  // Add text overlay
  const handleAddTextOverlay = () => {
    if (!newTextContent.trim()) return;
    const newOverlay: TextOverlay = {
      id: 'text_' + Date.now(),
      text: newTextContent.trim(),
      startTime: Math.floor(currentTime),
      duration: 4,
      position: newTextPosition,
      color: newTextColor,
      fontSize: 28,
      style: newTextStyle,
    };
    onUpdateTextOverlays([...textOverlays, newOverlay]);
    setNewTextContent('');
    setShowAddTextModal(false);
  };

  const handleDeleteText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTextOverlays(textOverlays.filter((t) => t.id !== id));
  };

  const handleDeleteAudio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateAudioTracks(audioTracks.filter((a) => a.id !== id));
  };

  // Time ruler ticks (every 5 seconds)
  const ticksCount = Math.floor(MAX_PROJECT_DURATION_SECONDS / 5) + 1;
  const ticks = Array.from({ length: ticksCount }, (_, i) => i * 5);

  return (
    <div className="h-64 bg-[#090b14] border-t border-[#1b2034] flex flex-col select-none relative z-10">
      {/* Timeline Controls Toolbar */}
      <div className="h-10 bg-[#0d101d] border-b border-[#1b2034] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Timeline</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
            {formatTimeCode(currentTime)} / 02:00.0
          </span>
          {totalDuration >= 115 && (
            <span className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/40 px-1.5 py-0.5 rounded animate-pulse">
              Max 2-minute reached
            </span>
          )}
        </div>

        {/* Quick Timeline Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSplitClipAtPlayhead}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#161b2e] hover:bg-[#1f2640] text-slate-200 text-xs font-medium border border-[#252c48] transition-colors"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Split Clip</span>
          </button>

          <button
            onClick={() => setShowAddTextModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#161b2e] hover:bg-[#1f2640] text-slate-200 text-xs font-medium border border-[#252c48] transition-colors"
            title="Add Subtitle or Title Overlay"
          >
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Text Overlay</span>
          </button>

          {/* Zoom Level */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-[#1f2640]">
            <span className="text-[10px] text-slate-400">Zoom:</span>
            <input
              type="range"
              min="4"
              max="16"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Multi-Track Scroll Area */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#070911] cursor-pointer"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ width: `${timelineWidth}px` }} className="relative min-h-full pb-4">
          {/* Time Ruler */}
          <div className="h-6 bg-[#0a0d18] border-b border-[#171c2f] relative flex items-center">
            {ticks.map((second) => (
              <div
                key={second}
                className="absolute top-0 bottom-0 flex flex-col justify-end text-[9px] font-mono text-slate-500 pl-1 border-l border-slate-800"
                style={{ left: `${second * zoomLevel}px` }}
              >
                <span>{formatSecondsOnly(second)}</span>
              </div>
            ))}
          </div>

          {/* Red Playhead Scrubber Line */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
            style={{ left: `${currentTime * zoomLevel}px` }}
          >
            <div className="w-3 h-3 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/50" />
            <div className="w-[1.5px] h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>

          {/* Track 1: Video Track (V1) */}
          <div className="h-20 border-b border-[#14192a] relative flex items-center px-1 bg-[#090c17]/60">
            <div className="absolute left-2 top-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 pointer-events-none">
              <Video className="w-3 h-3 text-cyan-400" />
              <span>Video Track (V1)</span>
            </div>

            {clips.length === 0 ? (
              <div className="w-full text-center text-xs text-slate-600 font-medium py-3">
                No video clips on timeline. Generate clips via prompt or upload below.
              </div>
            ) : (
              <div className="flex h-14 items-center">
                {clips.map((clip) => {
                  const clipWidth = calculateEffectiveClipDuration(clip) * zoomLevel;
                  const isSelected = selectedClipId === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      style={{ width: `${Math.max(40, clipWidth)}px` }}
                      className={`h-full relative rounded-md mr-1 border transition-all flex flex-col justify-between p-1.5 overflow-hidden group cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950 to-indigo-900 border-indigo-400 shadow-md shadow-indigo-500/20'
                          : 'bg-[#121626] border-[#222a45] hover:border-slate-500'
                      }`}
                    >
                      {/* Thumbnail background peek if present */}
                      {clip.thumbnailUrl && (
                        <div
                          className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none"
                          style={{ backgroundImage: `url(${clip.thumbnailUrl})` }}
                        />
                      )}

                      <div className="flex items-center justify-between z-10">
                        <span className="text-[11px] font-semibold text-slate-200 truncate pr-1">
                          {clip.title}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                          <button
                            onClick={(e) => handleDuplicateClip(clip, e)}
                            className="p-0.5 rounded hover:bg-white/20 text-slate-300"
                            title="Duplicate Clip"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClip(clip.id, e)}
                            className="p-0.5 rounded hover:bg-red-500/30 text-red-400"
                            title="Delete Clip"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 z-10">
                        <span>{calculateEffectiveClipDuration(clip)}s</span>
                        {clip.speed !== 1 && (
                          <span className="px-1 rounded bg-black/50 text-cyan-300">
                            {clip.speed}x
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Track 2: Text / Overlay Track (T1) */}
          <div className="h-12 border-b border-[#14192a] relative flex items-center px-1 bg-[#070a14]/60">
            <div className="absolute left-2 top-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 pointer-events-none">
              <Type className="w-3 h-3 text-indigo-400" />
              <span>Overlays (T1)</span>
            </div>

            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                onClick={(e) => e.stopPropagation()}
                style={{
                  left: `${overlay.startTime * zoomLevel}px`,
                  width: `${overlay.duration * zoomLevel}px`,
                }}
                className="absolute top-2.5 h-7 rounded bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 px-2 flex items-center justify-between text-[11px] font-medium group hover:bg-indigo-800/80 transition-all shadow-sm"
              >
                <span className="truncate pr-1 font-semibold">{overlay.text}</span>
                <button
                  onClick={(e) => handleDeleteText(overlay.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                  title="Remove text"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Track 3: Audio / Music Track (A1) */}
          <div className="h-12 border-b border-[#14192a] relative flex items-center px-1 bg-[#090c17]/60">
            <div className="absolute left-2 top-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 pointer-events-none">
              <Music className="w-3 h-3 text-rose-400" />
              <span>Audio &amp; Voice Track (A1)</span>
            </div>

            {audioTracks.map((track) => (
              <div
                key={track.id}
                onClick={(e) => e.stopPropagation()}
                style={{
                  left: `${track.startTime * zoomLevel}px`,
                  width: `${track.duration * zoomLevel}px`,
                }}
                className="absolute top-2.5 h-7 rounded bg-rose-950/60 border border-rose-500/40 text-rose-200 px-2 flex items-center justify-between text-[11px] font-medium group hover:bg-rose-900/80 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <Volume2 className="w-3 h-3 text-rose-400" />
                  <span className="truncate font-semibold">{track.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteAudio(track.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                  title="Remove audio"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Text Overlay Modal */}
      {showAddTextModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#101426] border border-[#232a44] rounded-xl p-5 w-full max-w-md shadow-2xl">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2 mb-3">
              <Type className="w-4 h-4 text-indigo-400" />
              <span>Add Subtitle / Text Overlay</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Overlay Text</label>
                <input
                  type="text"
                  placeholder="e.g. In a world transformed by AI..."
                  value={newTextContent}
                  onChange={(e) => setNewTextContent(e.target.value)}
                  className="w-full bg-[#181d33] border border-[#273050] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Style</label>
                  <select
                    value={newTextStyle}
                    onChange={(e) => setNewTextStyle(e.target.value as any)}
                    className="w-full bg-[#181d33] border border-[#273050] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="cinematic">Cinematic Wide</option>
                    <option value="neon">Cyberpunk Neon</option>
                    <option value="subtitles">Clean Subtitle</option>
                    <option value="bold">Bold Impact</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Position</label>
                  <select
                    value={newTextPosition}
                    onChange={(e) => setNewTextPosition(e.target.value as any)}
                    className="w-full bg-[#181d33] border border-[#273050] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="bottom">Bottom (Subtitles)</option>
                    <option value="center">Center (Title Card)</option>
                    <option value="top">Top (Header)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Color</label>
                <div className="flex items-center space-x-2">
                  {['#ffffff', '#38bdf8', '#f43f5e', '#facc15', '#a855f7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTextColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newTextColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-5 pt-3 border-t border-[#1e243c]">
              <button
                onClick={() => setShowAddTextModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTextOverlay}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                Insert Overlay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
