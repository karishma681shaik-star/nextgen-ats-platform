import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText, Plus, CheckCircle2, Lock, ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { candidateService } from '../../services';
import { useToast } from '../../context/ToastContext';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'choice' | 'upload';
}

type ModalMode = 'choice' | 'upload' | 'analyzing';
type StageId = 1 | 2 | 3 | 4;
type StageStatus = 'pending' | 'active' | 'done';

interface Stage {
  id: StageId;
  title: string;
  subtitle: string;
}

const STAGES: Stage[] = [
  { id: 1, title: 'Structural Analysis',            subtitle: 'Identifying section headers and boundaries...' },
  { id: 2, title: 'Entity Extraction',              subtitle: 'Extracting contact info, education, skills, and experience...' },
  { id: 3, title: 'Career Timeline Reconstruction', subtitle: 'Building chronological work and project milestones...' },
  { id: 4, title: 'Skill & Impact Profiling',       subtitle: 'Mapping domain keywords and ATS competency weights...' },
];

const STAGE_PROGRESS: Record<StageId, number> = { 1: 10, 2: 38, 3: 72, 4: 92 };

// ── Image 3 Document Icons for Upload Dropzone ───────────────────────
const PdfDocumentIcon: React.FC<{ className?: string }> = ({ className = 'w-[62px] h-[76px]' }) => (
  <svg
    viewBox="0 0 62 76"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:scale-105 transition-transform duration-200 select-none shrink-0`}
  >
    <defs>
      <linearGradient id="modal-pdf-paper-grad" x1="0" y1="0" x2="62" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EEF2F6" />
      </linearGradient>
      <filter id="modal-pdf-fold-shadow" x="38" y="0" width="24" height="24" filterUnits="userSpaceOnUse">
        <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Main Paper Body with folded upper-right corner */}
    <path
      d="M 5 0 H 43 L 61 17 V 71 C 61 73.7614 58.7614 76 56 76 H 5 C 2.23858 76 0 73.7614 0 71 V 5 C 0 2.23858 2.23858 0 5 0 Z"
      fill="url(#modal-pdf-paper-grad)"
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
      filter="url(#modal-pdf-fold-shadow)"
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
      <linearGradient id="modal-doc-paper-grad" x1="0" y1="0" x2="62" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EEF2F6" />
      </linearGradient>
      <filter id="modal-doc-fold-shadow" x="38" y="0" width="24" height="24" filterUnits="userSpaceOnUse">
        <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Main Paper Body with folded upper-right corner */}
    <path
      d="M 5 0 H 43 L 61 17 V 71 C 61 73.7614 58.7614 76 56 76 H 5 C 2.23858 76 0 73.7614 0 71 V 5 C 0 2.23858 2.23858 0 5 0 Z"
      fill="url(#modal-doc-paper-grad)"
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
      filter="url(#modal-doc-fold-shadow)"
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

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'choice',
}) => {
  const navigate       = useNavigate();
  const { showToast }  = useToast();
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cancelledRef   = useRef(false);

  const [modalMode,    setModalMode]    = useState<ModalMode>('choice');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [progress,     setProgress]     = useState<number>(0);
  const [activeStage,  setActiveStage]  = useState<StageId>(1);
  const [doneStages,   setDoneStages]   = useState<Set<StageId>>(new Set());

  useEffect(() => {
    if (isOpen) { setModalMode(initialMode); setSelectedFile(null); resetAnalysis(); }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetAnalysis = () => {
    setProgress(0); setActiveStage(1); setDoneStages(new Set()); cancelledRef.current = false;
  };

  const markStageDone = (stage: StageId) =>
    setDoneStages(prev => new Set([...prev, stage]));

  const advanceTo = (stage: StageId, pct: number) => {
    setActiveStage(stage); setProgress(pct);
  };

  const animateProgress = (from: number, to: number, durationMs: number): Promise<void> =>
    new Promise(resolve => {
      const steps  = 30;
      const stepMs = durationMs / steps;
      const delta  = (to - from) / steps;
      let current  = from;
      let count    = 0;
      const id = setInterval(() => {
        if (cancelledRef.current) { clearInterval(id); return resolve(); }
        current += delta; count++;
        setProgress(Math.min(to, Math.round(current)));
        if (count >= steps) { clearInterval(id); resolve(); }
      }, stepMs);
    });

  const startAnalysisPipeline = async (file: File) => {
    resetAnalysis(); cancelledRef.current = false;
    try {
      // Stage 1 — upload in flight
      advanceTo(1, STAGE_PROGRESS[1]);
      const uploadPromise = candidateService.uploadResume(file);
      await animateProgress(STAGE_PROGRESS[1], 34, 1800);
      if (cancelledRef.current) return;
      const uploaded = await uploadPromise;
      if (cancelledRef.current) return;

      // Stage 2 — parse in flight
      markStageDone(1); advanceTo(2, STAGE_PROGRESS[2]);
      const parsePromise = candidateService.parseResume(uploaded.id);
      await animateProgress(STAGE_PROGRESS[2], 70, 2400);
      if (cancelledRef.current) return;

      // Stage 3 — parse completing
      markStageDone(2); advanceTo(3, STAGE_PROGRESS[3]);
      await animateProgress(STAGE_PROGRESS[3], 88, 1200);
      if (cancelledRef.current) return;
      const parsed = await parsePromise;
      if (cancelledRef.current) return;

      // Stage 4 — finalise
      markStageDone(3); advanceTo(4, STAGE_PROGRESS[4]);
      await animateProgress(STAGE_PROGRESS[4], 100, 800);
      if (cancelledRef.current) return;
      markStageDone(4); setProgress(100);

      await new Promise(r => setTimeout(r, 500));
      if (cancelledRef.current) return;

      showToast({ type: 'success', title: 'Resume Analysed & Structured!', message: 'Loaded into interactive editor workspace.' });
      if (onSuccess) onSuccess();
      onClose();
      navigate(`/candidate/resume-builder/${parsed.id}?tab=editor`);
    } catch (err) {
      if (cancelledRef.current) return;
      console.error('Analysis error:', err);
      showToast({ type: 'error', title: 'Analysis Failed', message: 'Unable to parse document. Please try again.' });
      setModalMode('upload'); resetAnalysis();
    }
  };

  const handleSelectFile = (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Maximum file size allowed is 10 MB.' }); return;
    }
    setSelectedFile(file); setModalMode('analyzing'); startAnalysisPipeline(file);
  };

  const handleCreateBlankResume = async () => {
    try {
      const newResume = await candidateService.createBlankResume();
      showToast({ type: 'success', title: 'Blank Resume Initialized', message: 'Redirecting to editor workspace.' });
      if (onSuccess) onSuccess(); onClose();
      navigate(`/candidate/resume-builder/${newResume.id}?tab=editor`);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Creation Failed', message: 'Could not create blank resume. Please try again.' });
    }
  };

  const handleCancelAnalysis = () => {
    cancelledRef.current = true; setModalMode('upload'); setSelectedFile(null); resetAnalysis();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleSelectFile(e.dataTransfer.files[0]);
  };

  const stageStatus = (id: StageId): StageStatus => {
    if (doneStages.has(id)) return 'done';
    if (activeStage === id) return 'active';
    return 'pending';
  };

  const StageIcon: React.FC<{ id: StageId }> = ({ id }) => {
    const s = stageStatus(id);
    if (s === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
    if (s === 'active') return (
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin flex-shrink-0" />
    );
    return <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex-shrink-0" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#040711]/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => modalMode !== 'analyzing' && onClose()}
      />
      <input
        type="file" ref={fileInputRef}
        onChange={e => { if (e.target.files?.[0]) handleSelectFile(e.target.files[0]); }}
        accept=".pdf,.doc,.docx" className="hidden"
      />

      {/* ── CHOICE (Image 1: Upgraded Brighter & Illuminated with Top Border Shine) ── */}
      {modalMode === 'choice' && (
        <div
          className="relative w-full max-w-[820px] rounded-[24px] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(99,102,241,0.25)] select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 27, 48, 0.96) 0%, rgba(9, 13, 26, 0.98) 100%)',
            border: '1px solid rgba(120, 140, 180, 0.35)',
          }}
        >
          {/* Luminous Silver-White Top Border Highlight Line matching Image 2 & 3 */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-20" />

          {/* Soft ambient glass sheen beneath the top border matching Image 2 & 3 */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[95px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.16)_0%,rgba(140,170,220,0.06)_40%,transparent_75%)] rounded-t-[24px] z-10" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/[0.08] relative z-20">
            <div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#F5F6FA] tracking-tight">Create your resume</h2>
              <p className="text-xs sm:text-[13px] text-slate-300/80 mt-0.5">Choose how you'd like to get started</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
            {/* Upload card (Brighter, vibrant warm amber glow & prominent white document) */}
            <div
              onClick={() => setModalMode('upload')}
              className="group flex flex-col rounded-2xl bg-[#12182e] border border-white/15 hover:border-orange-500/70 hover:bg-[#161d38] shadow-[0_12px_35px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_50px_rgba(234,88,12,0.3)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="relative h-52 bg-gradient-to-br from-[#2b160a] via-[#1d1226] to-[#10152a] border-b border-white/[0.08] overflow-hidden flex items-center justify-center px-6">
                {/* Ambient warm lighting bloom */}
                <div className="absolute top-0 left-1/4 w-48 h-48 bg-orange-500/25 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.18)_0%,transparent_70%)] pointer-events-none" />

                {/* Dotted border zone with corner crosshairs */}
                <div className="relative w-full h-40 border border-dashed border-orange-500/50 rounded-xl bg-orange-950/20 flex items-center px-4 group-hover:border-orange-400/80 group-hover:bg-orange-950/30 transition-all">
                  <span className="absolute -top-2.5 -left-2.5 text-orange-400 font-mono text-sm font-bold select-none">+</span>
                  <span className="absolute -top-2.5 -right-2.5 text-orange-400 font-mono text-sm font-bold select-none">+</span>
                  <span className="absolute -bottom-2.5 -left-2.5 text-orange-400 font-mono text-sm font-bold select-none">+</span>
                  <span className="absolute -bottom-2.5 -right-2.5 text-orange-400 font-mono text-sm font-bold select-none">+</span>
                  
                  {/* Left inner upload CTA */}
                  <div className="flex-1 flex flex-col items-center text-center pr-12">
                    <div className="w-10 h-10 rounded-full bg-orange-500/25 border border-orange-400/50 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(249,115,22,0.6)] transition-all">
                      <Upload className="w-5 h-5 text-orange-300" />
                    </div>
                    <p className="text-xs font-bold text-white">Drop your resume here,</p>
                    <p className="text-xs text-slate-300 mt-0.5">or <span className="text-orange-400 font-semibold underline underline-offset-2 decoration-orange-400/70">Browse</span></p>
                    <p className="text-[10px] text-slate-400 font-medium mt-2">PDF · DOC · DOCX · Max 10 MB</p>
                  </div>

                  {/* Overlapping Crisp White Resume Document (Prominent & bright, matching Image 1) */}
                  <div className="absolute right-3 -bottom-2 w-28 h-36 bg-white rounded-lg shadow-[0_16px_35px_rgba(0,0,0,0.5)] rotate-6 border border-slate-200 p-2.5 group-hover:rotate-2 group-hover:scale-105 transition-all duration-300 pointer-events-none select-none flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="w-12 h-2 bg-slate-900 rounded" />
                      <div className="w-16 h-1.5 bg-slate-400 rounded mt-1" />
                    </div>
                    <div className="space-y-1 my-1">
                      {[1, 0.9, 1, 0.85, 0.95].map((w, i) => (
                        <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${w * 100}%` }} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="bg-[#EF4444] text-[7.5px] text-white font-black px-2 py-0.5 rounded tracking-widest text-center shadow-sm">PDF</div>
                      <div className="-rotate-12 drop-shadow-md">
                        <svg className="w-4 h-4 fill-orange-500" viewBox="0 0 24 24"><path d="M3 3l7 18 3-7 7-3L3 3z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Section */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Upload Resume</h3>
                  <p className="text-xs text-slate-300/80 mt-1">Import & improve your existing resume with AI.</p>
                </div>
                <button
                  type="button"
                  className="self-start px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold text-xs shadow-[0_4px_22px_rgba(234,88,12,0.55)] hover:shadow-[0_6px_30px_rgba(234,88,12,0.75)] transition-all hover:scale-[1.03] cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Blank resume card (Brighter, vibrant luminous blue-indigo radial aura & glowing square) */}
            <div
              onClick={handleCreateBlankResume}
              className="group flex flex-col rounded-2xl bg-[#12182e] border border-white/15 hover:border-indigo-500/70 hover:bg-[#161d38] shadow-[0_12px_35px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_50px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="relative h-52 bg-gradient-to-br from-[#121c3b] via-[#0e1630] to-[#0a0f22] border-b border-white/[0.08] overflow-hidden flex items-center justify-center">
                {/* Radiant blue/indigo glow aura */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.38)_0%,rgba(59,130,246,0.18)_42%,transparent_72%)] pointer-events-none" />
                
                {/* Animated pulsing halos */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-40 h-40 rounded-full border border-indigo-400/20 animate-ping" style={{ animationDuration: '3.2s' }} />
                  <div className="absolute w-28 h-28 rounded-full border border-indigo-400/25 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.6s' }} />
                  
                  {/* Glowing Glass Icon Box with bold + symbol matching Image 1 */}
                  <div className="w-[84px] h-[84px] rounded-[20px] bg-gradient-to-br from-[#1c2448]/85 via-[#151c3d]/90 to-[#0d122b]/95 backdrop-blur-xl border border-[rgba(140,165,240,0.4)] shadow-[0_0_35px_rgba(99,102,241,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.35)] flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-300/80 group-hover:shadow-[0_0_55px_rgba(99,102,241,0.7)] transition-all duration-300">
                    <Plus className="w-8 h-8 text-white stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Lower Section */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    New Blank Resume <span className="text-indigo-400 text-lg">✦</span>
                  </h3>
                  <p className="text-xs text-slate-300/80 mt-1">Start fresh with our AI-powered resume builder.</p>
                </div>
                <button
                  type="button"
                  className="self-start px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6366f1] text-white font-bold text-xs shadow-[0_4px_22px_rgba(99,102,241,0.55)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.75)] transition-all hover:scale-[1.03] cursor-pointer"
                >
                  Create New Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD DROPZONE (Image 2: Made EXACTLY like Image 3 with top border shine & SVG icons) ── */}
      {modalMode === 'upload' && (
        <div
          className="relative w-full max-w-[540px] rounded-[24px] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(99,102,241,0.2)] select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 27, 46, 0.95) 0%, rgba(7, 11, 23, 0.98) 100%)',
            border: '1px solid rgba(110, 125, 160, 0.35)',
          }}
        >
          {/* Luminous Silver-White Top Border Highlight Line matching Image 2 & 3 */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-20" />

          {/* Soft ambient glass sheen beneath the top border matching Image 2 & 3 */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[90px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,rgba(140,170,220,0.06)_40%,transparent_75%)] rounded-t-[24px] z-10" />

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-2 relative z-20">
            <div className="flex items-center gap-2">
              <button onClick={() => setModalMode('choice')} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer" aria-label="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-[19px] font-semibold text-[#F5F6FA] tracking-normal">Upload Your Resume</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-7 pt-4 relative z-20">
            {/* Drop Zone with Image 3 styling */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full min-h-[258px] box-border rounded-[14px] border border-dashed text-center transition-all duration-200 cursor-pointer relative select-none flex flex-col items-center justify-center p-6 mx-auto group ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
                  : 'border-[rgba(110,125,160,0.32)] hover:border-[rgba(160,180,220,0.6)] bg-[rgba(15,20,37,0.65)] hover:bg-[rgba(18,25,48,0.75)]'
              }`}
            >
              {/* PDF and DOC File Icons side by side with slight illustrative tilt from Image 3 */}
              <div className="flex items-center justify-center gap-6 mb-4 select-none">
                <div className="-rotate-[3.5deg] group-hover:rotate-0 transition-transform duration-200">
                  <PdfDocumentIcon />
                </div>
                <div className="rotate-[3.5deg] group-hover:rotate-0 transition-transform duration-200">
                  <DocDocumentIcon />
                </div>
              </div>

              {/* Upload instruction text with underlined "Browse file" matching Image 3 */}
              <p className="text-[17px] font-medium text-[#F5F6FA] text-center tracking-normal">
                <span className="underline underline-offset-4 decoration-slate-400 hover:decoration-white transition-colors cursor-pointer">
                  Browse file
                </span>{' '}
                or drag and drop here
              </p>

              {/* Formats subtitle */}
              <p className="text-[11.5px] text-slate-400 mt-1 mb-4">PDF, DOC, DOCX · Max 10 MB</p>

              {/* Privacy Indicator Pill: compact dark badge with lock icon matching Image 2 & 3 */}
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-[#090e1e] border border-[rgba(110,125,160,0.25)] text-[12.5px] text-slate-300 select-none shadow-sm">
                <Lock className="w-3.5 h-3.5 text-slate-300 stroke-[1.8] shrink-0" />
                <span className="font-medium tracking-tight">100% Private. Always.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYZING (Illuminated with matching top border shine) ── */}
      {modalMode === 'analyzing' && (
        <div
          className="relative w-full max-w-[540px] rounded-[24px] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(99,102,241,0.25)] select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 27, 46, 0.95) 0%, rgba(7, 11, 23, 0.98) 100%)',
            border: '1px solid rgba(110, 125, 160, 0.35)',
          }}
        >
          {/* Luminous Silver-White Top Border Highlight Line */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-20" />

          {/* Soft ambient glass sheen beneath the top border */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[90px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,rgba(140,170,220,0.06)_40%,transparent_75%)] rounded-t-[24px] z-10" />

          <div className="px-7 pt-7 pb-5 relative z-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-white truncate max-w-[280px]">
                  Analysing "{selectedFile?.name || 'Resume.pdf'}"
                </h2>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                <Sparkles className="w-3 h-3" /> AI
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-white/[0.04]">
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #818cf8, #6366f1)',
                  boxShadow: '0 0 14px rgba(99,102,241,0.7)',
                  transition: 'width 300ms ease-out',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 1.4s infinite linear', backgroundSize: '200% 100%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-400">{progress}% Analysed</p>
              <p className="text-[10px] text-slate-500">
                {activeStage === 1 && progress < 100 && 'Uploading document…'}
                {activeStage === 2 && 'Parsing content…'}
                {activeStage === 3 && 'Reconstructing timeline…'}
                {activeStage === 4 && progress < 100 && 'Profiling skills…'}
                {progress >= 100 && 'Complete!'}
              </p>
            </div>
          </div>

          <div className="px-7 pb-5 space-y-4 relative z-20">
            {STAGES.map(stage => {
              const s = stageStatus(stage.id);
              return (
                <div key={stage.id} className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {s === 'done'
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      : s === 'active'
                        ? <div className="w-5 h-5 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin flex-shrink-0" />
                        : <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex-shrink-0" />
                    }
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold leading-tight transition-colors ${s !== 'pending' ? 'text-white' : 'text-slate-500'}`}>
                      {stage.title}
                    </h4>
                    <p className={`text-xs mt-0.5 leading-relaxed transition-colors ${s === 'active' ? 'text-indigo-300' : s === 'done' ? 'text-emerald-400/80' : 'text-slate-600'}`}>
                      {s === 'done' ? 'Completed ✓' : stage.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-7 pb-7 pt-1 relative z-20">
            <button
              onClick={handleCancelAnalysis}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-950/60 to-rose-950/60 hover:from-red-900/80 hover:to-rose-900/80 border border-red-800/40 text-red-300 text-xs font-semibold tracking-wide transition-all hover:text-red-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
};
