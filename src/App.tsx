/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { TimelineEditor } from './components/TimelineEditor';
import { TextToVideoPanel } from './components/TextToVideoPanel';
import { ImageToVideoPanel } from './components/ImageToVideoPanel';
import { ImageStudioPanel } from './components/ImageStudioPanel';
import { StyleTemplatesModal } from './components/StyleTemplatesModal';
import { DirectorChatDrawer } from './components/DirectorChatDrawer';
import { GroundingDrawer } from './components/GroundingDrawer';
import { AudioStudioModal } from './components/AudioStudioModal';
import { ExportModal } from './components/ExportModal';
import { ProjectsLibraryModal } from './components/ProjectsLibraryModal';

import {
  VideoClip,
  TextOverlay,
  AudioTrack,
  calculateTotalTimelineDuration,
  getActiveClipAtTime,
  MAX_PROJECT_DURATION_SECONDS,
} from './utils/timeline';

import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logoutUser,
  saveProjectToFirestore,
  loadCustomTemplatesFromFirestore,
  CustomTemplateRecord,
  SavedProject,
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Video,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Wand2,
  Tv,
  Film,
} from 'lucide-react';

// Starter demo clips for instant responsive preview
const INITIAL_DEMO_CLIPS: VideoClip[] = [
  {
    id: 'demo-1',
    title: 'Neo-Tokyo Cyber Corridor',
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 12,
    trimStart: 0,
    trimEnd: 12,
    speed: 1,
    type: 'video',
  },
  {
    id: 'demo-2',
    title: 'High-Altitude Aerial Pass',
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    duration: 14,
    trimStart: 0,
    trimEnd: 14,
    speed: 1,
    type: 'video',
  },
];

const INITIAL_TEXT_OVERLAYS: TextOverlay[] = [
  {
    id: 'intro-text',
    text: 'LEUL AI • DIRECTORS MASTER CUT',
    startTime: 0,
    duration: 4,
    position: 'top',
    color: '#38bdf8',
    fontSize: 26,
    style: 'cinematic',
  },
];

const INITIAL_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'bg-music',
    title: 'Ambient Cinematic Soundtrack',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cinematic-time-lapse-115672.mp3',
    type: 'music',
    startTime: 0,
    duration: 30,
    volume: 0.6,
  },
];

