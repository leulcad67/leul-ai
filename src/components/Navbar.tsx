import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Layers,
  Music,
  Compass,
  Download,
  FolderOpen,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
  CheckCircle,
  Ratio,
  Sliders,
  Tv,
  Smartphone,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { formatSecondsOnly, MAX_PROJECT_DURATION_SECONDS } from '../utils/timeline';

interface NavbarProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  totalDuration: number;
  aspectRatio: '16:9' | '9:16';
  onChangeAspectRatio: (ratio: '16:9' | '9:16') => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenTemplates: () => void;
  onOpenDirectorChat: () => void;
  onOpenGrounding: () => void;
  onOpenAudioStudio: () => void;
  onOpenProjects: () => void;
  onOpenExport: () => void;
  onSaveCloud: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectTitle,
  onUpdateTitle,
  totalDuration,
  aspectRatio,
  onChangeAspectRatio,
  currentUser,
  onLogin,
  onLogout,
  onOpenTemplates,
  onOpenDirectorChat,
  onOpenGrounding,
  onOpenAudioStudio,
  onOpenProjects,
  onOpenExport,
  onSaveCloud,
  isSaving,
  hasUnsavedChanges,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  const durationPercentage = Math.min(100, (totalDuration / MAX_PROJECT_DURATION_SECONDS) * 100);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    } else {
      setTempTitle(projectTitle);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-[#0c0e17] border-b border-[#1e2235] px-3 sm:px-4 flex items-center justify-between z-30 select-none overflow-x-auto no-scrollbar">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-[#0c0e17] rounded-[7px] flex items-center justify-center">
              <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
                LEUL AI
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[9px] text-slate-400 tracking-wide font-medium mt-0.5">Veo 3.1 &bull; 2-Min Studio</p>
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-[#1e2235]" />

        {/* Project Title */}
        <div className="hidden lg:flex items-center">
          {isEditingTitle ? (
            <input
              type="text"
              aria-label="Edit project title"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-[#151928] text-xs text-white px-2 py-1 rounded-md border border-indigo-500/50 outline-none w-40"
            />
          ) : (
            <button
              onClick={() => {
                setTempTitle(projectTitle);
                setIsEditingTitle(true);
              }}
              className="text-xs font-medium text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-[#151928] transition-colors flex items-center space-x-1 max-w-[160px] truncate"
              title="Click to rename project"
            >
              <span className="truncate">{projectTitle}</span>
              <span className="text-[10px] text-slate-500">&#9998;</span>
            </button>
          )}
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-[#131625] rounded-lg p-0.5 border border-[#21263c] shrink-0">
          <button
            onClick={() => onChangeAspectRatio('16:9')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Landscape 16:9"
          >
            <Tv className="w-3 h-3" />
            <span className="hidden sm:inline">16:9</span>
          </button>
          <button
            onClick={() => onChangeAspectRatio('9:16')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Portrait 9:16"
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">9:16</span>
          </button>
        </div>

        {/* 2-Minute Duration Meter */}
        <div className="flex items-center space-x-1.5 bg-[#131625] px-2 sm:px-2.5 py-1 rounded-lg border border-[#21263c] shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-mono leading-none">
              <span className="text-slate-300 font-semibold">{formatSecondsOnly(totalDuration)}</span>
              <span className="text-slate-500 ml-1">/ 2:00</span>
            </div>
            <div className="w-14 sm:w-16 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalDuration > 100 ? 'bg-amber-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${durationPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center / Navigation Tools */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={onOpenTemplates}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141829] text-slate-200 hover:bg-[#1b2138] border border-[#242b45] transition-colors"
          title="Custom Style Templates"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Styles</span>
        </button>

        <button
          onClick={onOpenDirectorChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-900/40 to-indigo-900/40 text-indigo-200 hover:from-violet-900/60 hover:to-indigo-900/60 border border-indigo-500/30 transition-colors"
          title="AI Director Co-Pilot (Gemini)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Director AI</span>
        </button>

        <button
          onClick={onOpenGrounding}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141829] text-slate-200 hover:bg-[#1b2138] border border-[#242b45] transition-colors"
          title="Search & Maps Grounding"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Scout & Trends</span>
        </button>

        <button
          onClick={onOpenAudioStudio}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141829] text-slate-200 hover:bg-[#1b2138] border border-[#242b45] transition-colors"
          title="Text-to-Speech & AI Music"
        >
          <Music className="w-3.5 h-3.5 text-rose-400" />
          <span>Audio & Voice</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141829] text-slate-200 hover:bg-[#1b2138] border border-[#242b45] transition-colors"
          title="Saved Projects & Media"
        >
          <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Projects</span>
        </button>
      </div>

      {/* Right Actions: Auth, Cloud Save & Export */}
      <div className="flex items-center space-x-3">
        {/* Cloud Save Button */}
        <button
          onClick={onSaveCloud}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#141829] hover:bg-[#1b2138] text-slate-300 border border-[#242b45] transition-colors disabled:opacity-50"
          title={hasUnsavedChanges ? 'Unsaved changes (Save to Firestore)' : 'Project synced to cloud'}
        >
          <Cloud className={`w-3.5 h-3.5 ${hasUnsavedChanges ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Cloud' : 'Synced'}</span>
        </button>

        {/* User Account / Firebase Auth */}
        {currentUser ? (
          <div className="flex items-center space-x-2 bg-[#141829] pl-2 pr-1 py-1 rounded-lg border border-[#242b45]">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-indigo-400/50"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate">
              {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
            </span>
            <button
              onClick={onLogout}
              className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Master Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
          title="Compile and Export Full Video"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 2m</span>
        </button>
      </div>
    </header>
  );
};
