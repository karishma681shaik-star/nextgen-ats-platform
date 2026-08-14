import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Columns3,
  List,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building
} from 'lucide-react';
import { recruiterService, jobService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Application, ApplicationStatus, Job } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected'
];

export const ApplicantManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'All';

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [minAts, setMinAts] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(true);

  // Candidate detail drawer / modal
  const [activeApplicant, setActiveApplicant] = useState<Application | null>(null);
  const [newNote, setNewNote] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appsData, jobsData] = await Promise.all([
        recruiterService.getAllApplicants(),
        recruiterService.getPostedJobs()
      ]);
      setApplicants(appsData);
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to load applicant pipeline', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const updated = await recruiterService.updateApplicantStatus(appId, newStatus);
      setApplicants((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (activeApplicant?.id === appId) {
        setActiveApplicant(updated);
      }
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Candidate moved to "${newStatus}".`
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update applicant status.' });
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApplicant || !newNote.trim()) return;

    try {
      const updated = await recruiterService.addApplicantNote(activeApplicant.id, newNote.trim());
      setApplicants((prev) => prev.map((a) => (a.id === activeApplicant.id ? updated : a)));
      setActiveApplicant(updated);
      setNewNote('');
      showToast({ type: 'info', title: 'Note Added', message: 'Evaluation feedback saved.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to add evaluation note.' });
    }
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    if (selectedJobId !== 'All' && app.jobId !== selectedJobId) return false;
    if (statusFilter !== 'All' && app.status !== statusFilter) return false;
    if (minAts > 0 && app.atsScore < minAts) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        app.candidateName.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.candidateEmail.toLowerCase().includes(q) ||
        app.skills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Hiring Pipeline</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Applicant Pipeline & Screening</h1>
          <p className="text-xs text-slate-400">
            Review candidate resumes, rank submissions by ATS score, advance candidates, and record evaluation notes.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns3 className="w-4 h-4" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card glass className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search candidates by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700/80 p-2.5 truncate"
            >
              <option value="All">All Requisitions ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.applicantCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={minAts}
              onChange={(e) => setMinAts(Number(e.target.value))}
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700/80 p-2.5"
            >
              <option value={0}>Any ATS Score</option>
              <option value={80}>Min 80+ ATS Score</option>
              <option value={90}>Min 90+ ATS Score (Top Match)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* VIEW 1: KANBAN PIPELINE BOARD */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageApplicants = filteredApplicants.filter((a) => a.status === stage);
            return (
              <div
                key={stage}
                className="w-72 sm:w-80 shrink-0 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stage}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {stageApplicants.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageApplicants.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No candidates in {stage}
                    </div>
                  ) : (
                    stageApplicants.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setActiveApplicant(app)}
                        className="p-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={app.candidateAvatar}
                              alt={app.candidateName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                                {app.candidateName}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate">{app.candidateTitle}</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-400 shrink-0">
                            {app.atsScore}
                          </span>
                        </div>

                        <p className="text-[11px] text-indigo-300 font-semibold truncate">{app.jobTitle}</p>

                        <div className="flex flex-wrap gap-1">
                          {app.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                          <span>{app.experienceYears}+ yrs exp</span>
                          <span>{app.notes.length} note(s)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <Card glass className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Applied Position</th>
                  <th className="p-4">ATS Match</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No matching applicants found.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => {
                    const badge = getStatusBadgeStyle(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.candidateAvatar}
                              alt={app.candidateName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white">{app.candidateName}</p>
                              <p className="text-[11px] text-slate-400">{app.candidateEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-200">{app.jobTitle}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-emerald-400 text-sm">{app.atsScore}/100</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold border ${badge.badgeClass}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{formatFullDate(app.appliedDate)}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => setActiveApplicant(app)}>
                            Review Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CANDIDATE EVALUATION & RESUME MODAL */}
      <Modal
        isOpen={!!activeApplicant}
        onClose={() => setActiveApplicant(null)}
        title={activeApplicant?.candidateName}
        description={`Applicant for: ${activeApplicant?.jobTitle}`}
        maxWidth="2xl"
      >
        {activeApplicant && (
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeApplicant.candidateAvatar}
                  alt={activeApplicant.candidateName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{activeApplicant.candidateName}</h3>
                  <p className="text-xs text-slate-400">{activeApplicant.candidateEmail} • {activeApplicant.candidateLocation}</p>
                  <p className="text-[11px] text-slate-500">Submitted: {activeApplicant.resumeFileName}</p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ATS Match Score</span>
                <span className="text-2xl font-extrabold text-emerald-400">{activeApplicant.atsScore}/100</span>
              </div>
            </div>

            {/* Quick Status Advance Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
              <span className="text-xs font-bold text-white">Current Application Stage:</span>
              <div className="flex items-center gap-2">
                <select
                  value={activeApplicant.status}
                  onChange={(e) => handleStatusChange(activeApplicant.id, e.target.value as ApplicationStatus)}
                  className="bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-700 px-3 py-1.5 font-bold"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Verified Candidate Skills ({activeApplicant.skills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeApplicant.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Evaluation Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Internal Recruiter Notes ({activeApplicant.notes.length})
              </h4>

              {activeApplicant.notes.length > 0 && (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {activeApplicant.notes.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      "{note}"
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Add private evaluation notes for hiring committee..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                  Save Note
                </Button>
              </form>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setActiveApplicant(null)}>
                Close Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
