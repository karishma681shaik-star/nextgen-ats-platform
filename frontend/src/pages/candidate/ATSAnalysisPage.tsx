import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Target,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react';
import { candidateService, jobService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { ATSAnalysis, Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

// ─── Animated Score Ring ─────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; label: string; color: string; glowColor: string; size?: 'sm' | 'md' }> = ({ score, label, color, glowColor, size = 'md' }) => {
  const [animated, setAnimated] = useState(0);
  const r = size === 'md' ? 48 : 34;
  const strokeW = size === 'md' ? 8 : 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animated / 100) * circ;
  const viewSize = size === 'md' ? 120 : 88;
  const center = viewSize / 2;

  useEffect(() => {
    let start = 0;
    const inc = score / 50;
    const iv = setInterval(() => {
      start += inc;
      if (start >= score) { setAnimated(score); clearInterval(iv); }
      else setAnimated(Math.round(start));
    }, 20);
    return () => clearInterval(iv);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: viewSize, height: viewSize }}>
        <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse-glow" style={{ backgroundColor: glowColor }} />
        <svg className="-rotate-90" viewBox={`0 0 ${viewSize} ${viewSize}`} width={viewSize} height={viewSize}>
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
          <circle
            cx={center} cy={center} r={r} fill="none"
            stroke={color} strokeWidth={strokeW} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-white" style={{ fontSize: size === 'md' ? 22 : 16 }}>{animated}</span>
          <span className="text-[9px] text-slate-500 font-bold">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-300 text-center">{label}</span>
    </div>
  );
};

// ─── AI Bullet Enhancer ─────────────────────────────────────────────────────
const BulletEnhancer: React.FC = () => {
  const [input, setInput] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnhance = () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setEnhanced('');
    setTimeout(() => {
      // AI-style improvement simulation
      const verbs = ['Architected', 'Spearheaded', 'Orchestrated', 'Engineered', 'Optimized', 'Delivered'];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      setEnhanced(`${verb} ${input.toLowerCase().replace(/^(managed|built|worked on|developed|created)\s+/i, '')}, resulting in a measurable improvement in system performance, scalability, and team delivery velocity by 35%+ across quarterly cycles.`);
      setIsLoading(false);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Original Bullet Point</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Built React components for the e-commerce platform and fixed bugs..."
            rows={3}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none"
          />
        </div>
      </div>
      <button
        onClick={handleEnhance}
        disabled={!input.trim() || isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-indigo-700/20 hover:scale-[1.01]"
      >
        {isLoading ? (
          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Optimizing with AI...</>
        ) : (
          <><Sparkles className="w-3.5 h-3.5" /> Enhance for ATS</>
        )}
      </button>

      {enhanced && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> ATS-Optimized Version
            </span>
            <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors">
              {copied ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="w-3 h-3" />Copy</>}
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{enhanced}</p>
        </div>
      )}
    </div>
  );
};

// ─── Shimmer Skeleton ───────────────────────────────────────────────────────
const ShimmerBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 animate-shimmer', className)} style={{ backgroundSize: '400% 100%' }} />
);

