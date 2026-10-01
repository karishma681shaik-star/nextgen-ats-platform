import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  X,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { submitIssueReport, IssueReportResponse } from '../../services/api/issueApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const ISSUE_TYPES = [
  'Login / Authentication',
  'Resume Builder',
  'Resume Analysis / ATS Score',
  'AI Assistant',
  'Job Search / Matching',
  'Recruiter Dashboard',
  'Candidate Management',
  'Application / Recruitment Pipeline',
  'Profile',
  'UI / Frontend',
  'Other',
];

const MAX_FILES = 3;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'txt'];

interface ReportIssueProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  hideFloatingButton?: boolean;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onClose: controlledOnClose,
  hideFloatingButton = false
}) => {
  const { user } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setModalOpen = (open: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(open);
    }
    setInternalIsOpen(open);
  };

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<IssueReportResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Global event listener to trigger report issue from anywhere
  useEffect(() => {
    const handleGlobalOpen = () => {
      setModalOpen(true);
    };
    window.addEventListener('open-report-issue', handleGlobalOpen);
    return () => window.removeEventListener('open-report-issue', handleGlobalOpen);
  }, [controlledOnOpenChange]);

  // Keyboard shortcut: Alt+R to open, Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setModalOpen(true);
      }
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, controlledOnOpenChange]);

  const handleClose = () => {
    if (isSubmitting) return;
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    // Reset state after transition
    setTimeout(() => {
      setIssueType('');
      setDescription('');
      setFiles([]);
      setErrorMessage(null);
      setSuccessData(null);
    }, 300);
  };

  const handleFileValidationAndAdd = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: File[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];

      // Check count limit
      if (files.length + newFiles.length >= MAX_FILES) {
        setErrorMessage(`Maximum ${MAX_FILES} attachments allowed.`);
        break;
      }

      // Check size limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File "${file.name}" exceeds the 5 MB limit.`);
        continue;
      }

      // Check extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setErrorMessage(`Unsupported file format for "${file.name}". Allowed: JPG, PNG, WEBP, GIF, PDF, TXT.`);
        continue;
      }

      // Avoid duplicates
      const alreadyExists = files.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );
      if (!alreadyExists) {
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidationAndAdd(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!issueType) {
      setErrorMessage('Please select an issue type.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage('Please provide a detailed description (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('issueType', issueType);
      formData.append('description', description.trim());

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await submitIssueReport(formData);
      setSuccessData(response);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit issue report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating "Report Issue" Trigger Button (Standalone mode) */}
      {!hideFloatingButton && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center group">
          {/* Vibrant ambient fuchsia/violet glow aura */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-fuchsia-600/50 via-purple-600/50 to-pink-500/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <button
            type="button"
            onClick={() => setInternalIsOpen(true)}
            title="Report a bug, UI issue, or submit feedback (Alt+R)"
            aria-label="Report an issue or bug"
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#181d3d]/95 via-[#131733]/95 to-[#0d1228]/95 hover:from-[#212854] hover:to-[#141b3d] border border-fuchsia-400/50 hover:border-fuchsia-300 shadow-[0_4px_25px_rgba(217,70,239,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(217,70,239,0.55)] backdrop-blur-2xl text-white transition-all duration-200 cursor-pointer active:scale-95 group overflow-hidden"
          >
            {/* Top specular glass reflection line */}
            <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Radiant jewel icon badge */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-pink-500 text-white border border-white/50 flex items-center justify-center shadow-[0_0_14px_rgba(217,70,239,0.7)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.9)] transition-all duration-300">
              <Bug className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            </div>

            <span className="text-xs font-bold tracking-wide text-white drop-shadow-sm">
              Report Issue
            </span>

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold font-mono text-fuchsia-200 bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 border border-fuchsia-400/50 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.35)]">
              Feedback
            </span>
          </button>
        </div>
      )}

      {/* Report Issue Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
            {/* Backdrop click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0"
              aria-hidden="true"
            />

            {/* Modal Card */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-[#0a0f24] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-slate-100 max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-[#070b1a] border-b border-slate-800/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-glow">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                      Report Issue
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tell us what went wrong and we'll help you resolve it.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Success State Screen */}
                {successData ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-glow">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-lg font-bold text-white">
                        Report submitted successfully
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                        Thank you. Our team will review your issue and follow up promptly.
                      </p>
                    </div>

                    {/* Report Metadata Badge */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Report ID:</span>
                        <span className="font-mono font-bold text-indigo-300 truncate max-w-[200px]">
                          {successData.reportId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="font-semibold text-slate-200">{successData.issueType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                          {successData.status}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="glow"
                      size="md"
                      onClick={handleClose}
                      className="w-full mt-2 font-bold shadow-glow"
                    >
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  /* Form State */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Quick Help Banner with Telegram Community Link */}
                    <a
                      href="https://t.me/careerkarish"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-indigo-950/50 border border-indigo-500/35 flex items-center justify-between gap-3 text-xs hover:border-indigo-400 hover:bg-indigo-950/60 transition-all cursor-pointer group shadow-sm"
                      title="Join CareerKarish Telegram Community"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
                            Need help quickly? Join our community and share your issue.
                          </p>
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 group-hover:text-white group-hover:bg-indigo-600 transition-colors shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>

                    {/* Error Alert */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <span className="flex-1">{errorMessage}</span>
                      </motion.div>
                    )}

                    {/* Issue Type Field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Issue Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        required
                        className="w-full bg-[#060a17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0a0f24] text-slate-500">
                          Select issue type
                        </option>
                        {ISSUE_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#0a0f24] text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        placeholder="Describe the issue you encountered and what you expected to happen."
                        className="w-full bg-[#060a17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                      />
                      <div className="text-[10px] text-slate-500 text-right">
                        {description.length} / 5000 characters
                      </div>
                    </div>

                    {/* Attachments Dropzone */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300">
                        Attachments (optional, up to 3)
                      </label>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                          isDragging
                            ? 'border-purple-400 bg-purple-950/20'
                            : 'border-slate-800 hover:border-indigo-500/50 bg-[#060a17]/80'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileValidationAndAdd(e.target.files);
                            }
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2 shadow-glow">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-200">
                          <span className="text-purple-400 font-semibold underline underline-offset-2">
                            Browse
                          </span>{' '}
                          file or drag and drop here
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          JPG, PNG, WEBP, GIF, PDF, TXT (up to 5MB each)
                        </p>
                      </div>

                      {/* Selected Files List */}
                      {files.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {files.map((f, index) => (
                            <div
                              key={index}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate text-slate-200 font-medium">{f.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                  ({formatFileSize(f.size)})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(index);
                                }}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="glow"
                        size="md"
                        disabled={isSubmitting || !issueType || !description.trim()}
                        className="w-full font-bold shadow-glow bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                        leftIcon={
                          isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )
                        }
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
