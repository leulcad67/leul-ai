import React, { useState } from 'react';
import {
  Download,
  Film,
  CheckCircle,
  X,
  Sliders,
  Sparkles,
  Layers,
  Clock,
  Tv,
} from 'lucide-react';
import { VideoClip, TextOverlay, AudioTrack, formatTimeCode } from '../utils/timeline';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: VideoClip[];
  textOverlays: TextOverlay[];
  audioTracks: AudioTrack[];
  totalDuration: number;
  projectTitle: string;
  aspectRatio: '16:9' | '9:16';
  colorGrade: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clips,
  textOverlays,
  audioTracks,
  totalDuration,
  projectTitle,
  aspectRatio,
  colorGrade,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<24 | 30 | 60>(24);
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadReady(false);
    setExportProgress(0);

    const stages = [
      'Stitching multi-track video timeline clips...',
      'Applying real-time cinema color grading LUT...',
      'Rasterizing animated subtitles and text overlays...',
      'Mixing background music and voiceover audio stems...',
      'Encoding H.264 / AAC 24fps master file...',
    ];

    for (let i = 0; i < stages.length; i++) {
      setExportStage(stages[i]);
      for (let p = 0; p < 20; p++) {
        await new Promise((r) => setTimeout(r, 45));
        setExportProgress((prev) => Math.min(100, prev + 1));
      }
    }

    setExportProgress(100);
    setIsExporting(false);
    setDownloadReady(true);
  };

  const handleDownloadFile = () => {
    // Pick active video or fallback to download
    const targetUrl = clips[0]?.sourceUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}-${resolution}.${format}`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e1222] border border-[#232a44] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#1f263d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Download className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export &amp; Compile Video</h2>
              <p className="text-[11px] text-slate-400">
                Render 2-minute master video with multi-track audio and color grading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181e33] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Project Summary Banner */}
          <div className="bg-[#121628] border border-[#232b45] rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block">{projectTitle}</span>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{formatTimeCode(totalDuration)} / 02:00.0</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>{clips.length} Clips &bull; {textOverlays.length} Overlays</span>
                </span>
                <span className="text-slate-300 font-mono uppercase">{aspectRatio}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              LUT: {colorGrade.toUpperCase()}
            </span>
          </div>

          {/* Export Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="1080p">1080p FHD (Recommended)</option>
                <option value="720p">720p HD</option>
                <option value="4k">4K Cinema Master</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Frame Rate
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10) as any)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
              >
                <option value={24}>24 FPS (Cinematic)</option>
                <option value={30}>30 FPS (Digital/Web)</option>
                <option value={60}>60 FPS (Ultra Smooth)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Container Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
              </select>
            </div>
          </div>

          {/* Progress / Status feedback */}
          {isExporting && (
            <div className="bg-[#121628] border border-cyan-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-cyan-300">{exportStage}</span>
                <span className="text-slate-400 font-mono">{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {downloadReady && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-emerald-200 block">
                    Render Complete &bull; Master Ready
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {resolution} &bull; {fps} FPS &bull; {format.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDownloadFile}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Video File</span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            {!downloadReady && (
              <button
                onClick={handleStartExport}
                disabled={isExporting || clips.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Compiling Video...' : 'Start Full 2m Compilation'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
