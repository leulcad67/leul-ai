import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Clock,
  Video,
  X,
  Cloud,
  Check,
} from 'lucide-react';
import {
  SavedProject,
  loadUserProjectsFromFirestore,
  deleteProjectFromFirestore,
} from '../firebase';
import { User } from 'firebase/auth';
import { formatTimeCode } from '../utils/timeline';

interface ProjectsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoadProject: (project: SavedProject) => void;
  onNewProject: () => void;
  currentProjectId: string;
}

export const ProjectsLibraryModal: React.FC<ProjectsLibraryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoadProject,
  onNewProject,
  currentProjectId,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoading(true);
      loadUserProjectsFromFirestore(currentUser.uid)
        .then((data) => setProjects(data))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteProjectFromFirestore(id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#0e1222] border border-[#232a44] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[#1f263d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Saved Projects &amp; Cloud Library</h2>
              <p className="text-[11px] text-slate-400">
                Synced with Firebase Firestore &bull; Access projects anytime
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

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
          {!currentUser ? (
            <div className="text-center py-12">
              <Cloud className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">Sign In to Sync Projects</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Connect your account via Firebase Auth to securely save and access your projects from any device.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 space-x-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Loading saved projects from Firestore...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No Saved Projects Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Click "Save Cloud" in the top bar to save your current video timeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => {
                const isCurrent = proj.id === currentProjectId;
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isCurrent
                        ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                        : 'bg-[#121628] border-[#222a45] hover:border-slate-500 hover:bg-[#161b30]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate pr-2">
                          {proj.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300">
                              CURRENT
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDelete(proj.id, e)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2">
                        <span className="flex items-center space-x-0.5">
                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{formatTimeCode(proj.durationSeconds || 0)}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono uppercase">{proj.aspectRatio}</span>
                        <span>&bull;</span>
                        <span>{proj.clips?.length || 0} clips</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-500 pt-2 border-t border-[#1e253e] mt-3">
                      Updated {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
