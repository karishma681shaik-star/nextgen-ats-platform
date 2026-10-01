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

      {/* ── CHOICE ── */}
      {modalMode === 'choice' && (
        <div className="relative w-full max-w-[800px] bg-[#0b0f1d] border border-white/[0.09] rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
          <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/[0.05]">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Create your resume</h2>
              <p className="text-xs text-slate-400 mt-0.5">Choose how you'd like to get started</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-8 pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upload card */}
            <div
              onClick={() => setModalMode('upload')}
              className="group flex flex-col rounded-2xl bg-[#10152a] border border-white/[0.07] hover:border-orange-500/50 hover:bg-[#13192e] hover:shadow-[0_12px_40px_rgba(234,88,12,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-[#1e1008] via-[#140e1a] to-[#0c0f1a] border-b border-white/[0.05] overflow-hidden flex items-center justify-center px-6">
                <div className="absolute top-0 left-1/4 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative w-full h-36 border border-dashed border-orange-500/35 rounded-xl flex items-center px-3 group-hover:border-orange-500/60 transition-colors">
                  <span className="absolute -top-2 -left-2 text-orange-500/60 font-mono text-xs font-bold select-none">+</span>
                  <span className="absolute -top-2 -right-2 text-orange-500/60 font-mono text-xs font-bold select-none">+</span>
                  <span className="absolute -bottom-2 -left-2 text-orange-500/60 font-mono text-xs font-bold select-none">+</span>
                  <span className="absolute -bottom-2 -right-2 text-orange-500/60 font-mono text-xs font-bold select-none">+</span>
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-2 shadow-[0_0_16px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-all">
                      <Upload className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Drop your resume here,</p>
                    <p className="text-xs text-slate-400 mt-0.5">or <span className="text-orange-400 underline decoration-orange-400/50">Browse</span></p>
                    <p className="text-[9px] text-slate-500 mt-2">PDF · DOC · DOCX · Max 10 MB</p>
                  </div>
                  <div className="absolute right-3 -bottom-2 w-24 h-32 bg-white rounded shadow-2xl rotate-6 border border-slate-200/80 p-2 group-hover:rotate-2 group-hover:scale-105 transition-all duration-300 pointer-events-none select-none flex flex-col justify-between overflow-hidden">
                    <div className="space-y-1"><div className="w-10 h-1.5 bg-slate-800 rounded" /><div className="w-14 h-1 bg-slate-400 rounded" /></div>
                    <div className="space-y-1 my-1">
                      {[1,0.9,1,0.85,1].map((w, i) => (<div key={i} className="h-0.5 rounded bg-slate-200" style={{ width: `${w*100}%` }} />))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="bg-[#ea384c] text-[6px] text-white font-black px-1.5 py-0.5 rounded tracking-widest">PDF</div>
                      <div className="-rotate-12 drop-shadow"><svg className="w-3.5 h-3.5 fill-orange-500" viewBox="0 0 24 24"><path d="M3 3l7 18 3-7 7-3L3 3z" /></svg></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Upload Resume</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Import & improve your existing resume with AI.</p>
                </div>
                <button type="button" className="self-start px-5 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#c2410c] hover:to-[#ea580c] text-white font-bold text-xs shadow-[0_4px_18px_rgba(234,88,12,0.4)] hover:shadow-[0_6px_26px_rgba(234,88,12,0.6)] transition-all hover:scale-[1.03] cursor-pointer">
                  Upload File
                </button>
              </div>
            </div>

            {/* Blank resume card */}
            <div
              onClick={handleCreateBlankResume}
              className="group flex flex-col rounded-2xl bg-[#10152a] border border-white/[0.07] hover:border-indigo-500/50 hover:bg-[#12172e] hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-[#0f1628] via-[#0c1022] to-[#0a0d1a] border-b border-white/[0.05] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18)_0%,transparent_65%)] pointer-events-none" />
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-24 h-24 rounded-full border border-indigo-500/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.12] via-indigo-500/20 to-blue-600/20 backdrop-blur-md border border-white/20 shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_1px_2px_rgba(255,255,255,0.35)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all duration-300">
                    <Plus className="w-8 h-8 text-white stroke-[2.5]" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">New Blank Resume <span className="text-indigo-400 text-base">✦</span></h3>
                  <p className="text-xs text-slate-400 mt-0.5">Start fresh with our AI-powered resume builder.</p>
                </div>
                <button type="button" className="self-start px-5 py-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#4338ca] hover:to-[#4f46e5] text-white font-bold text-xs shadow-[0_4px_18px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_26px_rgba(99,102,241,0.6)] transition-all hover:scale-[1.03] cursor-pointer">
                  Create New Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD DROPZONE ── */}
      {modalMode === 'upload' && (
        <div className="relative w-full max-w-[500px] bg-[#0b0f1d] border border-white/[0.09] rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
          <div className="flex items-center justify-between px-7 pt-6 pb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setModalMode('choice')} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer" aria-label="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight">Upload Your Resume</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-7 pt-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${isDragging ? 'border-indigo-400 bg-indigo-950/25 shadow-[0_0_30px_rgba(99,102,241,0.25)]' : 'border-white/15 bg-gradient-to-b from-[#13182b]/50 to-[#0d111e]/70 hover:border-indigo-500/50 hover:bg-[#151c31]/70'}`}
            >
              <div className="flex items-end justify-center gap-3 mb-6">
                <div className="w-12 h-16 bg-white rounded-lg shadow-xl p-1.5 flex flex-col justify-between border border-slate-200 group-hover:scale-105 group-hover:-rotate-6 transition-transform duration-300">
                  <div className="space-y-1"><div className="w-6 h-1 bg-slate-300 rounded" /><div className="w-8 h-0.5 bg-slate-200 rounded" /></div>
                  <div className="bg-[#ea384c] text-white text-[8px] font-black px-1 py-0.5 rounded tracking-widest text-center">PDF</div>
                </div>
                <div className="w-12 h-16 bg-white rounded-lg shadow-xl p-1.5 flex flex-col justify-between border border-slate-200 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
                  <div className="space-y-1"><div className="w-6 h-1 bg-slate-300 rounded" /><div className="w-8 h-0.5 bg-slate-200 rounded" /></div>
                  <div className="bg-[#2563eb] text-white text-[8px] font-black px-1 py-0.5 rounded tracking-widest text-center">DOC</div>
                </div>
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                <span className="underline decoration-white/50 hover:text-indigo-300 transition-colors">Browse</span> file or drag and drop here
              </p>
              <p className="text-[11px] text-slate-500 mb-5">PDF, DOC, DOCX · Max 10 MB</p>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Private. Always.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYZING (real backend-driven) ── */}
      {modalMode === 'analyzing' && (
        <div className="relative w-full max-w-[540px] bg-[#0b0f1d] border border-white/[0.09] rounded-3xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.9)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
          <div className="px-7 pt-7 pb-5">
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

          <div className="px-7 pb-5 space-y-4">
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

          <div className="px-7 pb-7 pt-1">
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
