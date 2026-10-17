import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Sliders,
  Sparkles,
  Camera,
  FastForward,
  Radio,
  Eye,
  Film,
  Crosshair,
} from 'lucide-react';
import { VideoClip, TextOverlay, formatTimeCode } from '../utils/timeline';

interface VideoPlayerProps {
  activeClip: VideoClip | null;
  activeLocalTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  currentTime: number;
  totalDuration: number;
  aspectRatio: '16:9' | '9:16';
  colorGrade: string;
  onChangeColorGrade: (filter: string) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  textOverlays: TextOverlay[];
  statusToast?: string | null;
}

export const COLOR_GRADE_PRESETS = [
  { id: 'normal', name: 'Original', class: 'filter-normal' },
  { id: 'teal-orange', name: 'Teal & Orange (Blockbuster)', class: 'filter-teal-orange' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon 2099', class: 'filter-cyberpunk' },
  { id: 'golden-hour', name: 'Golden Hour Sunset', class: 'filter-golden-hour' },
  { id: 'noir', name: 'Dark Noir 35mm B&W', class: 'filter-noir' },
  { id: 'sepia', name: '1970s Vintage Super 8', class: 'filter-sepia' },
  { id: 'vibrant', name: 'Pixar Hyper-Vibrant', class: 'filter-vibrant' },
  { id: 'matrix', name: 'Matrix Emerald Sci-Fi', class: 'filter-matrix' },
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  activeClip,
  activeLocalTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  currentTime,
  totalDuration,
  aspectRatio,
  colorGrade,
  onChangeColorGrade,
  playbackSpeed,
  onChangePlaybackSpeed,
  textOverlays,
  statusToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [showFilters, setShowFilters] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [imageObject, setImageObject] = useState<HTMLImageElement | null>(null);

  // Preload image for canvas engine fallback
  useEffect(() => {
    if (activeClip?.thumbnailUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeClip.thumbnailUrl;
      img.onload = () => {
        setImageObject(img);
      };
    }
  }, [activeClip?.thumbnailUrl]);

  // Video element sync
  useEffect(() => {
    if (videoRef.current && activeClip) {
      if (Math.abs(videoRef.current.currentTime - activeLocalTime) > 0.4) {
        videoRef.current.currentTime = activeLocalTime;
      }
      videoRef.current.playbackRate = (activeClip.speed || 1) * playbackSpeed;
    }
  }, [activeLocalTime, activeClip, playbackSpeed]);

  // Play/pause sync
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // If video element autoplay fails, engage procedural canvas renderer
          setUseCanvasFallback(true);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Procedural Canvas Animation Loop (simulates cinematic camera motion, particles, lens flare)
  useEffect(() => {
    if (!canvasRef.current || !imageObject) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02 * playbackSpeed;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Camera motion simulation (subtle slow push-in & drift)
      const zoom = 1 + (Math.sin(t * 0.5) * 0.08);
      const panX = Math.cos(t * 0.3) * 12;
      const panY = Math.sin(t * 0.4) * 8;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2 + panX, -h / 2 + panY);

      // Draw background image
      ctx.drawImage(imageObject, -20, -20, w + 40, h + 40);
      ctx.restore();

      // Atmospheric floating particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(t + i * 2) * 0.5 + 0.5) * w;
        const py = ((t * 20 + i * 45) % h);
        const radius = (Math.sin(t * 2 + i) * 1.2 + 1.8);
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Volumetric lighting beam
      const grad = ctx.createRadialGradient(w * 0.7, h * 0.2, 10, w * 0.7, h * 0.2, w * 0.8);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, imageObject, playbackSpeed]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const captureSnapshot = () => {
    try {
      const source = (canvasRef.current && useCanvasFallback) ? canvasRef.current : videoRef.current;
      if (!source) return;

      const canvas = document.createElement('canvas');
      canvas.width = (source as any).videoWidth || 1280;
      canvas.height = (source as any).videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(source as any, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `leul-frame-${Math.floor(currentTime)}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.warn('Snapshot capture failed:', e);
    }
  };

  const activeOverlays = textOverlays.filter(
    (t) => currentTime >= t.startTime && currentTime <= t.startTime + t.duration
  );

  const selectedFilterClass =
    COLOR_GRADE_PRESETS.find((f) => f.id === colorGrade)?.class || 'filter-normal';

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-[#05070d] flex flex-col items-center justify-center p-3 select-none overflow-hidden"
    >
      {/* Toast Notification Banner */}
      {statusToast && (
        <div className="absolute top-4 z-40 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl shadow-cyan-500/20 border border-cyan-400/30 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Director Cinema Viewport */}
      <div
        className={`relative max-w-full max-h-[calc(100vh-340px)] transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-[#212842] bg-black flex items-center justify-center group ${
          aspectRatio === '9:16'
            ? 'aspect-[9/16] h-[480px] w-auto max-w-[270px] ring-1 ring-cyan-500/20'
            : 'aspect-[16/9] w-[820px] max-w-full h-auto ring-1 ring-indigo-500/20'
        }`}
      >
        {activeClip ? (
          <>
            {/* Base Image Layer (guarantees zero black screen even if video codecs fail) */}
            <img
              src={activeClip.thumbnailUrl}
              alt={activeClip.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all ${selectedFilterClass} ${
                isPlaying ? 'scale-105 duration-1000' : 'scale-100'
              }`}
            />

            {/* HTML5 Video Layer */}
            <video
              ref={videoRef}
              src={activeClip.sourceUrl}
              poster={activeClip.thumbnailUrl}
              preload="auto"
              className={`relative z-10 w-full h-full object-cover transition-all ${selectedFilterClass} ${
                isPlaying ? 'opacity-100' : 'opacity-85'
              }`}
              playsInline
              loop={false}
              muted={isMuted}
            />

            {/* Scanline & Cinematic Grain Overlay */}
            <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40" />

            {/* Futuristic Director HUD Elements */}
            <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
              {/* Top HUD Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    <span className="font-bold tracking-wider">CAM 01 &bull; REC</span>
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-black/70 text-slate-300 border border-slate-800 backdrop-blur-md">
                    24.00 FPS &bull; 4K
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 pointer-events-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/75 hover:bg-black/95 text-cyan-300 border border-cyan-500/40 backdrop-blur-md flex items-center space-x-1 transition-all"
                    title="Real-Time Color Grading"
                  >
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    <span>LUT: {COLOR_GRADE_PRESETS.find((p) => p.id === colorGrade)?.name.split(' ')[0]}</span>
                  </button>
                  <button
                    onClick={captureSnapshot}
                    className="p-1.5 rounded-md bg-black/75 hover:bg-black/95 text-slate-200 border border-slate-700 backdrop-blur-md transition-all"
                    title="Snapshot Current Frame (PNG)"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-300" />
                  </button>
                </div>
              </div>

              {/* Center Crosshair Guidelines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <Crosshair className="w-12 h-12 text-cyan-400" strokeWidth={1} />
              </div>

              {/* Bottom HUD Bar */}
              <div className="flex items-end justify-between">
                <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-300">
                  <span className="text-cyan-400 font-bold">{formatTimeCode(currentTime)}</span>
                  <span className="text-slate-500 ml-1.5">&bull; {activeClip.title}</span>
                </div>

                {/* Animated Audio Spectrum Bars */}
                {isPlaying && (
                  <div className="flex items-end space-x-1 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-rose-500/30">
                    <div className="w-1 bg-cyan-400 rounded-full wave-bar-1" />
                    <div className="w-1 bg-indigo-400 rounded-full wave-bar-2" />
                    <div className="w-1 bg-rose-400 rounded-full wave-bar-3" />
                    <div className="w-1 bg-amber-400 rounded-full wave-bar-4" />
                    <div className="w-1 bg-emerald-400 rounded-full wave-bar-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Active Subtitle Overlays */}
            {activeOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`absolute left-0 right-0 px-6 text-center pointer-events-none transition-all ${
                  overlay.position === 'top'
                    ? 'top-10'
                    : overlay.position === 'bottom'
                    ? 'bottom-10'
                    : 'top-1/2 -translate-y-1/2'
                }`}
              >
                <span
                  style={{
                    color: overlay.color || '#ffffff',
                    fontSize: `${overlay.fontSize || 24}px`,
                  }}
                  className={`inline-block px-3 py-1.5 rounded-lg max-w-[85%] font-extrabold tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] ${
                    overlay.style === 'neon'
                      ? 'drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] border border-cyan-400/40 bg-black/40 backdrop-blur-xs'
                      : overlay.style === 'subtitles'
                      ? 'bg-black/75 backdrop-blur-sm font-semibold'
                      : 'tracking-widest uppercase bg-black/30 backdrop-blur-xs'
                  }`}
                >
                  {overlay.text}
                </span>
              </div>
            ))}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">Director Viewport Standby</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate your first Veo 3.1 video clip below or choose a template to begin producing.
            </p>
          </div>
        )}

        {/* Color Grading Drawer */}
        {showFilters && (
          <div className="absolute inset-x-3 top-14 p-3.5 bg-[#0b0e1b]/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl z-20">
            <div className="flex items-center justify-between pb-2 border-b border-[#21273d] mb-2.5">
              <span className="text-xs font-semibold text-cyan-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Cinema Color LUTs</span>
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_GRADE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onChangeColorGrade(preset.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                    colorGrade === preset.id
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg ring-1 ring-cyan-400'
                      : 'bg-[#14192b] text-slate-300 hover:bg-[#1c223c]'
                  }`}
                >
                  <div className="truncate">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Transport Bar */}
      <div className="w-full max-w-2xl mt-3 bg-[#0c101d]/90 backdrop-blur-md border border-[#1e253e] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xl">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#181d30] transition-colors"
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <div className="text-xs font-mono text-slate-300 pl-1">
            <span className="text-cyan-300 font-bold">{formatTimeCode(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimeCode(totalDuration)}</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1.5 bg-[#121626] px-2 py-1 rounded-lg border border-[#20273f]">
          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>Speed:</span>
          </span>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangePlaybackSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                playbackSpeed === s ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Volume & Fullscreen */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title="Master Player Volume"
          />
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