// ─── Main Component ──────────────────────────────────────────────────────────
export const ATSAnalysisPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { loadAnalysisData(); }, []);

  const loadAnalysisData = async () => {
    try {
      setIsLoading(true);
      const [atsData, jobsData] = await Promise.all([candidateService.getATSAnalysis(), jobService.getJobs()]);
      setAnalysis(atsData);
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to load ATS analysis', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      const targetJob = jobs.find((j) => j.id === selectedJobId);
      const updated = await candidateService.recalculateATSScore(targetJob?.skills);
      setAnalysis(updated);
      showToast({ type: 'success', title: 'ATS Score Recalculated', message: targetJob ? `Calibrated for ${targetJob.title} at ${targetJob.company}` : 'Benchmark refreshed.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not recalculate.' });
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="space-y-6">
        <ShimmerBlock className="h-20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <ShimmerBlock key={i} className="h-52" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <ShimmerBlock key={i} className="h-56" />)}</div>
      </div>
    );
  }

  const breakdownItems = [
    { label: 'Keyword Density', value: analysis.breakdown.keywordScore, color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
    { label: 'Skills Coverage', value: analysis.breakdown.skillsScore, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
    { label: 'Experience Depth', value: analysis.breakdown.experienceScore, color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
    { label: 'Education Match', value: analysis.breakdown.educationScore, color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
    { label: 'ATS Formatting', value: analysis.breakdown.formattingScore, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Resume Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ATS Analysis Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">Keyword density mapping, competency benchmarks, and AI optimization tips.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 max-w-xs focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="all">General Industry Benchmark</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>Target: {job.title} ({job.company})</option>
            ))}
          </select>
          <Button variant="glow" size="sm" onClick={handleRecalculate} isLoading={isRecalculating} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Recalculate
          </Button>
        </div>
      </div>

      {/* ── Score Rings ─────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
          <ScoreRing score={analysis.overallScore} label="Overall ATS Score" color="#6366f1" glowColor="rgba(99,102,241,0.4)" />
          <ScoreRing score={analysis.technicalScore} label="Technical Score" color="#10b981" glowColor="rgba(16,185,129,0.4)" />
          {/* Breakdown Mini Rings */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {breakdownItems.map((b) => (
              <ScoreRing key={b.label} score={b.value} label={b.label.split(' ')[0]} color={b.color} glowColor={b.glow} size="sm" />
            ))}
          </div>
        </div>

        {/* Bar Breakdown */}
        <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed Score Breakdown</p>
          {breakdownItems.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 w-32 shrink-0 font-medium">{b.label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${b.value}%`, backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}` }}
                />
              </div>
              <span className="text-xs font-extrabold text-white w-8 text-right">{b.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Middle Grid: Keyword gap + Skills ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Missing ATS Keywords</h3>
              <p className="text-[11px] text-slate-400">Add these to boost your ranking</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((kw) => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/25 text-amber-300 text-xs font-semibold hover:bg-amber-900/40 transition-colors cursor-default group">
                <Zap className="w-3 h-3 group-hover:animate-pulse" />+ {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Recommended Skill Additions</h3>
              <p className="text-[11px] text-slate-400">High-demand skills in your target industry</p>
            </div>
          </div>
          <div className="space-y-2">
            {analysis.missingSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-white/[0.05] hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">{skill}</span>
                </div>
                <Link to="/candidate/profile" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1">
                  + Add <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Bullet Enhancer ───────────────────────────── */}
      <div className="glass-card rounded-2xl p-5 border border-violet-500/15">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Bullet Point Enhancer</h3>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-bold uppercase tracking-wider border border-violet-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400">Transform weak bullet points into high-impact, ATS-optimized statements</p>
          </div>
        </div>
        <BulletEnhancer />
      </div>

      {/* ── Strengths / Weaknesses / Recommendations ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Profile Strengths', items: analysis.strengths, icon: <CheckCircle2 className="w-4 h-4" />, accent: 'emerald', dotColor: 'bg-emerald-400' },
          { title: 'Areas to Improve', items: analysis.weaknesses, icon: <AlertTriangle className="w-4 h-4" />, accent: 'amber', dotColor: 'bg-amber-400' },
          { title: 'AI Recommendations', items: analysis.recommendations, icon: <Lightbulb className="w-4 h-4" />, accent: 'indigo', dotColor: 'bg-indigo-400' },
        ].map((section) => (
          <div
            key={section.title}
            className={cn('glass-card rounded-2xl p-5 border', `border-${section.accent}-500/15`)}
          >
            <div className={cn('flex items-center gap-2 mb-4 font-bold text-sm', `text-${section.accent}-400`)}>
              {section.icon}
              <span>{section.title} ({section.items.length})</span>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5', section.dotColor)} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border border-indigo-500/20">
        <div>
          <p className="text-sm font-bold text-white">Ready to apply your optimizations?</p>
          <p className="text-xs text-slate-400">Find roles matched to your enhanced ATS profile.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/candidate/resume-parser">
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Re-Parse Resume</Button>
          </Link>
          <Link to="/candidate/jobs">
            <Button variant="glow" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Explore Matched Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
