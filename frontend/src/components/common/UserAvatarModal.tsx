import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  Save,
  Link as LinkIcon,
  Github,
  RefreshCw,
  X,
  User as UserIcon,
  Mail,
  Shield,
  AlertCircle,
  AlertTriangle,
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

const EXECUTIVE_PRESETS = [
  {
    id: 'exec-1',
    label: 'Executive Talent',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    tag: 'Executive'
  },
  {
    id: 'exec-2',
    label: 'Tech Talent Lead',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    tag: 'Tech Lead'
  },
  {
    id: 'exec-3',
    label: 'Senior Partner',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    tag: 'Partner'
  },
  {
    id: 'exec-4',
    label: 'VP Operations',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    tag: 'Operations'
  },
  {
    id: 'exec-5',
    label: 'Engineering Director',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    tag: 'Engineering'
  },
  {
    id: 'exec-6',
    label: 'Head of Systems',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    tag: 'Systems Lead'
  },
  {
    id: 'exec-7',
    label: 'Platform Governor',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    tag: 'Governor'
  },
  {
    id: 'exec-8',
    label: 'Lead Architect',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    tag: 'Architect'
  }
];

export const UserAvatarModal: React.FC<UserAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Profile Information State
  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Photo Tabs State
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state when modal opens or user profile loads
  useEffect(() => {
    if (isOpen) {
      setDisplayName(user?.name || '');
      setNameError(null);
      setUploadedPreview(null);
      setCustomUrl('');
      setGithubUsername('');
      setShowDiscardConfirm(false);
    }
  }, [isOpen, user]);

  const currentAvatar = user?.avatar || '';
  const selectedPreview = uploadedPreview || customUrl.trim() || currentAvatar;

  const isNameChanged = displayName.trim() !== (user?.name || '').trim();
  const isPhotoChanged = (!!uploadedPreview || !!customUrl.trim()) && selectedPreview !== currentAvatar;
  const isDirty = isNameChanged || isPhotoChanged;

  const validateDisplayName = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Display name cannot be empty.';
    }
    if (trimmed.length < 2) {
      return 'Display name must be at least 2 characters.';
    }
    if (trimmed.length > 100) {
      return 'Display name cannot exceed 100 characters.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload an image file (PNG, JPG, JPEG, WEBP, GIF, or SVG).'
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
        message: 'New photo selected! Click "Save Changes" to apply.'
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
    const seed = (displayName || user?.name || 'Administrator') + '-' + Math.floor(Math.random() * 10000);
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
    const handle = (githubUsername || displayName || user?.name || '').trim().replace(/^@/, '');
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
    const err = validateDisplayName(displayName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);

    const trimmedName = displayName.trim();
    const targetPhotoUrl = uploadedPreview || customUrl.trim() || undefined;

    const nameChanged = trimmedName !== (user?.name || '').trim();
    const photoChanged = !!targetPhotoUrl && targetPhotoUrl !== (user?.avatar || '');

    if (!nameChanged && !photoChanged) {
      showToast({
        type: 'info',
        title: 'No Changes',
        message: 'No changes were detected in your profile.'
      });
      handleClose(true);
      return;
    }

    try {
      setIsSaving(true);
      const payload: { name?: string; avatar?: string } = {};
      if (nameChanged) payload.name = trimmedName;
      if (photoChanged) payload.avatar = targetPhotoUrl;

      await updateProfile(payload);

      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information and photo have been updated successfully!'
      });
      handleClose(true);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (force = false) => {
    if (!force && isDirty && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    setShowDiscardConfirm(false);
    setNameError(null);
    setUploadedPreview(null);
    setCustomUrl('');
    setGithubUsername('');
    onClose();
  };

  const roleUpper = (user?.role || 'admin').toUpperCase();
  const isAdmin = user?.role === 'admin';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && handleClose()}
      title={isAdmin ? 'Edit Admin Profile' : 'Edit Profile'}
      description="Update your display name and profile photo."
      size="lg"
    >
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* ==================================================
            1. CURRENT PROFILE PREVIEW CARD
            ================================================== */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/30 via-slate-900/60 to-cyan-950/30 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/20 bg-slate-900 flex items-center justify-center">
                {selectedPreview ? (
                  <img
                    src={selectedPreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
                    }}
                  />
                ) : (
                  <Avatar name={displayName || user?.name || 'Administrator'} size="lg" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0a0f1d] flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  {displayName.trim() || user?.name || 'Authorized User'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {roleUpper}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isDirty
                  ? '✨ Pending changes ready to be saved'
                  : 'Current profile active on your account'}
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
              Reset Photo
            </button>
          )}
        </div>

        {/* Discard Changes Warning if Cancel was clicked with unsaved changes */}
        {showDiscardConfirm && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>You have unsaved changes. Discard without saving?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            2. EDIT PROFILE INFORMATION SECTION
            ================================================== */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <UserIcon className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAdmin ? 'Admin Profile Information' : 'Profile Information'}
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Field A: Display Name (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Display Name</span>
                <span className="text-[10px] text-slate-500 font-normal">Editable</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter administrator display name..."
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  leftIcon={<UserIcon className="w-4 h-4 text-violet-400" />}
                  maxLength={100}
                />
              </div>
              {nameError && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Field B: Admin Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Admin Email</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">Read-only account identity</span>
              </label>
              <div className="opacity-80">
                <Input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
                  className="bg-slate-950/60 border-slate-800/80 cursor-not-allowed text-slate-400 font-mono text-xs"
                />
              </div>
            </div>

            {/* Field C: Administrator Role (Read-only badge) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Role Authority</span>
                <span className="text-[10px] text-slate-500 font-normal">Enforced by security policy</span>
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white tracking-wide">{roleUpper}</span>
                <span className="text-slate-500">—</span>
                <span className="text-slate-400 text-[11px]">
                  {isAdmin
                    ? 'Single-Administrator Governance & Platform Moderation'
                    : 'Authorized Platform Access'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            3. PROFILE PHOTO SECTION
            ================================================== */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Profile Photo
            </h3>
          </div>

          {/* Photo Tabs Navigation */}
          <div className="flex border-b border-white/[0.08] gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer',
                activeTab === 'upload'
                  ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer',
                activeTab === 'presets'
                  ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Curated Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer',
                activeTab === 'url'
                  ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>URL & AI Avatars</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-3 pt-1">
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
                  'p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200',
                  isDragOver
                    ? 'border-violet-400 bg-violet-950/30 scale-[1.01]'
                    : 'border-slate-800 hover:border-violet-500/60 bg-slate-950/40 hover:bg-slate-900/40'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">
                  Drag & drop your photo here, or <span className="text-violet-400 underline">browse files</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP, GIF, SVG (Maximum 5MB)
                </p>
              </div>

              {uploadedPreview && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    New photo selected and ready to save.
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
            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-400">
                Select an executive portrait tailored for platform administration:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {EXECUTIVE_PRESETS.map((preset) => {
                  const isSelected = selectedPreview === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setUploadedPreview(preset.url);
                        setCustomUrl('');
                      }}
                      className={cn(
                        'p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center group relative',
                        isSelected
                          ? 'border-violet-500 bg-violet-950/40 ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/20'
                          : 'border-slate-800 bg-slate-950/60 hover:border-violet-500/50 hover:bg-slate-900/60'
                      )}
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden mb-1.5">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center backdrop-blur-[1px]">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-white line-clamp-1">{preset.label}</span>
                      <span className="text-[9px] text-violet-300/80 mt-0.5">{preset.tag}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: URL & AI GENERATOR */}
          {activeTab === 'url' && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateAIAvatar}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}
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
        </div>

        {/* ==================================================
            4. MODAL ACTIONS (CANCEL / SAVE CHANGES)
            ================================================== */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <Button
            variant="secondary"
            onClick={() => handleClose()}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving || !isDirty || !displayName.trim()}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
