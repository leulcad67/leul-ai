import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Camera,
  Sun,
  Aperture,
  Compass,
  Layers,
  Wand2,
  Tv,
  Smartphone,
  Check,
} from 'lucide-react';
import { compileVideoPrompt } from '../utils/promptBuilder';
import { VideoClip } from '../utils/timeline';

interface TextToVideoPanelProps {
  aspectRatio: '16:9' | '9:16';
  onAddClip: (clip: VideoClip) => void;
  selectedTemplateId: string;
}

const CAMERA_MOTIONS = [
  'Auto',
  'Drone Glide',
  'Orbit 360',
  'Slow Push-in',
  'Pan Left to Right',
  'Crane Up',
  'FPV Dive',
  'Handheld Shake',
];

const LENS_OPTIONS = [
  'Standard',
  '35mm anamorphic',
  '50mm prime',
  '85mm portrait telephoto',
  '16mm ultra-wide',
  'Macro',
];

const LIGHTING_OPTIONS = [
  'Natural',
  'Volumetric Rim & Fog',
  'Neon Street Glow',
  'Golden Hour Sunset',
  'Dramatic Chiaroscuro',
  'Studio 3-Point Light',
];

export const TextToVideoPanel: React.FC<TextToVideoPanelProps> = ({
  aspectRatio,
  onAddClip,
  selectedTemplateId,
}) => {
  const samplePrompts = [
    'A futuristic cybernetic tiger prowling neon Tokyo streets in rain',
    'A majestic wooden pirate ship sailing through bioluminescent ocean waves',
    'High altitude drone flight weaving between snow-capped alpine peaks at sunrise',
    'Vintage 1970s formula race car drifting around tight hairpin turn',
  ];

  const [prompt, setPrompt] = useState(samplePrompts[0]);
  const [cameraMotion, setCameraMotion] = useState('Drone Glide');
  const [lens, setLens] = useState('35mm anamorphic');
  const [lighting, setLighting] = useState('Volumetric Rim & Fog');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [duration, setDuration] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');

  const handleGenerate = async () => {
    let activePrompt = prompt.trim();
    if (!activePrompt) {
      activePrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      setPrompt(activePrompt);
    }

    setIsGenerating(true);
    setGenerationStage('Directing cinematic lighting & scene composition...');

    const compiledPrompt = compileVideoPrompt({
      userPrompt: activePrompt,
      templateId: selectedTemplateId,
      cameraMotion,
      lens,
      lighting,
    });

    try {
      // Step 1: Initiate generation on server
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: compiledPrompt,
          aspectRatio,
          resolution,
          model: 'veo-3.1-fast-generate-preview',
        }),
      });
      const startData = await startRes.json();

      setGenerationStage('Rendering neural video frames with Veo 3.1...');

      // Step 2: Poll operation status
      const opId = startData.opId;
      const operationName = startData.operationName;

      let isDone = false;
      let finalVideoUrl = '';
      let finalThumbnailUrl = '';
      let attempts = 0;

      while (!isDone && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 1200));

        if (attempts === 2) setGenerationStage('Synthesizing temporal coherence & physics...');
        if (attempts === 3) setGenerationStage('Polishing volumetric reflections & color grade...');

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opId, operationName }),
        });
        const pollData = await pollRes.json();

        if (pollData.done && pollData.videoUrl) {
          isDone = true;
          finalVideoUrl = pollData.videoUrl;
          finalThumbnailUrl = pollData.thumbnailUrl;
          break;
        }
      }

      if (finalVideoUrl) {
        const fallbackThumb = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
        const newClip: VideoClip = {
          id: 'clip_' + Date.now(),
          title: prompt.slice(0, 32) || 'Cinematic Veo Scene',
          sourceUrl: finalVideoUrl,
          thumbnailUrl: finalThumbnailUrl || fallbackThumb,
          duration: duration,
          trimStart: 0,
          trimEnd: duration,
          speed: 1,
          type: 'video',
        };
        onAddClip(newClip);
      }
    } catch (err) {
      console.error('Error generating video:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Prompt Area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Veo 3.1 Text-to-Video Prompt</span>
          </label>
          <span className="text-[10px] text-slate-400">veo-3.1-fast-generate-preview</span>
        </div>
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene in rich detail (e.g. A futuristic hovering train racing over misty mountains, cinematic golden hour light...)"
            className="w-full bg-[#131728] border border-[#232a42] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(s)}
              className="text-[11px] bg-[#141828] hover:bg-[#1d2238] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-[#21273d] transition-colors truncate max-w-[280px]"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Camera, Lens & Lighting Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Camera Motion */}
        <div className="bg-[#121626] border border-[#1f263e] rounded-xl p-2.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 mb-1.5">
            <Camera className="w-3 h-3 text-indigo-400" />
            <span>Camera Motion</span>
          </label>
          <select
            value={cameraMotion}
            onChange={(e) => setCameraMotion(e.target.value)}
            className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
          >
            {CAMERA_MOTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Lens Choice */}
        <div className="bg-[#121626] border border-[#1f263e] rounded-xl p-2.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 mb-1.5">
            <Aperture className="w-3 h-3 text-cyan-400" />
            <span>Optics &amp; Lens</span>
          </label>
          <select
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
          >
            {LENS_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Lighting */}
        <div className="bg-[#121626] border border-[#1f263e] rounded-xl p-2.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1 mb-1.5">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Cinematic Lighting</span>
          </label>
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
          >
            {LIGHTING_OPTIONS.map((li) => (
              <option key={li} value={li}>
                {li}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aspect Ratio, Duration & Generate Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1b2034]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Aspect Ratio:</span>
            <span className="font-semibold text-cyan-400 uppercase">{aspectRatio}</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Duration:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="bg-[#151928] border border-[#262f4e] rounded px-1.5 py-0.5 text-xs text-slate-200 outline-none"
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Resolution:</span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="bg-[#151928] border border-[#262f4e] rounded px-1.5 py-0.5 text-xs text-slate-200 outline-none"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p FHD</option>
            </select>
          </div>
        </div>

        {/* Generate Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ring-1 ring-cyan-400/40 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              <span>Generate Video Scene</span>
            </>
          )}
        </button>
      </div>

      {/* Progress status feedback */}
      {isGenerating && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shrink-0" />
          <div className="text-xs text-slate-300">
            <span className="font-medium text-cyan-300 block">{generationStage}</span>
            <span className="text-[11px] text-slate-400">
              Generating with Veo 3.1 &bull; Will be appended automatically to your timeline.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
