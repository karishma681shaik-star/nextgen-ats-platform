import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  Save,
  Link as LinkIcon,
  Github,
  RefreshCw,
  X
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface UserAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECRUITER_PRESETS = [
  {
    id: 'recruiter-1',
    label: 'Executive Talent',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    tag: 'Female Executive'
  },
  {
    id: 'recruiter-2',
    label: 'Tech Talent Lead',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    tag: 'Talent Lead'
  },
  {
    id: 'recruiter-3',
    label: 'Senior Partner',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    tag: 'Partner'
  },
  {
    id: 'recruiter-4',
    label: 'VP People Ops',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    tag: 'VP People'
  },
  {
    id: 'recruiter-5',
    label: 'Engineering Recruiter',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    tag: 'Tech Recruiter'
  },
  {
    id: 'recruiter-6',
    label: 'Head of Talent',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    tag: 'Head of Talent'
  },
  {
    id: 'recruiter-7',
    label: 'HR Director',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    tag: 'Director'
  },
  {
    id: 'recruiter-8',
    label: 'Modern Recruiter',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    tag: 'Modern Style'
  }
];

export const UserAvatarModal: React.FC<UserAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, updateAvatar } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = user?.avatar || '';
  const selectedPreview = uploadedPreview || customUrl.trim() || currentAvatar;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload an image file (PNG, JPG, JPEG, WEBP, or GIF).'
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Image size must be less than 5MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedPreview(dataUrl);
      showToast({
        type: 'info',
        title: 'Image Ready',
        message: 'Photo loaded! Click "Save Photo" to apply.'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateAIAvatar = () => {
    const seed = (user?.name || 'Recruiter') + '-' + Math.floor(Math.random() * 10000);
    const dicebearUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
      seed
    )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setCustomUrl(dicebearUrl);
    setUploadedPreview(dicebearUrl);
    showToast({
      type: 'info',
      title: 'AI Avatar Generated',
      message: 'Generated professional vector portrait!'
    });
  };

  const handleImportGitHub = () => {
    const handle = (githubUsername || user?.name || '').trim().replace(/^@/, '');
    if (!handle) {
      showToast({
        type: 'warning',
        title: 'Username Required',
        message: 'Please enter a GitHub username to import.'
      });
      return;
    }
    const ghUrl = `https://github.com/${handle}.png`;
    setCustomUrl(ghUrl);
    setUploadedPreview(ghUrl);
    showToast({
      type: 'info',
      title: 'GitHub Avatar Fetched',
      message: `Loaded avatar for @${handle}`
    });
  };

  const handleSave = async () => {
    const targetUrl = uploadedPreview || customUrl.trim();
    if (!targetUrl) {
      showToast({
        type: 'warning',
        title: 'No Photo Selected',
        message: 'Please upload a photo, choose a preset, or enter an image URL.'
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateAvatar(targetUrl);
      showToast({
        type: 'success',
        title: 'Profile Photo Updated',
        message: 'Your recruiter photo was successfully updated!'
      });
      handleClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile photo. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setUploadedPreview(null);
    setCustomUrl('');
    setGithubUsername('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile Photo"
      description="Personalize your profile picture visible across job listings, applicant chats, and header navigation."
      size="lg"
    >
      <div className="space-y-6">
        {/* Top Header: Live Avatar Comparison & Preview */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#0d1326] to-indigo-950/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20 bg-slate-900 flex items-center justify-center">
                {selectedPreview ? (
                  <img
                    src={selectedPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
                    }}
                  />
                ) : (
                  <Avatar name={user?.name || 'Recruiter'} size="lg" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0f1d] flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{user?.name || 'Recruiter'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {user?.role || 'Recruiter'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {uploadedPreview || customUrl.trim()
                  ? '✨ New photo preview selected — click "Save Photo" to apply'
                  : 'Current profile photo active on your account'}
              </p>
            </div>
          </div>

          {(uploadedPreview || customUrl.trim()) && (
            <button
              type="button"
              onClick={() => {
                setUploadedPreview(null);
                setCustomUrl('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Selection
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer',
              activeTab === 'upload'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer',
              activeTab === 'presets'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Camera className="w-4 h-4" />
            <span>Curated Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer',
              activeTab === 'url'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>URL & AI Avatars</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD PHOTO */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200',
                isDragOver
                  ? 'border-purple-400 bg-purple-950/30 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-purple-500/60 bg-slate-950/40 hover:bg-slate-900/40'
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Drag & drop your photo here, or <span className="text-purple-400 underline">browse files</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Supports PNG, JPG, WEBP, GIF, SVG (Maximum 5MB)
              </p>
            </div>

            {uploadedPreview && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  New image ready! Preview displayed above.
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedPreview(null)}
                  className="text-slate-400 hover:text-rose-400 font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select a professional executive portrait tailored for recruiters:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {RECRUITER_PRESETS.map((preset) => {
                const isSelected = selectedPreview === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setUploadedPreview(preset.url);
                      setCustomUrl('');
                    }}
                    className={cn(
                      'p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center group relative',
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-purple-500/50 hover:bg-slate-900/60'
                    )}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center backdrop-blur-[1px]">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white line-clamp-1">{preset.label}</span>
                    <span className="text-[10px] text-purple-300/80 mt-0.5">{preset.tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: URL & AI GENERATOR */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerateAIAvatar}
                leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
              >
                Generate AI Vector Portrait
              </Button>
            </div>

            <div className="space-y-3 pt-1">
              <Input
                label="Direct Image URL"
                placeholder="https://images.unsplash.com/..."
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setUploadedPreview(e.target.value.trim());
                  }
                }}
                leftIcon={<LinkIcon className="w-4 h-4" />}
              />
              <p className="text-[11px] text-slate-400">Enter an external HTTPS photo URL</p>

              <div className="flex items-end gap-2 pt-1">
                <div className="flex-1">
                  <Input
                    label="Or Import from GitHub Profile"
                    placeholder="e.g. karish or github_user"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    leftIcon={<Github className="w-4 h-4" />}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleImportGitHub}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Fetch
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            variant="glow"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!uploadedPreview && !customUrl.trim() && selectedPreview === currentAvatar}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
};
