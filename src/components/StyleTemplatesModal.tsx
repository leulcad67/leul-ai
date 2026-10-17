import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Check,
  Plus,
  Sliders,
  Camera,
  Sun,
  X,
  Aperture,
} from 'lucide-react';
import { BUILTIN_STYLE_TEMPLATES, StyleTemplate } from '../utils/promptBuilder';
import { CustomTemplateRecord, saveCustomTemplateToFirestore } from '../firebase';
import { User } from 'firebase/auth';

interface StyleTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  customTemplates: CustomTemplateRecord[];
  onAddCustomTemplate: (template: CustomTemplateRecord) => void;
  currentUser: User | null;
}

export const StyleTemplatesModal: React.FC<StyleTemplatesModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  customTemplates,
  onAddCustomTemplate,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'custom' | 'create'>('curated');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customModifier, setCustomModifier] = useState('');
  const [customColorGrade, setCustomColorGrade] = useState('teal-orange');
  const [customLens, setCustomLens] = useState('35mm anamorphic');
  const [customLighting, setCustomLighting] = useState('Volumetric Rim & Fog');
  const [customCameraMotion, setCustomCameraMotion] = useState('Drone Glide');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  if (!isOpen) return null;

  const handleSaveNewTemplate = async () => {
    if (!customName.trim() || !customModifier.trim()) return;
    setIsSavingCustom(true);

    const newTemplate: CustomTemplateRecord = {
      id: 'template_' + Date.now(),
      userId: currentUser?.uid || 'guest',
      name: customName.trim(),
      description: customDescription.trim() || 'Custom creator template',
      category: 'Custom',
      promptModifier: customModifier.trim(),
      colorGrade: customColorGrade,
      defaultLens: customLens,
      defaultLighting: customLighting,
      defaultCameraMotion: customCameraMotion,
    };

    onAddCustomTemplate(newTemplate);
    if (currentUser) {
      await saveCustomTemplateToFirestore(newTemplate);
    }

    onSelectTemplate(newTemplate.id);
    setIsSavingCustom(false);
    setActiveTab('custom');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e1222] border border-[#232a44] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#1f263d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cinematic Style Templates</h2>
              <p className="text-[11px] text-slate-400">
                Preset aesthetics, lighting, color grading, and optics for Veo 3.1
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-[#14192b] p-0.5 rounded-lg border border-[#242b46]">
              <button
                onClick={() => setActiveTab('curated')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'curated' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Curated Flagships ({BUILTIN_STYLE_TEMPLATES.length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Custom ({customTemplates.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
                  activeTab === 'create' ? 'bg-indigo-600 text-white' : 'text-cyan-400 hover:text-white'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Create Style</span>
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
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'curated' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUILTIN_STYLE_TEMPLATES.map((template) => {
                const isSelected = selectedTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/80 via-[#13172b] to-[#0e1222] border-cyan-400 ring-2 ring-cyan-400/20 shadow-xl'
                        : 'bg-[#121628]/70 border-[#202740] hover:border-slate-500 hover:bg-[#151a30]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {template.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {template.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-black font-bold" />
                        </div>
                      )}
                    </div>

                    {/* Camera Specs Bar */}
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-2 border-t border-[#1e253e] mt-2">
                      <span className="flex items-center space-x-1">
                        <Camera className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{template.defaultLens}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Sun className="w-2.5 h-2.5 text-amber-400" />
                        <span>{template.defaultCameraMotion}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              {customTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">No Custom Templates Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Create custom visual styles with specific prompt keywords, color grades, and optics.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  >
                    Create First Template
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          onSelectTemplate(template.id);
                          onClose();
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/80 border-cyan-400 ring-2 ring-cyan-400/20'
                            : 'bg-[#121628]/70 border-[#202740] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-white">{template.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-black font-bold" />
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-2 border-t border-[#1e253e] mt-2">
                          <span className="font-mono text-cyan-400 truncate block">
                            {template.promptModifier}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neo-Gothic Dark Fantasy"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#14192b] border border-[#242b46] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atmospheric gargoyles, moonlit fog, cathedral architecture"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-[#14192b] border border-[#242b46] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Prompt Modifier Keywords (Appended to prompt)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. gothic aesthetic, dark cathedral silhouettes, volumetric silver moonlight, high contrast 8k render"
                  value={customModifier}
                  onChange={(e) => setCustomModifier(e.target.value)}
                  className="w-full bg-[#14192b] border border-[#242b46] rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Default Lens
                  </label>
                  <select
                    value={customLens}
                    onChange={(e) => setCustomLens(e.target.value)}
                    className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="35mm anamorphic">35mm anamorphic</option>
                    <option value="50mm prime">50mm prime</option>
                    <option value="85mm portrait telephoto">85mm portrait telephoto</option>
                    <option value="16mm ultra-wide">16mm ultra-wide</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Default Camera Motion
                  </label>
                  <select
                    value={customCameraMotion}
                    onChange={(e) => setCustomCameraMotion(e.target.value)}
                    className="w-full bg-[#181d32] border border-[#262f4e] rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="Drone Glide">Drone Glide</option>
                    <option value="Slow Push-in">Slow Push-in</option>
                    <option value="Orbit 360">Orbit 360</option>
                    <option value="Pedestal Up">Pedestal Up</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e253e] flex justify-end space-x-2">
                <button
                  onClick={() => setActiveTab('curated')}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewTemplate}
                  disabled={isSavingCustom || !customName.trim() || !customModifier.trim()}
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md disabled:opacity-50"
                >
                  {isSavingCustom ? 'Saving...' : 'Save Template to Studio'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
