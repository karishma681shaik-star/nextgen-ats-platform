import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Lock,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  ExternalLink,
  Download,
  Sparkles,
  Edit3,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { candidateService } from '../../services';
import { Resume } from '../../types';

// Cohesive pair of premium SVG document icons inspired by Reference Image 1
const PdfDocumentIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-14' }) => (
  <svg
    viewBox="0 0 54 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-200 select-none`}
  >
    <path
      d="M6 0H38L52 14V58C52 61.3137 49.3137 64 46 64H6C2.68629 64 0 61.3137 0 58V6C0 2.68629 2.68629 0 6 0Z"
      fill="#F8FAFC"
    />
    <path
      d="M6 0.5H37.8L51.5 14.2V58C51.5 61.0376 49.0376 63.5 46 63.5H6C2.96243 63.5 0.5 61.0376 0.5 58V6C0.5 2.96243 2.96243 0.5 6 0.5Z"
      stroke="#CBD5E1"
      strokeWidth="1"
    />
    <path
      d="M38 0V12C38 13.1046 38.8954 14 40 14H52L38 0Z"
      fill="#E2E8F0"
    />
    <path
      d="M38 0L52 14H40C38.8954 14 38 13.1046 38 12V0Z"
      stroke="#CBD5E1"
      strokeWidth="1"
    />
    <line x1="10" y1="20" x2="28" y2="20" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <line x1="10" y1="26" x2="38" y2="26" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    <line x1="10" y1="32" x2="24" y2="32" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />

    <rect x="5" y="38" width="34" height="18" rx="4" fill="#DC2626" />
    <text
      x="22"
      y="51"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="9.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.6px"
    >
      PDF
    </text>
  </svg>
);

const DocDocumentIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-14' }) => (
  <svg
    viewBox="0 0 54 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-200 select-none`}
  >
    <path
      d="M6 0H38L52 14V58C52 61.3137 49.3137 64 46 64H6C2.68629 64 0 61.3137 0 58V6C0 2.68629 2.68629 0 6 0Z"
      fill="#F8FAFC"
    />
    <path
      d="M6 0.5H37.8L51.5 14.2V58C51.5 61.0376 49.0376 63.5 46 63.5H6C2.96243 63.5 0.5 61.0376 0.5 58V6C0.5 2.96243 2.96243 0.5 6 0.5Z"
      stroke="#CBD5E1"
      strokeWidth="1"
    />
    <path
      d="M38 0V12C38 13.1046 38.8954 14 40 14H52L38 0Z"
      fill="#E2E8F0"
    />
    <path
      d="M38 0L52 14H40C38.8954 14 38 13.1046 38 12V0Z"
      stroke="#CBD5E1"
      strokeWidth="1"
    />
    <line x1="10" y1="20" x2="28" y2="20" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <line x1="10" y1="26" x2="38" y2="26" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    <line x1="10" y1="32" x2="24" y2="32" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />

    <rect x="5" y="38" width="34" height="18" rx="4" fill="#2563EB" />
    <text
      x="22"
      y="51"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="9.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.6px"
    >
      DOC
    </text>
  </svg>
);

type ExperienceState = 'upload' | 'processing' | 'dashboard';

