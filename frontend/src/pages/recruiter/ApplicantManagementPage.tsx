import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Columns3,
  List,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Calendar,
  Video,
  Copy,
  Check,
  Flame,
  X,
  GitCompare,
  BarChart3,
  ChevronDown,
  Send,
  ExternalLink,
  Award,
  Zap,
  Filter,
  SlidersHorizontal,
  Radio,
  RefreshCw,
  Briefcase,
  Target,
  Compass,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Plus,
  Edit3,
  Edit2,
  Trash2,
  Sliders,
  AlertTriangle,
  Layers,
  Settings,
  ShieldCheck,
  Eye,
  Star,
  XCircle
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Application, ApplicationStatus, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DepthCard } from '../../components/ui/DepthCard';
import { cn } from '../../utils/cn';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';
import { INITIAL_JOBS } from '../../data/mockData';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'Under Review',
  'Shortlisted',
  'Interview',
  'Applied',
  'Selected',
  'Rejected'
];

export const getStageIcon = (stage: ApplicationStatus | string) => {
  switch (stage) {
    case 'Under Review':
      return Eye;
    case 'Shortlisted':
      return Award;
    case 'Interview':
      return UserCheck;
    case 'Applied':
      return Clock;
    case 'Selected':
      return ShieldCheck;
    case 'Rejected':
      return XCircle;
    default:
      return Users;
  }
};

const STAGE_CONFIG: Record<
  ApplicationStatus,
  {
    bg: string;
    border: string;
    dot: string;
    text: string;
    glow: string;
    headerBg: string;
  }
> = {
  Applied: {
    bg: 'bg-indigo-950/20',
    border: 'border-indigo-500/25',
    dot: 'bg-indigo-400',
    text: 'text-indigo-300',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    headerBg: 'bg-gradient-to-r from-indigo-900/40 to-indigo-950/20'
  },
  'Under Review': {
    bg: 'bg-purple-950/20',
    border: 'border-purple-500/25',
    dot: 'bg-purple-400',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    headerBg: 'bg-gradient-to-r from-purple-900/40 to-purple-950/20'
  },
  Shortlisted: {
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    headerBg: 'bg-gradient-to-r from-cyan-900/40 to-cyan-950/20'
  },
  Interview: {
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    headerBg: 'bg-gradient-to-r from-amber-900/40 to-amber-950/20'
  },
  Selected: {
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    headerBg: 'bg-gradient-to-r from-emerald-900/40 to-emerald-950/20'
  },
  Rejected: {
    bg: 'bg-rose-950/15',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    headerBg: 'bg-gradient-to-r from-rose-900/30 to-rose-950/15'
  }
};

// ─── LUXURY EXECUTIVE STUDIO BACKGROUND (Linear / Vercel Tier-1 Luxury) ───────
const Pipeline3DAnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width * 0.5, y: height * 0.35, targetX: width * 0.5, targetY: height * 0.35, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => { mouse.active = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Fine, non-distracting ambient stardust
    const dustParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.15 - Math.random() * 0.25,
      alpha: 0.2 + Math.random() * 0.45,
      hue: [215, 235, 260][Math.floor(Math.random() * 3)],
    }));

    let t = 0;

    const render = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Deep obsidian executive backdrop
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0,   '#080a10');
      baseGrad.addColorStop(0.5, '#0b0f19');
      baseGrad.addColorStop(1,   '#06080e');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Precision Dot-Matrix Grid with Mouse Spotlight
      const dotSpacing = 36;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          const dist = mouse.active ? Math.hypot(x - mouse.x, y - mouse.y) : 999;
          const spotlight = dist < 260 ? (1 - dist / 260) : 0;
          const baseAlpha = 0.05;
          const totalAlpha = baseAlpha + spotlight * 0.35;

          if (totalAlpha > 0.04) {
            ctx.beginPath();
            ctx.arc(x, y, 0.9 + spotlight * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = spotlight > 0.08
              ? `rgba(129, 140, 248, ${totalAlpha})`
              : `rgba(148, 163, 184, ${totalAlpha})`;
            ctx.fill();
          }
        }
      }

      // Soft Organic Studio Light Blooms
      const blooms = [
        { cx: width * 0.22, cy: height * 0.18, r: 420, hue: 235, sat: 80, light: 55, alpha: 0.08, driftX: 35, driftY: 20, speed: 0.3 },
        { cx: width * 0.82, cy: height * 0.28, r: 440, hue: 265, sat: 75, light: 50, alpha: 0.07, driftX: -30, driftY: 30, speed: 0.25 },
        { cx: width * 0.50, cy: height * 0.82, r: 480, hue: 210, sat: 85, light: 48, alpha: 0.075, driftX: 30, driftY: -20, speed: 0.3 },
      ];

      blooms.forEach(b => {
        const ox = b.cx + Math.sin(t * b.speed) * b.driftX;
        const oy = b.cy + Math.cos(t * b.speed * 0.8) * b.driftY;
        const bg = ctx.createRadialGradient(ox, oy, 0, ox, oy, b.r);
        bg.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${b.alpha})`);
        bg.addColorStop(0.5, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${b.alpha * 0.4})`);
        bg.addColorStop(1, 'transparent');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(ox, oy, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cursor Specular Halo
      if (mouse.active) {
        const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
        halo.addColorStop(0,   'rgba(99, 102, 241, 0.14)');
        halo.addColorStop(0.4, 'rgba(139, 92, 246, 0.06)');
        halo.addColorStop(1,   'transparent');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 240, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fine Stardust Particles
      dustParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = height + 5; p.x = Math.random() * width; }
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${p.alpha * 0.55})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return null;
};

