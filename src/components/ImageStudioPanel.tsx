import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Video,
  Wand2,
  Maximize2,
  Sliders,
  Check,
} from 'lucide-react';

interface ImageStudioPanelProps {
  onSendToVideoAnimator: (imageUrl: string, promptSuggestion: string) => void;
}

export const ImageStudioPanel: React.FC<ImageStudioPanelProps> = ({
  onSendToVideoAnimator,
}) => {
  const [prompt, setPrompt] = useState('An ethereal glass observatory floating above cloud inversion at dusk');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [model, setModel] = useState<'gemini-3-pro-image-preview' | 'gemini-nano-banana-2.1'>('gemini-3-pro-image-preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80'
  );
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [editInstruction, setEditInstruction] = useState('Add glowing cyan neon volumetric particles and reflective puddles');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const activePrompt =
        activeTab === 'edit' && generatedImage
          ? `${prompt}. Modifications: ${editInstruction}`
          : prompt;

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          aspectRatio,
          imageSize,
          model,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `leul-ai-${imageSize}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Form & Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create High-Res Image
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Edit &amp; Remix Image
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{model}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {activeTab === 'create' ? 'Image Generation Prompt' : 'Base Scene Prompt'}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Masterpiece 8k shot of a futuristic cyberpunk city with flying vehicles..."
              className="w-full bg-[#131728] border border-[#232a42] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {activeTab === 'edit' && (
            <div>
              <label className="text-xs font-semibold text-cyan-300 block mb-1 flex items-center space-x-1">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Edit / Remix Instructions (gemini-nano-banana-2.1)</span>
              </label>
              <input
                type="text"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="What would you like to add, remove, or modify?"
                className="w-full bg-[#131728] border border-[#232a42] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Image Size Affordance: 1K, 2K, 4K */}
          <div className="bg-[#121626] border border-[#1f263e] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Image Resolution Quality</span>
              </span>
              <span className="text-[10px] text-slate-400">gemini-3-pro-image-preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    imageSize === size
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                      : 'bg-[#181d33] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{size} Ultra</span>
                  <span className="text-[9px] font-normal opacity-75">
                    {size === '1K' ? '1024x1024' : size === '2K' ? '2048x2048' : '4096x4096'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Engine Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
                <option value="4:3">4:3 Classic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                AI Model Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="gemini-3-pro-image-preview">gemini-3-pro-image-preview</option>
                <option value="gemini-nano-banana-2.1">gemini-nano-banana-2.1</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating {imageSize} High-Res Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {imageSize} Masterpiece</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Image Preview Canvas */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#232a42] bg-[#0c0e18] flex items-center justify-center shadow-xl">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="AI Generated"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Generate an image to preview</span>
              </div>
            )}

            {/* Quality Badge Overlay */}
            {generatedImage && (
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-black/70 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                {imageSize} ULTRA RES &bull; {aspectRatio}
              </div>
            )}
          </div>

          {/* Quick Action Buttons on Generated Image */}
          {generatedImage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSendToVideoAnimator(generatedImage, prompt)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center space-x-1.5 transition-all"
                title="Animate this photo into video"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Animate into Veo Video</span>
              </button>

              <button
                onClick={handleDownload}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-[#14192b] hover:bg-[#1d233d] text-slate-200 border border-[#242b46] flex items-center space-x-1.5 transition-colors"
                title="Download High-Res PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {imageSize}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
