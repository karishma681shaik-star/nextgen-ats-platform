import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gauge,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Plus,
  RefreshCw,
  Briefcase,
  Target,
  ArrowRight
} from 'lucide-react';
import { candidateService, jobService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { ATSAnalysis, Job } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { getScoreColor } from '../../utils/formatters';

export const ATSAnalysisPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setIsLoading(true);
      const [atsData, jobsData] = await Promise.all([
        candidateService.getATSAnalysis(),
        jobService.getJobs()
      ]);
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
      showToast({
        type: 'success',
        title: 'ATS Score Recalculated',
        message: targetJob
          ? `Analysis calibrated for ${targetJob.title} (${targetJob.company})`
          : 'Overall benchmark score refreshed.'
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not recalculate ATS score.' });
    } finally {
      setIsRecalculating(false);
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const scoreStyle = getScoreColor(analysis.overallScore);
  const techScoreStyle = getScoreColor(analysis.technicalScore);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Resume Benchmark</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ATS Analysis & Feedback</h1>
          <p className="text-xs text-slate-400">
            Real-time keyword density, semantic competency mapping, and recommendations for maximizing recruiter discovery.
          </p>
        </div>

        {/* Target Job Comparator */}
        <div className="flex items-center gap-2">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 max-w-xs truncate"
          >
            <option value="all">Compare Against General Industry Benchmark</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                Target: {job.title} ({job.company})
              </option>
            ))}
          </select>
          <Button
            variant="glow"
            size="sm"
            onClick={handleRecalculate}
            isLoading={isRecalculating}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall ATS Score Radial Box */}
        <Card glass className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center relative shadow-glow">
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${scoreStyle.textClass}`}>
                {analysis.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Out of 100</span>
            </div>
          </div>
          <h3 className="text-base font-bold text-white mt-4">Overall ATS Health Score</h3>
          <p className="text-xs text-slate-400 mt-1">
            Excellent parsing readability. Ranked in the top 10% of applicants.
          </p>
          <Badge variant="success" size="sm" className="mt-3">
            Recruiter Approved
          </Badge>
        </Card>

        {/* Technical Score */}
        <Card glass className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative shadow-glow">
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${techScoreStyle.textClass}`}>
                {analysis.technicalScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Technical</span>
            </div>
          </div>
          <h3 className="text-base font-bold text-white mt-4">Technical Competency Score</h3>
          <p className="text-xs text-slate-400 mt-1">
            High overlap with senior full stack & cloud distributed systems.
          </p>
          <Badge variant="primary" size="sm" className="mt-3">
            94% Skill Match
          </Badge>
        </Card>

        {/* Breakdown Sub-Scores */}
        <Card glass className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Score Vector Breakdown</h3>
          <div className="space-y-3">
            <ProgressBar value={analysis.breakdown.keywordScore} label="Keyword Density" size="sm" colorClass="bg-indigo-500" />
            <ProgressBar value={analysis.breakdown.skillsScore} label="Skills Coverage" size="sm" colorClass="bg-emerald-500" />
            <ProgressBar value={analysis.breakdown.experienceScore} label="Experience Depth" size="sm" colorClass="bg-purple-500" />
            <ProgressBar value={analysis.breakdown.educationScore} label="Education Match" size="sm" colorClass="bg-blue-500" />
            <ProgressBar value={analysis.breakdown.formattingScore} label="ATS Formatting & Structure" size="sm" colorClass="bg-amber-500" />
          </div>
        </Card>
      </div>

      {/* Missing Keywords & Skills Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <Card glass className="p-6 space-y-4 border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Missing Target Keywords</h3>
              <p className="text-xs text-slate-400">Add these keywords to your project descriptions to boost rank</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {analysis.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                <span>+ {kw}</span>
              </span>
            ))}
          </div>
        </Card>

        {/* Missing Skills */}
        <Card glass className="p-6 space-y-4 border-indigo-500/30 bg-indigo-950/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recommended Skill Additions</h3>
              <p className="text-xs text-slate-400">High-demand skills frequently paired with your profile</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {analysis.missingSkills.map((skill, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200">
                <span className="font-semibold">{skill}</span>
                <Link to="/candidate/profile" className="text-[11px] text-indigo-400 hover:underline">
                  + Add to Profile
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Categorized AI Feedback: Strengths, Weaknesses, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <Card glass className="p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Profile Strengths ({analysis.strengths.length})</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card glass className="p-6 space-y-4 border-amber-500/20">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Areas to Improve ({analysis.weaknesses.length})</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {analysis.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card glass className="p-6 space-y-4 border-indigo-500/20">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
            <Lightbulb className="w-5 h-5" />
            <span>Actionable Tips ({analysis.recommendations.length})</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Link to="/candidate/jobs">
          <Button variant="glow" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Jobs Matching Your ATS Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};
