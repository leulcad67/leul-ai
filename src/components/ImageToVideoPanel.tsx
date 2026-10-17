import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Play,
  Sliders,
  Eye,
  Check,
  RefreshCw,
  Video,
} from 'lucide-react';
import { VideoClip } from '../utils/timeline';

interface ImageToVideoPanelProps {
  aspectRatio: '16:9' | '9:16';
  onAddClip: (clip: VideoClip) => void;
}

const SAMPLE_STARTER_PHOTOS = [
  {
    name: 'Cyberpunk Geisha',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    prompt: 'Slow gentle head turn, neon rain ripples in reflections, cinematic shallow depth of field',
  },
  {
    name: 'Misty Alpine Castle',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    prompt: 'Cinematic drone flyover through mist towards glowing castle windows at twilight',
  },
  {
    name: 'Futuristic Hypercar',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    prompt: 'Headlights turn on with bright flare, vehicle accelerates forward leaving light trails',
  },
];

export const ImageToVideoPanel: React.FC<ImageToVideoPanelProps> = ({
  aspectRatio,
  onAddClip,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_STARTER_PHOTOS[0].url);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(SAMPLE_STARTER_PHOTOS[0].prompt);
  const [motionIntensity, setMotionIntensity] = useState<number>(5);
  const [cameraDirection, setCameraDirection] = useState('Slow Push-in');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stageMessage, setStageMessage] = useState('');

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      setImageBase64(dataUrl);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Analyze image with Gemini 4 Argon
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          prompt: 'Analyze this image and suggest the most striking cinematic Veo animation prompt.',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        // Extract prompt if present
        const match = data.analysis.match(/`"([^"]+)"`/);
        if (match && match[1]) {
          setPrompt(match[1]);
        }
      }
    } catch (err) {
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Animate image into video with Veo 3.1
  const handleAnimateImage = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setStageMessage('Transferring keyframes to Veo 3.1 Neural Engine...');

    try {
      const fullPrompt = `${prompt}, camera motion: ${cameraDirection}, motion intensity: ${motionIntensity}/10, 8k cinematic masterpiece`;

      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio,
          model: 'veo-3.1-fast-generate-preview',
          image: {
            imageBytes: selectedImage.startsWith('data:')
              ? selectedImage.split(',')[1]
              : undefined,
            mimeType: 'image/jpeg',
          },
        }),
      });
      const startData = await startRes.json();

      setStageMessage('Interpolating motion vectors and fluid dynamics...');

      const opId = startData.opId;
      const operationName = startData.operationName;
      let isDone = false;
      let finalVideoUrl = '';
      let attempts = 0;

      while (!isDone && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 1200));

        if (attempts === 2) setStageMessage('Synthesizing temporal consistency & physics...');
        if (attempts === 3) setStageMessage('Finalizing 24fps cinema playback buffer...');

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opId, operationName }),
        });
        const pollData = await pollRes.json();

        if (pollData.done && pollData.videoUrl) {
          isDone = true;
          finalVideoUrl = pollData.videoUrl;
          break;
        }
      }

      if (finalVideoUrl) {
        const newClip: VideoClip = {
          id: 'clip_' + Date.now(),
          title: 'Animated Photo: ' + (prompt.slice(0, 24) || 'Scene'),
          sourceUrl: finalVideoUrl,
          thumbnailUrl: selectedImage,
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          speed: 1,
          type: 'animated-image',
        };
        onAddClip(newClip);
      }
    } catch (err) {
      console.error('Animation error:', err);
    } finally {
      setIsGenerating(false);
      setStageMessage('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Image Selector & Uploader */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Source Keyframe Photo</span>
            </label>
            <span className="text-[10px] text-slate-400">veo-3.1-fast-generate-preview</span>
          </div>

          {/* Active Image Box */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#232a42] bg-[#0d101d] flex items-center justify-center group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Source Keyframe"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Upload or choose a reference photo</span>
              </div>
            )}

            {/* Overlay Upload Button */}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-xs font-medium text-white">Upload New Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Sample Photos Carousel */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Or pick from sample cinematic photos:</span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_STARTER_PHOTOS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedImage(item.url);
                    setPrompt(item.prompt);
                    setAnalysisResult(null);
                  }}
                  className={`h-14 rounded-lg overflow-hidden border relative text-left transition-all ${
                    selectedImage === item.url
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'border-[#222a45] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] text-slate-200 truncate font-medium">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Image Button (Gemini 4 Argon) */}
          <button
            onClick={handleAnalyzeImage}
            disabled={isAnalyzing || !selectedImage}
            className="w-full py-2 rounded-xl text-xs font-medium bg-[#14192a] hover:bg-[#1c233c] text-slate-200 border border-[#232b47] flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAnalyzing ? 'Analyzing with Gemini 4 Argon...' : 'Analyze Image with Gemini 4 Argon'}</span>
          </button>
        </div>

        {/* Right Column: Animation Motion Controls */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Animation Instruction &amp; Action Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Camera pushes in slowly, subject turns head, atmospheric mist rolls past..."
              className="w-full bg-[#131728] border border-[#232a42] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Camera Motion & Motion Intensity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Camera Motion Path
              </label>
              <select
                value={cameraDirection}
                onChange={(e) => setCameraDirection(e.target.value)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="Slow Push-in">Slow Push-in (Dramatic)</option>
                <option value="Orbit 360">Orbit 360 (Heroic)</option>
                <option value="Pedestal Up">Pedestal Up (Majestic)</option>
                <option value="Pan Left to Right">Pan Left to Right</option>
                <option value="FPV Fly-through">FPV Fly-through</option>
                <option value="Gentle Floating Drift">Gentle Floating Drift</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Motion Intensity
                </label>
                <span className="text-xs font-mono text-cyan-400">{motionIntensity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motionIntensity}
                onChange={(e) => setMotionIntensity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>
          </div>

          {/* Analysis Feedback Preview if available */}
          {analysisResult && (
            <div className="p-3 bg-[#111628] border border-cyan-500/20 rounded-xl max-h-32 overflow-y-auto text-xs text-slate-300 leading-relaxed">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Gemini 4 Argon Director Analysis:</span>
              </div>
              <p className="whitespace-pre-line text-[11px] text-slate-300">{analysisResult}</p>
            </div>
          )}

          {/* Animate Action Button */}
          <button
            onClick={() => {
              if (!selectedImage) setSelectedImage(SAMPLE_STARTER_PHOTOS[0].url);
              handleAnimateImage();
            }}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ring-1 ring-cyan-400/40 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{stageMessage || 'Animating Frame into Veo Video...'}</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Animate Photo into Video (Veo 3.1)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