export const FinalCTA: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Workflow State: 'upload' (Stage 1), 'processing' (Stage 2), 'dashboard' (Stage 3)
  const [currentState, setCurrentState] = useState<ExperienceState>('upload');

  // File & Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Processing State (Stage 2)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Establishing secure connection...');
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dashboard State (Stage 3)
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [lastUploadedResumeId, setLastUploadedResumeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real resumes for authenticated candidate
  const loadCandidateResumes = async () => {
    if (!isAuthenticated || !user) return;
    try {
      setIsLoadingResumes(true);
      const data = await candidateService.getResumes();
      setResumes(data || []);
    } catch (err: any) {
      console.error('Failed to load candidate resumes:', err);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCandidateResumes();
    }
  }, [isAuthenticated]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearInterval(processingTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /* ------------------------------------------------------------------
     STAGE 1: FILE SELECTION & VALIDATION
  ------------------------------------------------------------------- */
  const validateAndSetFile = (file: File) => {
    setFileError(null);

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      setFileError('Unsupported file format. Please upload a PDF or DOC/DOCX document.');
      return false;
    }

    // 2 MB configured limit (2 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(`File size exceeds 2 MB limit (${fileSizeMB} MB). Please upload a smaller file.`);
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ------------------------------------------------------------------
     STAGE 2: REAL BACKEND UPLOAD & PROCESSING
  ------------------------------------------------------------------- */
  const handleStartUpload = async () => {
    if (!selectedFile) return;

    // Check authentication: if visitor is not logged in, prompt authentication
    if (!isAuthenticated || !user) {
      sessionStorage.setItem('ai_ats_pending_resume_name', selectedFile.name);
      showToast({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please sign in or create an account to process and save your resume.',
      });
      navigate(`/login/candidate?redirect=${encodeURIComponent('/#resume-upload')}`);
      return;
    }

    setCurrentState('processing');
    setUploadProgress(12);
    setStatusMessage('Establishing secure connection...');
    setIsUploadComplete(false);
    setProcessingError(null);

    abortControllerRef.current = new AbortController();

    // Step-by-step progress simulation tied to backend upload
    let progressVal = 12;
    processingTimerRef.current = setInterval(() => {
      progressVal += 14;
      if (progressVal <= 88) {
        setUploadProgress(progressVal);
        if (progressVal >= 35 && progressVal < 60) {
          setStatusMessage('Uploading your document securely...');
        } else if (progressVal >= 60 && progressVal < 80) {
          setStatusMessage('Validating and extracting resume content...');
        } else if (progressVal >= 80) {
          setStatusMessage('Saving structured resume to database...');
        }
      }
    }, 450);

    try {
      // Real backend API call to Spring Boot
      const savedResume = await candidateService.uploadResume(selectedFile, {
        signal: abortControllerRef.current.signal,
      });

      if (processingTimerRef.current) clearInterval(processingTimerRef.current);

      setUploadProgress(100);
      setIsUploadComplete(true);
      setStatusMessage('Your resume is ready.');
      setLastUploadedResumeId(savedResume.id);

      showToast({
        type: 'success',
        title: 'Resume Processed Successfully',
        message: `Parsed and indexed "${savedResume.fileName || selectedFile.name}".`,
      });

      // Reload fresh list of resumes
      await loadCandidateResumes();
    } catch (err: any) {
      if (processingTimerRef.current) clearInterval(processingTimerRef.current);

      if (err.name === 'AbortError') {
        setCurrentState('upload');
        return;
      }

      console.error('Resume upload error:', err);
      const errMsg = err.message || 'Failed to upload and parse resume. Please try again.';
      setProcessingError(errMsg);
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: errMsg,
      });
    }
  };

  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (processingTimerRef.current) {
      clearInterval(processingTimerRef.current);
    }
    setCurrentState('upload');
    setUploadProgress(0);
    setProcessingError(null);
  };

  const handleOpenCompletedResume = () => {
    if (lastUploadedResumeId) {
      navigate(`/candidate/resume-builder/${lastUploadedResumeId}?tab=editor`);
    } else {
      setCurrentState('dashboard');
    }
  };

  /* ------------------------------------------------------------------
     STAGE 3: DASHBOARD ACTIONS
  ------------------------------------------------------------------- */
  const handleOpenResume = (id: string) => {
    navigate(`/candidate/resume-builder/${id}?tab=editor`);
  };

  const handleAnalyzeResume = (id: string) => {
    navigate(`/candidate/resume-analysis?resumeId=${id}`);
  };

  return (
    <section id="resume-upload" className="py-24 relative overflow-hidden bg-slate-950/90 scroll-mt-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Main Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3.5"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white tracking-tight leading-[1.2] font-sans">
            Check Resume score and feedback for free.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto font-sans">
            We identify your resume's strengths, prioritize critical fixes, and help optimize it to meet ATS and recruiter expectations — improving your chances of getting shortlisted for interviews.
          </p>
        </motion.div>

        {/* ------------------------------------------------------------------
            STAGE 1: RESUME UPLOAD CARD (Inspired by Reference Image 1 & 3)
        ------------------------------------------------------------------- */}
        {currentState === 'upload' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="rounded-[28px] border border-slate-800/90 bg-[#060a18]/95 backdrop-blur-xl p-8 sm:p-10 lg:p-12 w-full max-w-[620px] mx-auto shadow-2xl relative space-y-7"
          >
            <h3 className="text-center text-lg sm:text-[19px] font-semibold text-white tracking-normal font-sans">
              Upload Your Resume to See ATS Score and Feedback
            </h3>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-2xl py-10 px-6 sm:py-12 sm:px-8 text-center transition-all cursor-pointer relative select-none group ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-950/25 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-indigo-500/50 bg-[#090e24]/40 hover:bg-[#090e24]/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
                id="landing-resume-file-input"
              />

              {/* Cohesive Pair of Premium SVG Document Icons */}
              <div className="flex items-center justify-center gap-4 mb-5 select-none">
                <PdfDocumentIcon className="w-12 h-14" />
                <DocDocumentIcon className="w-12 h-14" />
              </div>

              {/* Call-to-action text */}
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-normal text-slate-200">
                  <span className="underline underline-offset-4 decoration-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                    Browse file
                  </span>{' '}
                  or drag and drop here
                </p>

                {/* Trust / Privacy Indicator */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0b1022] border border-slate-800 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Private. Always.</span>
                </div>
              </div>
            </div>

            {/* Validation Error Message */}
            {fileError && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Selected File Overview & Trigger Action */}
            {selectedFile && !fileError && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{selectedFile.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(0)} KB · Ready to process
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <Button
                    onClick={handleStartUpload}
                    variant="glow"
                    size="sm"
                    className="font-bold shadow-glow text-xs px-4"
                  >
                    Upload Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Card Footer Format Guidelines (Stacked on bottom left, matching Reference Image 1) */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="space-y-1 text-left">
                <div className="text-slate-400">
                  Supported Formats : <span className="font-semibold text-slate-200">PDF, DOC</span>
                </div>
                <div className="text-slate-400">
                  Maximum file size : <span className="font-semibold text-slate-200">2 MB</span>
                </div>
              </div>

              {/* Quick Link to Dashboard for Authenticated Candidates */}
              {isAuthenticated && (
                <button
                  onClick={() => setCurrentState('dashboard')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors sm:text-right"
                >
                  View saved resumes ({resumes.length}) →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------
            STAGE 2: REAL UPLOAD & BACKEND PROCESSING (Images 2 & 5)
        ------------------------------------------------------------------- */}
        {currentState === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="rounded-[28px] border border-indigo-500/40 bg-[#060a18]/95 backdrop-blur-2xl p-8 sm:p-10 w-full max-w-[620px] mx-auto shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Top glowing edge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            {/* Header: Uploading "Resume" */}
            <div className="text-left space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold text-white font-sans">
                {isUploadComplete
                  ? `Uploaded "${selectedFile?.name || 'Resume'}"`
                  : `Uploading "${selectedFile?.name || 'Resume'}"`}
              </h3>
            </div>

            {/* Progress Bar with glowing indicator */}
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isUploadComplete
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className={isUploadComplete ? 'text-emerald-400 font-bold' : 'text-indigo-300 font-bold'}>
                  {uploadProgress}% Uploaded
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isUploadComplete ? 'Completed' : 'Processing...'}
                </span>
              </div>
            </div>

            {/* Current Stage Indicator */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              {isUploadComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold text-white">
                  {isUploadComplete ? 'Processing Finished' : 'Uploading Resume'}
                </div>
                <div className="text-[11px] text-slate-400">{statusMessage}</div>
              </div>
            </div>

            {/* Processing Error Notice */}
            {processingError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{processingError}</span>
                </div>
                <button
                  onClick={handleStartUpload}
                  className="px-2.5 py-1 rounded bg-red-900/60 text-white font-bold hover:bg-red-800 transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Action Buttons: Cancel vs Open */}
            <div className="pt-2">
              {isUploadComplete ? (
                <Button
                  onClick={handleOpenCompletedResume}
                  variant="glow"
                  size="md"
                  className="w-full font-bold shadow-glow text-sm flex items-center justify-center gap-2"
                >
                  <span>Open Resume Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <button
                  onClick={handleCancelProcessing}
                  className="w-full py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-950/50 hover:border-rose-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------
            STAGE 3: RESUME DASHBOARD & ACTIONS (Inspired by Reference Image 3)
        ------------------------------------------------------------------- */}
        {currentState === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-slate-800 bg-[#070b1a]/95 backdrop-blur-2xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl space-y-6 relative"
          >
            {/* Header: Continue where you left off */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Continue where you left off
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Build an ATS-optimized resume designed to pass automated screenings and impress hiring managers.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setCurrentState('upload');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload New</span>
              </button>
            </div>

            {/* Resume Records Table */}
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/70 overflow-hidden">
              {/* If Authenticated: Display Real Backend Resumes */}
              {isAuthenticated ? (
                resumes.length > 0 ? (
                  <div className="divide-y divide-slate-800/60 text-xs">
                    {resumes.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {res.fileName || 'My Resume'}
                              </span>
                              {res.isPrimary && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Updated {new Date(res.uploadDate || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Button
                            onClick={() => handleOpenResume(res.id)}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleAnalyzeResume(res.id)}
                            variant="glow"
                            size="sm"
                            className="text-xs shadow-glow"
                            leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
                          >
                            ATS Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm text-slate-300">No resumes found in your candidate profile.</p>
                    <button
                      onClick={() => setCurrentState('upload')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline"
                    >
                      Upload your first resume now
                    </button>
                  </div>
                )
              ) : (
                /* If Unauthenticated: Display Demonstration Resumes with Locked Modal Overlay (Screenshot 3) */
                <div className="relative">
                  <div className="divide-y divide-slate-800/60 text-xs opacity-35 filter blur-[1px] select-none pointer-events-none">
                    {[
                      { name: 'Vicky_Resume_Latest', date: 'March 20, 2026', active: true },
                      { name: 'Vicky_Resume_Old', date: 'March 15, 2026', active: false },
                      { name: 'FAANG Template Resume', date: 'March 12, 2026', active: false },
                      { name: 'MAANG Template Resume', date: 'March 12, 2026', active: false },
                      { name: 'My Resume', date: 'March 12, 2026', active: false },
                    ].map((row, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-white">{row.name}</span>
                          {row.active && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400">{row.date}</span>
                      </div>
                    ))}
                  </div>

                  {/* Locked Modal Overlay (Exact Reproduction of Screenshot 3) */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="rounded-2xl border border-indigo-500/40 bg-slate-950/95 backdrop-blur-md p-6 sm:p-8 text-center max-w-md shadow-2xl space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-glow">
                        <Lock className="w-6 h-6 text-indigo-400" />
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base sm:text-lg font-bold text-white font-display">
                          Want to Increase your Chances of Getting shortlisted?
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Unlock all resume fixes with clear explanations and AI-powered suggestions
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link to={`/login/candidate?redirect=${encodeURIComponent('/candidate/resumes')}`}>
                          <Button
                            variant="glow"
                            size="md"
                            className="w-full font-bold shadow-glow text-xs flex items-center justify-center gap-2"
                          >
                            <span>Sign Up / Login</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
