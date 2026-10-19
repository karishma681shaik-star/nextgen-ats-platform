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

// High-fidelity SVG paper document icons precisely recreating Reference Image 2
const PdfDocumentIcon: React.FC<{ className?: string }> = ({ className = 'w-[62px] h-[76px]' }) => (
  <svg
    viewBox="0 0 62 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:scale-105 transition-transform duration-200 select-none shrink-0`}
  >
    <defs>
      <linearGradient id="pdf-paper-grad" x1="0" y1="0" x2="62" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EEF2F6" />
      </linearGradient>
      <filter id="pdf-fold-shadow" x="38" y="0" width="24" height="24" filterUnits="userSpaceOnUse">
        <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Main Paper Body with folded upper-right corner */}
    <path
      d="M 5 0 H 43 L 61 17 V 71 C 61 73.7614 58.7614 76 56 76 H 5 C 2.23858 76 0 73.7614 0 71 V 5 C 0 2.23858 2.23858 0 5 0 Z"
      fill="url(#pdf-paper-grad)"
      stroke="#CBD5E1"
      strokeWidth="1.2"
    />

    {/* Fold Flap in upper-right corner */}
    <path
      d="M 43 0 V 13 C 43 15.2091 44.7909 17 47 17 H 61 L 43 0 Z"
      fill="#E2E8F0"
      stroke="#CBD5E1"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#pdf-fold-shadow)"
    />

    {/* Preview Document Text Lines */}
    <line x1="12" y1="26" x2="32" y2="26" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <line x1="12" y1="33" x2="48" y2="33" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
    <line x1="12" y1="40" x2="28" y2="40" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />

    {/* Red PDF Tag at Bottom */}
    <rect x="12" y="49" width="38" height="19" rx="4.5" fill="#EF4444" />
    <text
      x="31"
      y="63"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="10"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.6px"
    >
      PDF
    </text>
  </svg>
);