export default function App() {
  // Project State
  const [projectId, setProjectId] = useState<string>('project_' + Date.now());
  const [projectTitle, setProjectTitle] = useState('Cyberpunk Tokyo 2099 - Master Cut');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [colorGrade, setColorGrade] = useState('teal-orange');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('cyberpunk-neon');

  // Timeline State
  const [clips, setClips] = useState<VideoClip[]>(INITIAL_DEMO_CLIPS);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(INITIAL_TEXT_OVERLAYS);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Active Generator Tab
  const [generatorTab, setGeneratorTab] = useState<'text-to-video' | 'image-to-video' | 'image-studio'>('text-to-video');

  // Modals & Drawers
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDirectorChatOpen, setIsDirectorChatOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isAudioStudioOpen, setIsAudioStudioOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Custom Templates & Auth
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    // Load custom templates
    loadCustomTemplatesFromFirestore().then((templates) => {
      if (templates && templates.length > 0) {
        setCustomTemplates(templates);
      }
    });
    return () => unsubscribe();
  }, []);

  // Total Timeline Duration (capped at 120s / 2min)
  const totalDuration = calculateTotalTimelineDuration(clips);

  // Active Clip at Playhead
  const activeClipInfo = getActiveClipAtTime(clips, currentTime);
  const activeClip = activeClipInfo?.clip || (clips.length > 0 ? clips[0] : null);
  const activeLocalTime = activeClipInfo?.clipLocalTime || 0;

  // Real-time playback loop
  useEffect(() => {
    let animId: number;
    let lastStamp: number | null = null;

    const tick = (stamp: number) => {
      if (!lastStamp) lastStamp = stamp;
      const deltaSec = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0; // loop or reset
          }
          return next;
        });
        animId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast notification for newly rendered scenes
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Add clip handler (with 2-minute duration guard and auto-preview)
  const handleAddClip = (newClip: VideoClip) => {
    const currentTotal = calculateTotalTimelineDuration(clips);
    if (currentTotal >= MAX_PROJECT_DURATION_SECONDS) {
      alert('Maximum 2-minute timeline duration reached. Trim existing clips to add more.');
      return;
    }
    const updated = [...clips, newClip];
    setClips(updated);
    setHasUnsavedChanges(true);

    // Jump playhead directly to the newly generated clip and play
    setCurrentTime(currentTotal);
    setSelectedClipId(newClip.id);
    setIsPlaying(true);
    setStatusToast(`🎬 New Scene Rendered: "${newClip.title}" is now playing!`);
    setTimeout(() => setStatusToast(null), 4500);
  };

  // Cloud Save handler
  const handleSaveToCloud = async () => {
    if (!currentUser) {
      // Auto login anonymously or prompt
      try {
        await loginAnonymously();
      } catch (e) {
        console.warn('Anonymous login error:', e);
      }
    }
    setIsSaving(true);
    try {
      const projectData: SavedProject = {
        id: projectId,
        userId: currentUser?.uid || 'guest',
        title: projectTitle,
        aspectRatio,
        durationSeconds: totalDuration,
        clips,
        textOverlays,
        audioTracks,
        selectedTemplateId,
        colorGrade,
      };
      await saveProjectToFirestore(projectData);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Cloud save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Load project from cloud library
  const handleLoadProject = (proj: SavedProject) => {
    setProjectId(proj.id);
    setProjectTitle(proj.title);
    setAspectRatio(proj.aspectRatio || '16:9');
    setClips(proj.clips || []);
    setTextOverlays(proj.textOverlays || []);
    setAudioTracks(proj.audioTracks || []);
    if (proj.selectedTemplateId) setSelectedTemplateId(proj.selectedTemplateId);
    if (proj.colorGrade) setColorGrade(proj.colorGrade);
    setCurrentTime(0);
    setIsPlaying(false);
    setHasUnsavedChanges(false);
  };

  // Create new project
  const handleNewProject = () => {
    setProjectId('project_' + Date.now());
    setProjectTitle('New Cinematic Video');
    setClips([]);
    setTextOverlays([]);
    setAudioTracks([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-[#070912] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Studio Navbar */}
      <Navbar
        projectTitle={projectTitle}
        onUpdateTitle={(title) => {
          setProjectTitle(title);
          setHasUnsavedChanges(true);
        }}
        totalDuration={totalDuration}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={(ratio) => {
          setAspectRatio(ratio);
          setHasUnsavedChanges(true);
        }}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenDirectorChat={() => setIsDirectorChatOpen(true)}
        onOpenGrounding={() => setIsGroundingOpen(true)}
        onOpenAudioStudio={() => setIsAudioStudioOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onSaveCloud={handleSaveToCloud}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Studio Workspace: Top Player, Timeline & Bottom Generators */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Half: Video Player & Director Viewport */}
        <VideoPlayer
          activeClip={activeClip}
          activeLocalTime={activeLocalTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={(time) => setCurrentTime(time)}
          currentTime={currentTime}
          totalDuration={totalDuration}
          aspectRatio={aspectRatio}
          colorGrade={colorGrade}
          onChangeColorGrade={(cg) => {
            setColorGrade(cg);
            setHasUnsavedChanges(true);
          }}
          playbackSpeed={playbackSpeed}
          onChangePlaybackSpeed={(spd) => setPlaybackSpeed(spd)}
          textOverlays={textOverlays}
          statusToast={statusToast}
        />

        {/* Middle: Multi-Track Timeline Editor */}
        <TimelineEditor
          clips={clips}
          onUpdateClips={(newClips) => {
            setClips(newClips);
            setHasUnsavedChanges(true);
          }}
          textOverlays={textOverlays}
          onUpdateTextOverlays={(newOverlays) => {
            setTextOverlays(newOverlays);
            setHasUnsavedChanges(true);
          }}
          audioTracks={audioTracks}
          onUpdateAudioTracks={(newTracks) => {
            setAudioTracks(newTracks);
            setHasUnsavedChanges(true);
          }}
          currentTime={currentTime}
          onSeek={(t) => setCurrentTime(t)}
          selectedClipId={selectedClipId}
          onSelectClip={(id) => setSelectedClipId(id)}
        />

        {/* Bottom Half: AI Generator Studio Tabs */}
        <div className="bg-[#0b0e1b] border-t border-[#1b2034] shrink-0">
          {/* Tab Headers */}
          <div className="px-3 sm:px-4 h-11 border-b border-[#1b2034] flex items-center justify-between overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setGeneratorTab('text-to-video')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  generatorTab === 'text-to-video'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#14192b]'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Text-to-Video (Veo 3.1)</span>
              </button>

              <button
                onClick={() => setGeneratorTab('image-to-video')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  generatorTab === 'image-to-video'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#14192b]'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                <span>Image-to-Video Animate (Veo 3.1)</span>
              </button>

              <button
                onClick={() => setGeneratorTab('image-studio')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  generatorTab === 'image-studio'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#14192b]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>High-Res Image Studio (1K/2K/4K)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 shrink-0 pl-3">
              <span>Active Style:</span>
              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                {selectedTemplateId}
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="max-h-[380px] overflow-y-auto">
            {generatorTab === 'text-to-video' && (
              <TextToVideoPanel
                aspectRatio={aspectRatio}
                onAddClip={handleAddClip}
                selectedTemplateId={selectedTemplateId}
              />
            )}

            {generatorTab === 'image-to-video' && (
              <ImageToVideoPanel
                aspectRatio={aspectRatio}
                onAddClip={handleAddClip}
              />
            )}

            {generatorTab === 'image-studio' && (
              <ImageStudioPanel
                onSendToVideoAnimator={(url, promptSuggestion) => {
                  setGeneratorTab('image-to-video');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialogs and Drawers */}
      <StyleTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={(id) => {
          setSelectedTemplateId(id);
          setHasUnsavedChanges(true);
        }}
        customTemplates={customTemplates}
        onAddCustomTemplate={(tmpl) => {
          setCustomTemplates([...customTemplates, tmpl]);
        }}
        currentUser={currentUser}
      />

      <DirectorChatDrawer
        isOpen={isDirectorChatOpen}
        onClose={() => setIsDirectorChatOpen(false)}
        onApplyPrompt={(prompt) => {
          setGeneratorTab('text-to-video');
        }}
      />

      <GroundingDrawer
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        onApplyPrompt={(prompt) => {
          setGeneratorTab('text-to-video');
        }}
      />

      <AudioStudioModal
        isOpen={isAudioStudioOpen}
        onClose={() => setIsAudioStudioOpen(false)}
        onAddAudioTrack={(track) => {
          setAudioTracks([...audioTracks, track]);
          setHasUnsavedChanges(true);
        }}
        currentTime={currentTime}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clips={clips}
        textOverlays={textOverlays}
        audioTracks={audioTracks}
        totalDuration={totalDuration}
        projectTitle={projectTitle}
        aspectRatio={aspectRatio}
        colorGrade={colorGrade}
      />

      <ProjectsLibraryModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        currentUser={currentUser}
        onLoadProject={handleLoadProject}
        onNewProject={handleNewProject}
        currentProjectId={projectId}
      />
    </div>
  );
}