// ─── Recruiter Edit Candidate & ATS Score Modal ──────────────────────────────
const EditCandidateModal: React.FC<{
  applicant: Application;
  onClose: () => void;
  onSave: (appId: string, newScore: number, newStatus: ApplicationStatus, note?: string) => Promise<void>;
  onDelete: (app: Application) => void;
}> = ({ applicant, onClose, onSave, onDelete }) => {
  const [score, setScore] = useState<number>(applicant.atsScore || 85);
  const [status, setStatus] = useState<ApplicationStatus>(applicant.status);
  const [evalNote, setEvalNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const getScoreBadge = (val: number) => {
    if (val >= 90) return { label: 'Elite Match (Top 5%)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    if (val >= 80) return { label: 'Strong Fit (Recommended)', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' };
    if (val >= 70) return { label: 'Moderate Fit (Review Skills)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    return { label: 'Below Target (<70%)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
  };

  const badge = getScoreBadge(score);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(applicant.id, score, status, evalNote.trim() || undefined);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Candidate & Manual ATS Score"
      description={`Manually adjust qualification score and recruitment status for ${applicant.candidateName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Candidate Summary Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/50 to-slate-900/90 border border-cyan-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-base font-black text-white shrink-0 shadow-lg">
              {applicant.candidateName?.[0]}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-white truncate">{applicant.candidateName}</h4>
              <p className="text-xs text-cyan-300 font-semibold truncate">{applicant.jobTitle}</p>
              <p className="text-[11px] text-slate-400 truncate">{applicant.candidateEmail}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={cn('text-xs font-black px-2.5 py-1 rounded-full border', badge.color)}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Recruiter Manual ATS Score Setting */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/25 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs font-black text-white uppercase tracking-wider block">
                  Recruiter ATS Score (0 - 100%)
                </label>
                <p className="text-[10px] text-slate-400">
                  Manually calibrate and override candidate's ATS match index
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-20 px-3 py-1.5 text-center font-black text-lg bg-black/60 border border-cyan-400/40 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              />
              <span className="text-sm font-extrabold text-slate-400">%</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
              <span>0% (Disqualified)</span>
              <span>50% (Baseline)</span>
              <span>75% (Target)</span>
              <span>100% (Perfect)</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5">
          <label className="text-xs font-black text-white uppercase tracking-wider block">
            Pipeline Stage / Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PIPELINE_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer',
                  status === s
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-400 border-white/[0.08] hover:text-white hover:border-slate-600'
                )}
              >
                {getStageTitle(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Private Recruiter Evaluation Notes */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
          <label className="text-xs font-black text-white uppercase tracking-wider block">
            Recruiter Evaluation / Interview Note
          </label>
          <textarea
            rows={3}
            value={evalNote}
            onChange={(e) => setEvalNote(e.target.value)}
            placeholder="Add interview assessment notes, technical feedback, or compensation notes..."
            className="w-full bg-black/40 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(applicant);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Candidate
          </button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              type="submit"
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// ─── Side-by-Side Candidate Comparison Modal ──────────────────────────────────
const CandidateComparisonModal: React.FC<{
  candidates: Application[];
  onClose: () => void;
}> = ({ candidates, onClose }) => {
  if (candidates.length < 2) return null;
  const [c1, c2] = candidates;

  const allSkills = Array.from(new Set([...(c1.skills || []), ...(c2.skills || [])]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative w-full max-w-4xl bg-[#090f24] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 text-white max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4.5 bg-[#0a112c] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <GitCompare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Candidate Comparison</h3>
              <p className="text-xs text-slate-400">Side-by-side ATS match metrics & skills evaluation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[c1, c2].map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center text-lg font-black text-white shrink-0">
                    {c.candidateName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{c.candidateName}</h4>
                    <p className="text-xs text-cyan-300 font-semibold truncate">{c.jobTitle}</p>
                    <p className="text-[10px] text-slate-400">{c.candidateLocation}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">ATS Score:</span>
                  <span
                    className={cn(
                      'text-xl font-black',
                      (c.atsScore || 0) >= 90
                        ? 'text-emerald-400'
                        : (c.atsScore || 0) >= 80
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    )}
                  >
                    {c.atsScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Skill Coverage & Overlap ({allSkills.length} Total Detected)
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {allSkills.map((skill) => {
                const has1 = c1.skills?.includes(skill);
                const has2 = c2.skills?.includes(skill);
                return (
                  <div
                    key={skill}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] grid grid-cols-3 items-center text-xs"
                  >
                    <div className="flex items-center justify-center">
                      {has1 ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Missing</span>
                      )}
                    </div>
                    <div className="text-center font-extrabold text-white">{skill}</div>
                    <div className="flex items-center justify-center">
                      {has2 ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Missing</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const getStageTitle = (stage: ApplicationStatus): string => {
  if (stage === 'Interview') return 'Ready for Interview';
  return stage;
};

// ─── Main Applicant Pipeline Component ─────────────────────────────────────────
export const ApplicantManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialJobId = searchParams.get('jobId') || 'All';

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [minAts, setMinAts] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(true);

  const [activeApplicant, setActiveApplicant] = useState<Application | null>(null);
  const [newNote, setNewNote] = useState('');
  const [compareSelection, setCompareSelection] = useState<Application[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Recruiter Edit & Delete State
  const [editingApplicant, setEditingApplicant] = useState<Application | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Application | null>(null);
  const [requisitionToDelete, setRequisitionToDelete] = useState<Job | null>(null);
  const [isDeletingApplicant, setIsDeletingApplicant] = useState(false);
  const [isDeletingRequisition, setIsDeletingRequisition] = useState(false);

  const { showToast } = useToast();

  // Keep search term in sync with query parameter
  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch !== null && querySearch !== searchTerm) {
      setSearchTerm(querySearch);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const isDummyOrSimulated = (a: Application) => {
    if (!a) return true;
    const name = (a.candidateName || '').trim().toLowerCase();
    const id = (a.id || '').toLowerCase();
    return (
      id.startsWith('sim-') ||
      id.startsWith('mock-') ||
      id.startsWith('app-man-') ||
      id.startsWith('app-priya') ||
      id.startsWith('app-david') ||
      id.startsWith('app-elena') ||
      id.startsWith('app-marcus') ||
      id.startsWith('app-alex') ||
      id.startsWith('app-carlos') ||
      id.startsWith('app-liam') ||
      name === 'dr. kimberly vance' ||
      name === 'kimberly vance' ||
      name === 'aditya narayan' ||
      name === 'alex rivera' ||
      name === 'elena gilbert' ||
      name.includes('elena gilbert') ||
      name === 'candidate' ||
      name === 'test candidate' ||
      name === 'priya sharma' ||
      name === 'david chen' ||
      name === 'elena rostova' ||
      name === 'marcus johnson' ||
      name === 'aisha patel' ||
      name === 'liang wei' ||
      name === 'sofia martínez' ||
      name === 'oliver schmidt' ||
      name === 'yuki tanaka' ||
      name === 'carlos mendez' ||
      name === "liam o'connor"
    );
  };

  const loadPipelineData = async () => {
    try {
      setIsLoading(true);

      // Scrub local storage of any legacy simulated/dummy candidates
      try {
        const stored = localStorage.getItem('ai_ats_applications_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((a) => !isDummyOrSimulated(a));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('ai_ats_applications_v1', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

      const [appsData, postedJobs] = await Promise.all([
        recruiterService.getAllApplicants().catch(() => [] as Application[]),
        recruiterService.getPostedJobs().catch(() => [] as Job[])
      ]);

      // Helper to identify legacy seeded default/mock jobs
      const isDefaultJob = (title?: string) => {
        const t = (title || '').trim().toLowerCase();
        return (
          t === 'senior full stack engineer (java + react)' ||
          t === 'lead ai/ml platform architect' ||
          t === 'senior ai platform engineer' ||
          t === 'senior full stack software engineer' ||
          t === 'backend java / distributed systems engineer' ||
          t === 'ai / ml research scientist' ||
          t === 'devops & cloud infrastructure lead'
        );
      };

      // Only real posted requisitions created manually by the recruiter — never default/seeded jobs
      const resolvedJobs = (postedJobs || []).filter((j) => !isDefaultJob(j.title));

      // Only real applicants who genuinely submitted applications or were manually registered
      const realApplicants = (appsData || []).filter((a) => !isDummyOrSimulated(a));

      setJobs(resolvedJobs);
      setApplicants(realApplicants);
    } catch (err) {
      console.error('Failed to load applicant pipeline', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Recruiter sets manual ATS score and updates status/notes
  const handleSaveCandidate = async (
    appId: string,
    newScore: number,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    try {
      await recruiterService.updateAtsScore(appId, newScore).catch(() => null);
      if (newStatus) {
        await recruiterService.updateApplicantStatus(appId, newStatus, note).catch(() => null);
      } else if (note) {
        await recruiterService.addApplicantNote(appId, note).catch(() => null);
      }

      setApplicants((prev) =>
        prev.map((a) => {
          if (a.id !== appId) return a;
          return {
            ...a,
            atsScore: newScore,
            matchPercentage: newScore,
            status: newStatus,
            notes: note ? [note, ...(a.notes || [])] : a.notes
          };
        })
      );

      if (activeApplicant?.id === appId) {
        setActiveApplicant((prev) =>
          prev
            ? {
                ...prev,
                atsScore: newScore,
                matchPercentage: newScore,
                status: newStatus,
                notes: note ? [note, ...(prev.notes || [])] : prev.notes
              }
            : null
        );
      }

      showToast({
        type: 'success',
        title: 'Candidate Updated',
        message: `ATS score set to ${newScore}% and stage set to "${newStatus}".`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save candidate changes.' });
    }
  };

  // Recruiter permanently deletes candidate from interview pipeline
  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    try {
      setIsDeletingApplicant(true);
      await recruiterService.deleteApplicant(candidateToDelete.id).catch(() => null);

      setApplicants((prev) => prev.filter((a) => a.id !== candidateToDelete.id));

      if (activeApplicant?.id === candidateToDelete.id) {
        setActiveApplicant(null);
      }
      if (editingApplicant?.id === candidateToDelete.id) {
        setEditingApplicant(null);
      }

      showToast({
        type: 'info',
        title: 'Candidate Removed',
        message: `${candidateToDelete.candidateName} has been deleted from the pipeline.`
      });
      setCandidateToDelete(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to remove candidate.' });
    } finally {
      setIsDeletingApplicant(false);
    }
  };

  // Recruiter deletes job requisition
  const handleConfirmDeleteRequisition = async () => {
    if (!requisitionToDelete) return;
    try {
      setIsDeletingRequisition(true);
      await jobService.deleteJob(requisitionToDelete.id).catch(() => null);

      setJobs((prev) => prev.filter((j) => j.id !== requisitionToDelete.id));
      if (selectedJobId === requisitionToDelete.id) {
        setSelectedJobId('All');
      }

      showToast({
        type: 'info',
        title: 'Requisition Deleted',
        message: `Requisition "${requisitionToDelete.title}" removed.`
      });
      setRequisitionToDelete(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete requisition.' });
    } finally {
      setIsDeletingRequisition(false);
    }
  };

  // 1-Click Update Pipeline Stage
  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await recruiterService.updateApplicantStatus(appId, newStatus).catch(() => null);

      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );

      if (activeApplicant?.id === appId) {
        setActiveApplicant((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      showToast({
        type: 'success',
        title: 'Stage Updated',
        message: `Candidate moved to "${newStatus}" stage.`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update status.' });
    }
  };

  // Add Recruiter Evaluation Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplicant || !newNote.trim()) return;
    try {
      await recruiterService.addApplicantNote(activeApplicant.id, newNote.trim()).catch(() => null);
      const updatedNotes = [newNote.trim(), ...(activeApplicant.notes || [])];

      setApplicants((prev) =>
        prev.map((a) => (a.id === activeApplicant.id ? { ...a, notes: updatedNotes } : a))
      );
      setActiveApplicant((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
      setNewNote('');

      showToast({ type: 'info', title: 'Note Saved', message: 'Private recruiter note recorded.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save note.' });
    }
  };

  // Toggle candidate comparison
  const toggleCompareSelect = (app: Application) => {
    setCompareSelection((prev) => {
      if (prev.find((a) => a.id === app.id)) return prev.filter((a) => a.id !== app.id);
      if (prev.length >= 2) return [prev[1], app];
      return [...prev, app];
    });
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedJobId('All');
    setStatusFilter('All');
    setMinAts(0);
    setSearchParams({});
  };

  // Filtered candidate list
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      if (selectedJobId !== 'All' && app.jobId !== selectedJobId) return false;
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (minAts > 0 && (app.atsScore || 0) < minAts) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          app.candidateName.toLowerCase().includes(q) ||
          app.jobTitle.toLowerCase().includes(q) ||
          app.candidateEmail.toLowerCase().includes(q) ||
          app.skills?.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [applicants, selectedJobId, statusFilter, minAts, searchTerm]);

  // Executive summary metrics
  const avgMatchScore = useMemo(() => {
    if (applicants.length === 0) return 0;
    const total = applicants.reduce((acc, a) => acc + (a.atsScore || 0), 0);
    return (total / applicants.length).toFixed(1);
  }, [applicants]);

  const underReviewCount = useMemo(
    () => applicants.filter((a) => a.status === 'Under Review').length,
    [applicants]
  );
  const shortlistedCount = useMemo(
    () => applicants.filter((a) => a.status === 'Shortlisted').length,
    [applicants]
  );
  const interviewCount = useMemo(
    () => applicants.filter((a) => a.status === 'Interview').length,
    [applicants]
  );
  const appliedCount = useMemo(
    () => applicants.filter((a) => a.status === 'Applied').length,
    [applicants]
  );
  const selectedCount = useMemo(
    () => applicants.filter((a) => a.status === 'Selected').length,
    [applicants]
  );
  const rejectedCount = useMemo(
    () => applicants.filter((a) => a.status === 'Rejected').length,
    [applicants]
  );

  const renderTableRow = (app: Application) => {
    const badge = getStatusBadgeStyle(app.status);
    const score = app.atsScore || 88;

    return (
      <tr
        key={app.id}
        className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
        onClick={() => setActiveApplicant(app)}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md">
              {app.candidateName?.[0]}
            </div>
            <div>
              <p className="font-extrabold text-white text-xs group-hover:text-cyan-300 transition-colors">
                {app.candidateName}
              </p>
              <p className="text-[10px] text-slate-400">{app.candidateEmail}</p>
            </div>
          </div>
        </td>

        <td className="px-5 py-4 font-bold text-slate-200">{app.jobTitle}</td>

        <td className="px-5 py-4">
          <span
            className={cn(
              'font-black text-sm',
              score >= 90
                ? 'text-emerald-400'
                : score >= 80
                ? 'text-cyan-400'
                : 'text-amber-400'
            )}
          >
            {score}/100
          </span>
        </td>

        {/* In-row interactive stage selector: Review, Shortlisted, Interview, etc. */}
        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
            className={cn(
              'px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] border bg-slate-900/90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-sm',
              badge
            )}
          >
            {PIPELINE_STAGES.map((st) => (
              <option key={st} value={st} className="bg-slate-900 text-white font-semibold">
                {getStageTitle(st)}
              </option>
            ))}
          </select>
        </td>

        <td className="px-5 py-4 text-slate-400 text-[11px]">
          {formatFullDate(app.appliedDate)}
        </td>

        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1.5">
            {/* Edit ATS Score & Status */}
            <button
              id={`table-edit-btn-${app.id}`}
              type="button"
              onClick={() => setEditingApplicant(app)}
              title="Edit Candidate & ATS Score"
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Edit Score
            </button>

            {/* Ready for Interview action */}
            {app.status === 'Interview' ? (
              <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Ready
              </span>
            ) : (
              <button
                id={`table-ready-btn-${app.id}`}
                type="button"
                onClick={() => handleStatusChange(app.id, 'Interview')}
                title="Mark Candidate Ready for Interview"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3 h-3" /> Mark Ready
              </button>
            )}

            {/* Delete Candidate */}
            <button
              id={`table-delete-btn-${app.id}`}
              type="button"
              onClick={() => setCandidateToDelete(app)}
              title="Delete Candidate"
              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 text-[10px] font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Review Details */}
            <button
              id={`table-review-btn-${app.id}`}
              type="button"
              onClick={() => setActiveApplicant(app)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08] hover:text-white text-[10px] font-bold transition-all cursor-pointer"
            >
              Review
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="relative min-h-screen space-y-7 pb-16">
      {/* ── 3D Animated Floating Elements Layer ────────────────────────────── */}
      <Pipeline3DAnimatedBackground />

      <div className="relative z-10 space-y-7">
        {/* ── Page Header with Live Pulse & Sourcing Controls ──────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Intelligent Neural Talent Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Applicant Pipeline 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80">
              Tracking <span className="font-extrabold text-cyan-300">{filteredApplicants.length}</span>{' '}
              evaluated candidates across {PIPELINE_STAGES.length} stages of recruitment.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Compare 2 candidates trigger */}
            {compareSelection.length === 2 && (
              <button
                type="button"
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white text-xs font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <GitCompare className="w-4 h-4" />
                Compare Selected (2)
              </button>
            )}

            {compareSelection.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareSelection([])}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Clear ({compareSelection.length})
              </button>
            )}

            {/* View Mode Toggle: Kanban vs Table */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-white/[0.08] rounded-xl backdrop-blur-md shadow-lg">
              {[
                { mode: 'kanban' as const, icon: <Columns3 className="w-3.5 h-3.5" />, label: 'Kanban', id: 'view-mode-kanban' },
                { mode: 'table' as const, icon: <List className="w-3.5 h-3.5" />, label: 'Table', id: 'view-mode-table' }
              ].map((v) => (
                <button
                  key={v.mode}
                  id={v.id}
                  type="button"
                  onClick={() => setViewMode(v.mode)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer',
                    viewMode === v.mode
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {v.icon}
                  <span>{v.label}</span>
                </button>
              ))}
            </div>

            <Button
              variant="glow"
              size="sm"
              leftIcon={<Copy className="w-4 h-4" />}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/jobs`);
                showToast({
                  type: 'success',
                  title: 'Career Portal Link Copied',
                  message: 'Public candidate application URL copied to clipboard.'
                });
              }}
              className="shadow-[0_0_18px_rgba(6,182,212,0.35)]"
            >
              Share Portal Link
            </Button>

            <Link to="/recruiter/jobs/new">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                className="border-white/10"
              >
                New Requisition
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Executive Metrics Summary Bar (Clickable Stage Filters) ────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Total in Flow */}
          <div
            id="metric-card-all"
            onClick={() => setStatusFilter('All')}
            className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-b from-[#101738]/80 to-[#0b1026]/80 border backdrop-blur-xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all",
              statusFilter === 'All'
                ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'border-indigo-500/20 hover:border-indigo-400/40'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total In Flow
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white">{applicants.length}</span>
                {applicants.length > 0 && (
                  <span className="text-[10px] font-bold text-cyan-400">({avgMatchScore}% ATS)</span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Under Review */}
          <div
            id="metric-card-review"
            onClick={() => setStatusFilter('Under Review')}
            className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-b from-[#101738]/80 to-[#0b1026]/80 border backdrop-blur-xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all",
              statusFilter === 'Under Review'
                ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'border-purple-500/20 hover:border-purple-400/40'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Under Review
              </p>
              <p className="text-xl font-black text-purple-300">{underReviewCount}</p>
            </div>
          </div>

          {/* 3. Shortlisted */}
          <div
            id="metric-card-shortlisted"
            onClick={() => setStatusFilter('Shortlisted')}
            className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-b from-[#101738]/80 to-[#0b1026]/80 border backdrop-blur-xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all",
              statusFilter === 'Shortlisted'
                ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'border-cyan-500/20 hover:border-cyan-400/40'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Shortlisted
              </p>
              <p className="text-xl font-black text-cyan-300">{shortlistedCount}</p>
            </div>
          </div>

          {/* 4. Ready for Interview */}
          <div
            id="metric-card-interview"
            onClick={() => setStatusFilter('Interview')}
            className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-b from-[#101738]/80 to-[#0b1026]/80 border backdrop-blur-xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all",
              statusFilter === 'Interview'
                ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'border-amber-500/20 hover:border-amber-400/40'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ready for Interview
              </p>
              <p className="text-xl font-black text-amber-300">{interviewCount}</p>
            </div>
          </div>
        </div>

        {/* ── Stage Filter / Navigation Tabs (Review, Shortlisted, Ready for Interview, etc.) ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { label: 'All Candidates', value: 'All', count: applicants.length, icon: Users, color: 'text-indigo-300', dot: 'bg-indigo-400' },
            { label: 'Under Review', value: 'Under Review', count: underReviewCount, icon: Eye, color: 'text-purple-300', dot: 'bg-purple-400' },
            { label: 'Shortlisted', value: 'Shortlisted', count: shortlistedCount, icon: Award, color: 'text-cyan-300', dot: 'bg-cyan-400' },
            { label: 'Ready for Interview', value: 'Interview', count: interviewCount, icon: UserCheck, color: 'text-amber-300', dot: 'bg-amber-400' },
            { label: 'Applied', value: 'Applied', count: appliedCount, icon: Clock, color: 'text-blue-300', dot: 'bg-blue-400' },
            { label: 'Selected', value: 'Selected', count: selectedCount, icon: ShieldCheck, color: 'text-emerald-300', dot: 'bg-emerald-400' },
            { label: 'Rejected', value: 'Rejected', count: rejectedCount, icon: XCircle, color: 'text-rose-300', dot: 'bg-rose-400' },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.value}
                id={`stage-tab-${tab.value.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border backdrop-blur-md',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-purple-600/30 border-cyan-400 text-white shadow-[0_0_16px_rgba(6,182,212,0.35)] scale-[1.02]'
                    : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-slate-800/60'
                )}
              >
                <div className={cn('w-2 h-2 rounded-full', tab.dot)} />
                <IconComp className={cn('w-3.5 h-3.5', isActive ? 'text-cyan-400' : tab.color)} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-extrabold border',
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Advanced Filter & Search Hub ────────────────────────────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#101633]/90 via-[#0d122b]/90 to-[#090d20]/90 border border-cyan-500/25 shadow-2xl backdrop-blur-2xl space-y-3 relative overflow-hidden">
          {/* Specular top highlight */}
          <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search query input */}
            <div className="sm:col-span-2 relative">
              <Input
                placeholder="Search candidates by name, skills, title, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchParams(e.target.value ? { search: e.target.value } : {});
                }}
                leftIcon={<Search className="w-4 h-4 text-cyan-400" />}
                className="bg-slate-900/90 border-slate-700/80 focus:border-cyan-400 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchParams({});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Requisition Dropdown (Connected to platform jobs!) */}
            <div>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-200 text-xs rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 transition-all font-semibold"
              >
                <option value="All">All Requisitions ({jobs.length})</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applicantCount || 12})
                  </option>
                ))}
              </select>
            </div>

            {/* Min ATS Score Filter */}
            <div>
              <select
                value={minAts}
                onChange={(e) => setMinAts(Number(e.target.value))}
                className="w-full bg-slate-900/90 text-slate-200 text-xs rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 transition-all font-semibold"
              >
                <option value={0}>Any ATS Score</option>
                <option value={70}>Min 70+ (Good Match)</option>
                <option value={80}>Min 80+ (Strong Match)</option>
                <option value={90}>Min 90+ (Elite Top Match)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>Showing {filteredApplicants.length} candidate results</span>
              {searchTerm && (
                <span className="font-bold text-cyan-300">
                  matching &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>

            {(searchTerm || selectedJobId !== 'All' || minAts > 0 || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Reset All Filters <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Active Requisition Actions Bar with Edit & Delete */}
          {selectedJobId !== 'All' && (() => {
            const activeJob = jobs.find((j) => j.id === selectedJobId);
            if (!activeJob) return null;
            return (
              <div className="pt-3 mt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-indigo-950/40 -mx-4 -mb-4 p-4 rounded-b-2xl border border-indigo-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">{activeJob.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {activeJob.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {activeJob.department} • {activeJob.location} • {activeJob.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/recruiter/jobs/${activeJob.id}`}>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold transition-all cursor-pointer"
                      title="Edit this job requisition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Requisition
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setRequisitionToDelete(activeJob)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                    title="Delete this requisition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Requisition
                  </button>

                  <Link to="/recruiter/jobs">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                    >
                      All Jobs →
                    </button>
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Active Pipeline Guidance Banner when 0 candidates ──────────────── */}
        {applicants.length === 0 && !isLoading && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <p className="font-extrabold text-white">Pipeline Ready Across All Stages</p>
                <p className="text-slate-400 text-[11px]">
                  Requisitions are live. When genuine candidates apply, their evaluations will automatically flow into Under Review, Shortlisted, and Ready for Interview stages.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/recruiter/jobs/new">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 font-bold transition-all text-xs cursor-pointer"
                >
                  + New Job Opening
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── KANBAN VIEW (All Stages: Review, Shortlisted, Ready for Interview, etc.) ── */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-8 -mx-2 px-2 no-scrollbar items-start">
            {PIPELINE_STAGES.map((stage) => {
              const stageApps = filteredApplicants.filter((a) => a.status === stage);
              const config = STAGE_CONFIG[stage];
              const StageIcon = getStageIcon(stage);
              const isFocusedStage = statusFilter !== 'All' && statusFilter === stage;

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'w-72 sm:w-80 shrink-0 rounded-3xl p-3.5 flex flex-col border backdrop-blur-xl shadow-2xl relative transition-all',
                    config.bg,
                    config.border,
                    isFocusedStage && 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-[1.01]'
                  )}
                >
                  {/* Top Specular Column Highlight */}
                  <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  {/* Column Header */}
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl mb-3 flex items-center justify-between border border-white/[0.06]',
                      config.headerBg
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn('w-2.5 h-2.5 rounded-full shadow-[0_0_8px]', config.dot)}
                        style={{ boxShadow: `0 0 8px currentColor` }}
                      />
                      <StageIcon className={cn('w-3.5 h-3.5', config.text)} />
                      <h3
                        className={cn(
                          'text-xs font-black uppercase tracking-widest',
                          config.text
                        )}
                      >
                        {getStageTitle(stage)}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isFocusedStage && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/25 border border-cyan-400/40 px-1.5 py-0.5 rounded-md">
                          Focused
                        </span>
                      )}
                      <span
                        className={cn(
                          'text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm',
                          config.text,
                          config.border,
                          'bg-slate-900/80'
                        )}
                      >
                        {stageApps.length}
                      </span>
                    </div>
                  </div>

                  {/* Candidates Cards List */}
                  <div className="space-y-3 overflow-y-auto max-h-[72vh] pr-1 no-scrollbar">
                    {stageApps.length === 0 ? (
                      <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40">
                        <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center border", config.bg, config.text, config.border)}>
                          <StageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-slate-300 font-bold">No candidates in {getStageTitle(stage)}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Advance candidates here from other stages
                        </p>
                      </div>
                    ) : (
                      stageApps.map((app) => {
                        const isSelected = compareSelection.some((a) => a.id === app.id);
                        const score = app.atsScore || 88;
                        const isElite = score >= 90;

                        return (
                          <motion.div
                            key={app.id}
                            whileHover={{ y: -3, scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setActiveApplicant(app)}
                            className={cn(
                              'p-4 rounded-2xl bg-gradient-to-b from-[#0f1738]/90 via-[#0b1028]/90 to-[#070b1c]/90 border transition-all cursor-pointer group space-y-3 relative overflow-hidden shadow-lg',
                              isSelected
                                ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                                : 'border-white/[0.08] hover:border-cyan-400/60 hover:shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
                            )}
                          >
                            {/* Specular Card Line */}
                            <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  {app.candidateAvatar ? (
                                    <img
                                      src={app.candidateAvatar}
                                      alt={app.candidateName}
                                      className="w-10 h-10 rounded-2xl object-cover border border-white/15 shadow-md"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-md">
                                      {app.candidateName?.[0]}
                                    </div>
                                  )}

                                  {isElite && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                                      <Flame className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition-colors">
                                    {app.candidateName}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {app.candidateLocation || 'San Francisco, CA'}
                                  </p>
                                </div>
                              </div>

                              {/* ATS Score Dial with Edit Trigger */}
                              <button
                                id={`ats-edit-btn-${app.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingApplicant(app);
                                }}
                                title="Click to manually edit ATS score & stage"
                                className="text-right shrink-0 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all cursor-pointer group/score"
                              >
                                <div className="flex items-center gap-1 justify-end">
                                  <Edit3 className="w-2.5 h-2.5 text-cyan-400 opacity-60 group-hover/score:opacity-100 transition-opacity" />
                                  <span
                                    className={cn(
                                      'text-xs font-black',
                                      score >= 90
                                        ? 'text-emerald-400'
                                        : score >= 80
                                        ? 'text-cyan-400'
                                        : 'text-amber-400'
                                    )}
                                  >
                                    {score}%
                                  </span>
                                </div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase group-hover/score:text-cyan-300">
                                  ATS Edit
                                </p>
                              </button>
                            </div>

                            {/* Applied Role & Experience */}
                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-slate-200 line-clamp-1">
                                {app.jobTitle}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{app.experienceYears || 5}+ yrs exp</span>
                                <span>•</span>
                                <span>{app.education?.split(' ')?.[0] || 'BS Degree'}</span>
                              </div>
                            </div>

                            {/* Skills Badges */}
                            {app.skills && app.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {app.skills.slice(0, 3).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[9px] font-semibold text-slate-300 border border-white/[0.06]"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {app.skills.length > 3 && (
                                  <span className="text-[9px] text-slate-500 self-center">
                                    +{app.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Card Footer: Quick Actions */}
                            <div
                              className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-1 text-[10px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1.5">
                                {/* Compare Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => toggleCompareSelect(app)}
                                  className={cn(
                                    'p-1.5 rounded-lg border transition-all cursor-pointer',
                                    isSelected
                                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                                  )}
                                  title="Select candidate to compare"
                                >
                                  <GitCompare className="w-3 h-3" />
                                </button>

                                {/* Edit Candidate Button */}
                                <button
                                  type="button"
                                  onClick={() => setEditingApplicant(app)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-all cursor-pointer"
                                  title="Edit candidate profile & ATS score"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>

                                {/* Delete Candidate Button */}
                                <button
                                  type="button"
                                  onClick={() => setCandidateToDelete(app)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 transition-all cursor-pointer"
                                  title="Delete candidate"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Quick Stage Progression */}
                              <div className="flex items-center gap-1">
                                {stage === 'Applied' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(app.id, 'Under Review')}
                                    title="Move to Under Review"
                                    className="px-2 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 font-bold transition-all cursor-pointer text-[10px]"
                                  >
                                    Review ➔
                                  </button>
                                )}
                                {stage === 'Under Review' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(app.id, 'Shortlisted')}
                                      title="Move to Shortlisted"
                                      className="px-2 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 font-bold transition-all cursor-pointer text-[10px]"
                                    >
                                      Shortlist ⭐
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(app.id, 'Interview')}
                                      title="Mark Ready for Interview"
                                      className="p-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                                {stage === 'Shortlisted' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(app.id, 'Interview')}
                                    title="Mark Candidate Ready for Interview"
                                    className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 font-bold transition-all cursor-pointer text-[10px] flex items-center gap-1"
                                  >
                                    <UserCheck className="w-3 h-3" /> Ready
                                  </button>
                                )}
                                {stage === 'Interview' && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(app.id, 'Selected')}
                                    title="Select Candidate"
                                    className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold transition-all cursor-pointer text-[10px]"
                                  >
                                    Select 🏆
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── TABLE VIEW (Grouped by Stage: Under Review, Shortlisted, Ready for Interview, etc.) ── */}
        {viewMode === 'table' && (
          <div className="space-y-6">
            {statusFilter === 'All' ? (
              // When viewing All Stages: display clean Stage-by-Stage grouped tables
              PIPELINE_STAGES.map((stage) => {
                const stageApps = filteredApplicants.filter((a) => a.status === stage);
                const config = STAGE_CONFIG[stage];
                const StageIcon = getStageIcon(stage);

                return (
                  <div
                    key={stage}
                    className="p-4 sm:p-5 rounded-3xl bg-[#0a0f26]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden"
                  >
                    {/* Stage Group Banner */}
                    <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shadow-md',
                            config.bg,
                            config.text,
                            config.border
                          )}
                        >
                          <StageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={cn('text-xs font-black uppercase tracking-wider', config.text)}>
                              {getStageTitle(stage)}
                            </h3>
                            <span
                              className={cn(
                                'text-[10px] font-black px-2.5 py-0.5 rounded-full border',
                                config.text,
                                config.border,
                                'bg-slate-900/80'
                              )}
                            >
                              {stageApps.length} candidate{stageApps.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {stage === 'Under Review' && 'Candidates undergoing recruiter evaluation & resume scoring'}
                            {stage === 'Shortlisted' && 'Top tier candidates shortlisted for hiring team interview'}
                            {stage === 'Interview' && 'Candidates qualified and marked ready for interview'}
                            {stage === 'Applied' && 'Newly received applications awaiting initial evaluation'}
                            {stage === 'Selected' && 'Top selected and offered candidates'}
                            {stage === 'Rejected' && 'Archived / not selected candidates'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStatusFilter(stage)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Focus Stage →
                      </button>
                    </div>

                    {/* Stage Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 border-b border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-5 py-3">Candidate</th>
                            <th className="px-5 py-3">Position</th>
                            <th className="px-5 py-3">ATS Match</th>
                            <th className="px-5 py-3">Pipeline Stage</th>
                            <th className="px-5 py-3">Applied Date</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {stageApps.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 px-5 text-center text-slate-500 text-xs font-semibold">
                                No candidates currently in <span className={cn('font-bold', config.text)}>{getStageTitle(stage)}</span>.
                              </td>
                            </tr>
                          ) : (
                            stageApps.map((app) => renderTableRow(app))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              // When a specific stage is filtered (e.g. Under Review or Shortlisted)
              (() => {
                const stage = statusFilter as ApplicationStatus;
                const stageApps = filteredApplicants;
                const config = STAGE_CONFIG[stage] || STAGE_CONFIG['Under Review'];
                const StageIcon = getStageIcon(stage);

                return (
                  <div className="p-4 sm:p-5 rounded-3xl bg-[#0a0f26]/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
                    <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border shadow-md',
                            config.bg,
                            config.text,
                            config.border
                          )}
                        >
                          <StageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={cn('text-xs font-black uppercase tracking-wider', config.text)}>
                              {getStageTitle(stage)} Candidates
                            </h3>
                            <span
                              className={cn(
                                'text-[10px] font-black px-2.5 py-0.5 rounded-full border',
                                config.text,
                                config.border,
                                'bg-slate-900/80'
                              )}
                            >
                              {stageApps.length} candidate{stageApps.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Filtered view of candidates in {getStageTitle(stage)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('All')}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        ← Show All Stages
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 border-b border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-5 py-3.5">Candidate</th>
                            <th className="px-5 py-3.5">Position</th>
                            <th className="px-5 py-3.5">ATS Match</th>
                            <th className="px-5 py-3.5">Pipeline Stage</th>
                            <th className="px-5 py-3.5">Applied Date</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {stageApps.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-400 text-sm">
                                No candidates found in <span className={cn('font-bold', config.text)}>{getStageTitle(stage)}</span> matching your filters.{' '}
                                <button
                                  onClick={handleClearFilters}
                                  className="text-cyan-400 font-bold underline ml-1 cursor-pointer"
                                >
                                  Clear Filters
                                </button>
                              </td>
                            </tr>
                          ) : (
                            stageApps.map((app) => renderTableRow(app))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* ── CANDIDATE DETAIL MODAL ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!activeApplicant}
        onClose={() => setActiveApplicant(null)}
        title={activeApplicant?.candidateName || 'Candidate Profile'}
        description={`Applied for: ${activeApplicant?.jobTitle || ''}`}
        maxWidth="2xl"
      >
        {activeApplicant && (
          <div className="space-y-5">
            {/* Top Profile Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                  {activeApplicant.candidateName?.[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activeApplicant.candidateName}</h3>
                  <p className="text-xs text-slate-300">{activeApplicant.candidateEmail}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeApplicant.candidateLocation || 'San Francisco, CA'} ·{' '}
                    {activeApplicant.experienceYears || 5}+ yrs experience
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ATS Match Score
                </div>
                <div
                  className={cn(
                    'text-3xl font-black',
                    (activeApplicant.atsScore || 0) >= 90
                      ? 'text-emerald-400'
                      : (activeApplicant.atsScore || 0) >= 80
                      ? 'text-cyan-400'
                      : 'text-amber-400'
                  )}
                >
                  {activeApplicant.atsScore}
                  <span className="text-sm text-slate-500">/100</span>
                </div>
              </div>
            </div>

            {/* Stage Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/25">
              <span className="text-xs font-bold text-white">Current Pipeline Stage:</span>
              <div className="flex items-center gap-2">
                <select
                  value={activeApplicant.status}
                  onChange={(e) =>
                    handleStatusChange(activeApplicant.id, e.target.value as ApplicationStatus)
                  }
                  className="bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 px-3 py-1.5 font-bold focus:outline-none focus:border-cyan-400"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {getStageTitle(s)}
                    </option>
                  ))}
                </select>

                {activeApplicant.status !== 'Interview' ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(activeApplicant.id, 'Interview')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Mark Ready for Interview
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5" /> Ready for Interview
                  </span>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Skills Detected ({activeApplicant.skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeApplicant.skills || ['Java', 'React', 'Spring Boot', 'AWS']).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Recruiter Evaluation Notes
              </h4>
              {(activeApplicant.notes?.length || 0) > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {activeApplicant.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                    >
                      &ldquo;{note}&rdquo;
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Add private evaluation note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Save Note
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => {
                    setEditingApplicant(activeApplicant);
                    setActiveApplicant(null);
                  }}
                  leftIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Edit Candidate & ATS Score
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setCandidateToDelete(activeApplicant);
                    setActiveApplicant(null);
                  }}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete Candidate
                </Button>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setActiveApplicant(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── EDIT CANDIDATE & MANUAL ATS SCORE MODAL ─────────────────────────── */}
      {editingApplicant && (
        <EditCandidateModal
          applicant={editingApplicant}
          onClose={() => setEditingApplicant(null)}
          onSave={handleSaveCandidate}
          onDelete={(app) => {
            setEditingApplicant(null);
            setCandidateToDelete(app);
          }}
        />
      )}

      {/* ── CONFIRM DELETE CANDIDATE DIALOG ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleConfirmDeleteCandidate}
        title="Delete Candidate Application"
        message={`Are you sure you want to delete ${candidateToDelete?.candidateName || 'this candidate'} from the pipeline? This will permanently remove their application record.`}
        confirmText="Delete Candidate"
        variant="danger"
        isLoading={isDeletingApplicant}
      />

      {/* ── CONFIRM DELETE REQUISITION DIALOG ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!requisitionToDelete}
        onClose={() => setRequisitionToDelete(null)}
        onConfirm={handleConfirmDeleteRequisition}
        title="Delete Job Requisition"
        message={`Are you sure you want to delete requisition "${requisitionToDelete?.title || ''}"? This will remove the job posting and applicant pool.`}
        confirmText="Delete Requisition"
        variant="danger"
        isLoading={isDeletingRequisition}
      />

      {/* ── COMPARISON MODAL ─────────────────────────────────────────────────── */}
      {showCompare && compareSelection.length === 2 && (
        <CandidateComparisonModal
          candidates={compareSelection}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
};