const DocDocumentIcon: React.FC<{ className?: string }> = ({ className = 'w-[62px] h-[76px]' }) => (
  <svg
    viewBox="0 0 62 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:scale-105 transition-transform duration-200 select-none shrink-0`}
  >
    <defs>
      <linearGradient id="doc-paper-grad" x1="0" y1="0" x2="62" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EEF2F6" />
      </linearGradient>
      <filter id="doc-fold-shadow" x="38" y="0" width="24" height="24" filterUnits="userSpaceOnUse">
        <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Main Paper Body with folded upper-right corner */}
    <path
      d="M 5 0 H 43 L 61 17 V 71 C 61 73.7614 58.7614 76 56 76 H 5 C 2.23858 76 0 73.7614 0 71 V 5 C 0 2.23858 2.23858 0 5 0 Z"
      fill="url(#doc-paper-grad)"
      stroke="#CBD5E1"
      strokeWidth="1.2"
    />

    {/* Fold Flap in upper-right corner */}
    <path
      d="M 43 0 V 13 C 43 15.2091 44.7909 17 47 17 H 61 L 43 0 Z"
      fill="#E2E8F0"
      stroke="#CBD5E1"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#doc-fold-shadow)"
    />

    {/* Preview Document Text Lines */}
    <line x1="12" y1="26" x2="32" y2="26" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <line x1="12" y1="33" x2="48" y2="33" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
    <line x1="12" y1="40" x2="28" y2="40" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />

    {/* Blue DOC Tag at Bottom */}
    <rect x="12" y="49" width="38" height="19" rx="4.5" fill="#2563EB" />
    <text
      x="31"
      y="63"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="10"
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
    <section id="resume-upload" className="py-24 sm:py-28 relative overflow-hidden bg-[#040712] scroll-mt-24">
      {/* Subtle constellation nodes on the right, matching Reference Image 2 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[340px] h-[400px] pointer-events-none opacity-25 hidden lg:block">
        <svg viewBox="0 0 340 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="280" cy="80" r="3" fill="#6366F1" opacity="0.6" />
          <circle cx="220" cy="140" r="3.5" fill="#818CF8" opacity="0.5" />
          <circle cx="310" cy="180" r="2.5" fill="#6366F1" opacity="0.4" />
          <circle cx="240" cy="240" r="4" fill="#A5B4FC" opacity="0.6" />
          <circle cx="290" cy="300" r="3" fill="#6366F1" opacity="0.5" />
          <circle cx="200" cy="320" r="2" fill="#818CF8" opacity="0.3" />
          <line x1="280" y1="80" x2="220" y2="140" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="220" y1="140" x2="310" y2="180" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="220" y1="140" x2="240" y2="240" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="240" y1="240" x2="290" y2="300" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="240" y1="240" x2="200" y2="320" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
        </svg>
      </div>

      {/* Subtle ambient magenta/purple glow at bottom-right edge, matching Reference Image 2 */}
      <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-purple-600/20 blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Section Header — Exact Wording, Typography & 3-Line Break from Reference Image 2 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-normal sm:font-medium text-white tracking-tight font-sans leading-[1.25] flex flex-col items-center justify-center gap-2 sm:gap-2.5 md:gap-3">
            <span>Check Resume score and</span>
            <span>feedback for free.</span>
          </h2>
          <p className="mt-5 text-[16px] sm:text-[18px] text-[#94a3b8] leading-[27px] max-w-[720px] mx-auto font-normal font-sans">
            We identify your resume&apos;s strengths, prioritize critical fixes, and help optimize
            <br className="hidden md:inline" /> it to meet ATS and recruiter expectations — improving your chances of
            <br className="hidden md:inline" /> getting shortlisted for interviews.
          </p>
        </motion.div>

        {/* ------------------------------------------------------------------
            STAGE 1: RESUME UPLOAD CARD — Precisely Matching Reference Image 2
        ------------------------------------------------------------------- */}
        {currentState === 'upload' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="mt-12 sm:mt-14 rounded-[20px] p-7 sm:p-8 w-full max-w-[570px] mx-auto relative select-none overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(20, 27, 46, 0.85) 0%, rgba(7, 11, 23, 0.98) 100%)',
              border: '1px solid rgba(110, 125, 160, 0.28)',
              boxShadow: '0 0 0 1px rgba(110, 125, 160, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Soft silver-white top border highlight line matching Image 2 */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-gradient-to-r from-transparent via-white/75 to-transparent" />

            {/* Soft ambient glass sheen beneath the top border */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[90px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12)_0%,rgba(140,170,220,0.05)_40%,transparent_75%)] rounded-t-[20px]" />

            {/* Card Heading — Two-line wrapping matching Reference Image 2 */}
            <h3 className="text-center text-[20px] sm:text-[22px] md:text-[23px] font-semibold text-[#F5F6FA] tracking-normal font-sans mb-6 sm:mb-7 leading-[1.38]">
              Upload Your Resume to See ATS Score and<br className="hidden sm:inline" /> Feedback
            </h3>

            {/* Inner Upload Drop Zone — Height ~258px, Rounded 11px, Dashed Border */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-[258px] box-border rounded-[11px] border border-dashed text-center transition-all duration-200 cursor-pointer relative select-none flex flex-col items-center justify-center p-4 sm:p-5 mx-auto group ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-950/25 scale-[1.01]'
                  : 'border-[rgba(110,125,160,0.30)] hover:border-[rgba(160,180,220,0.55)] bg-[rgba(15,20,37,0.55)] hover:bg-[rgba(18,25,48,0.7)]'
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

              {/* PDF and DOC File Icons side by side with slight illustrative tilt from Image 2 */}
              <div className="flex items-center justify-center gap-6 sm:gap-7 mb-4 select-none">
                <div className="-rotate-[3.5deg] hover:rotate-0 transition-transform duration-200">
                  <PdfDocumentIcon />
                </div>
                <div className="rotate-[3.5deg] hover:rotate-0 transition-transform duration-200">
                  <DocDocumentIcon />
                </div>
              </div>

              {/* Upload instruction text with underlined "Browse file" */}
              <p className="text-[17px] sm:text-[18.5px] md:text-[19px] font-medium text-[#F5F6FA] text-center tracking-normal">
                <span className="underline underline-offset-4 decoration-slate-400 hover:decoration-white transition-colors cursor-pointer">
                  Browse file
                </span>{' '}
                or drag and drop here
              </p>

              {/* Privacy Indicator Pill: compact dark badge with lock icon matching Image 2 */}
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#090e1e] border border-[rgba(110,125,160,0.25)] text-[12.5px] text-slate-300 select-none mt-3.5 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-slate-300 stroke-[1.8] shrink-0" />
                <span className="font-medium tracking-tight">100% Private. Always.</span>
              </div>
            </div>

            {/* Validation Error Message */}
            {fileError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Selected File Overview & Trigger Action */}
            {selectedFile && !fileError && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#090f23] border border-indigo-500/40 flex items-center justify-between gap-3">
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartUpload();
                    }}
                    variant="glow"
                    size="sm"
                    className="font-bold shadow-glow text-xs px-4"
                  >
                    Upload Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Subtle horizontal separator line */}
            <div className="mt-6 w-full h-px bg-[rgba(110,125,160,0.18)]" />

            {/* Format guidelines aligned to the left matching Image 2 */}
            <div className="pt-4 space-y-1 text-left text-[13.5px]">
              <div className="text-[#7E8B9F]">
                Supported Formats : <span className="font-bold text-[#F5F6FA]">PDF, DOC</span>
              </div>
              <div className="text-[#7E8B9F]">
                Maximum file size : <span className="font-bold text-[#F5F6FA]">2 MB</span>
              </div>

              {/* Quick Link to Dashboard for Authenticated Candidates */}
              {isAuthenticated && resumes.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentState('dashboard')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors"
                  >
                    View saved resumes ({resumes.length}) →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------
            STAGE 2: REAL UPLOAD & BACKEND PROCESSING
        ------------------------------------------------------------------- */}
        {currentState === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="mt-12 sm:mt-14 rounded-[20px] p-7 sm:p-8 w-full max-w-[570px] mx-auto shadow-2xl space-y-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(20, 27, 46, 0.85) 0%, rgba(7, 11, 23, 0.98) 100%)',
              border: '1px solid rgba(110, 125, 160, 0.28)',
              boxShadow: '0 0 0 1px rgba(110, 125, 160, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Top shining edge */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-gradient-to-r from-transparent via-white/75 to-transparent" />

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
