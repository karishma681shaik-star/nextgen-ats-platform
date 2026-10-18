import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { jobService } from '../../services';
import { Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { DepthCard } from '../../components/ui/DepthCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatSalaryRange } from '../../utils/formatters';

interface PublicCompanyData {
  id: string;
  name: string;
  logo?: string;
  tagline?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  description?: string;
  foundedYear?: string;
  benefits?: string[];
  contactEmail?: string;
  verified?: boolean;
  recruiterName?: string;
  recruiterVerified?: boolean;
  activeJobsCount?: number;
}

export const PublicCareerPortalPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [company, setCompany] = useState<PublicCompanyData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for jobs within company portal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

  useEffect(() => {
    loadPortalData();
  }, [companyId]);

  const loadPortalData = async () => {
    if (!companyId) {
      setError('No company identifier specified.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [companyData, jobsData] = await Promise.all([
        jobService.getPublicCompany(companyId).catch((err) => {
          throw err;
        }),
        jobService.getPublicCompanyJobs(companyId).catch(() => [] as Job[])
      ]);

      setCompany(companyData);
      setJobs(jobsData || []);
    } catch (err: any) {
      console.error('Failed to load career portal:', err);
      setError(err?.message || 'The requested company career portal could not be found.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unique departments for filter dropdown
  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)))];
  const employmentTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedType === 'All' ||
      job.type.toLowerCase() === selectedType.toLowerCase() ||
      (selectedType === 'Remote' && job.location.toLowerCase().includes('remote'));

    const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;

    return matchesSearch && matchesType && matchesDept;
  });

  const handleApplyClick = (jobId: string) => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in or create a candidate account to apply.'
      });
      navigate(`/login/candidate?redirect=${encodeURIComponent(`/candidate/jobs/${jobId}`)}`);
      return;
    }

    if (role === 'recruiter') {
      showToast({
        type: 'warning',
        title: 'Recruiter Account',
        message: 'Recruiter accounts cannot submit candidate job applications.'
      });
      return;
    }

    navigate(`/candidate/jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Loading Career Portal...</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Retrieving verified corporate profile and live requisitions from the AI ATS engine.
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Company Career Portal Not Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {error || 'The requested company portal does not exist, has been removed, or has no public profile.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="secondary" size="md">
              Return to Homepage
            </Button>
          </Link>
          <Link to="/candidate/jobs">
            <Button variant="glow" size="md" leftIcon={<Briefcase className="w-4 h-4" />}>
              Browse All Active Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* ── Enterprise Company Hero Card ────────────────────────────────────── */}
      <DepthCard
        hoverEffect={false}
        glass={true}
        className="p-6 sm:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1224]/90 via-[#0a0f1d]/95 to-[#070b14]/90 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-start sm:items-center gap-5">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-white/5 border border-white/15 p-2 shadow-xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white border border-white/20 shadow-xl shrink-0">
                {company.name?.charAt(0) || 'C'}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {company.name}
                </h1>
                {company.verified && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    title="Verified Identity: Identity and registration independently verified by platform administration."
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Employer</span>
                  </span>
                )}
              </div>

              {company.tagline && (
                <p className="text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
                  {company.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-400">
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{company.industry}</span>
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{company.location}</span>
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span>{company.size}</span>
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Founded {company.foundedYear}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick External Links */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {company.website && (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Globe className="w-3.5 h-3.5 text-cyan-400" />}
                  rightIcon={<ExternalLink className="w-3 h-3 text-slate-400" />}
                  className="w-full justify-center"
                >
                  Visit Website
                </Button>
              </a>
            )}
            {company.contactEmail && (
              <a href={`mailto:${company.contactEmail}`} className="flex-1 md:flex-none">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Mail className="w-3.5 h-3.5 text-indigo-400" />}
                  className="w-full justify-center"
                >
                  Contact Recruiting
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Company Description & Culture Highlights */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              About {company.name}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {company.description ||
                'We are building the future of our industry with modern technology, inclusive teams, and a culture of continuous learning.'}
            </p>
          </div>

          {company.benefits && company.benefits.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Perks & Benefits
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.benefits.map((benefit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{benefit.trim()}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DepthCard>

      {/* ── Open Positions Section ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Open Career Opportunities
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Showing {filteredJobs.length} active published {filteredJobs.length === 1 ? 'position' : 'positions'} at {company.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              Platform Status:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Accepting Applications
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#090f20]/80 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skill, or keyword..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                {employmentTypes.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type === 'All' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {departments.length > 2 && (
              <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-slate-300 font-bold focus:outline-none cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">
                      {dept === 'All' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length === 0 ? (
          <DepthCard
            hoverEffect={false}
            glass={true}
            className="p-10 text-center rounded-3xl border border-white/[0.08] space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-300">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-white">
                {jobs.length === 0
                  ? 'No Active Openings Currently Available'
                  : 'No Jobs Match Your Filter Criteria'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {jobs.length === 0
                  ? `There are currently no published openings for ${company.name} in candidate discovery. Check back regularly or explore other verified positions on the platform.`
                  : 'Try clearing your search query or broadening your filters to view other open positions.'}
              </p>
            </div>
            {jobs.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedDepartment('All');
                }}
              >
                Reset Filters
              </Button>
            )}
          </DepthCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <DepthCard
                key={job.id}
                hoverEffect={true}
                glass={true}
                className="p-6 rounded-3xl border border-white/[0.08] hover:border-cyan-400/40 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {job.department && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
                          {job.department}
                        </span>
                      )}
                      <h3 className="text-lg font-black text-white mt-2 group-hover:text-cyan-300 transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full shrink-0">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.experienceLevel}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 5).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-500">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-extrabold text-white">
                      {formatSalaryRange(job.salary?.min, job.salary?.max, job.salary?.currency || 'INR', job.salary?.period, 'Competitive Package')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/candidate/jobs/${job.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="glow"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => handleApplyClick(job.id)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </DepthCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
