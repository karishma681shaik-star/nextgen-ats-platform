import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { candidateService } from '../../services';
import { Application, ApplicationStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { getStatusBadgeStyle, formatFullDate } from '../../utils/formatters';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await candidateService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'All', label: 'All Applications', count: applications.length },
    { id: 'Under Review', label: 'Under Review', count: applications.filter((a) => a.status === 'Under Review').length },
    { id: 'Shortlisted', label: 'Shortlisted', count: applications.filter((a) => a.status === 'Shortlisted').length },
    { id: 'Interview', label: 'Interview Scheduled', count: applications.filter((a) => a.status === 'Interview').length },
    { id: 'Selected', label: 'Offers / Selected', count: applications.filter((a) => a.status === 'Selected').length }
  ];

  const filteredApps =
    activeTab === 'All'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Applicant Tracker</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Job Applications</h1>
        <p className="text-xs text-slate-400">
          Track recruitment stages, status progressions, recruiter notes, and interview notifications.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : filteredApps.length === 0 ? (
        <Card glass className="p-12 text-center text-xs text-slate-400 space-y-3">
          <Layers className="w-10 h-10 text-indigo-400 mx-auto" />
          <p className="text-sm font-bold text-white">No applications in this category</p>
          <p>Explore recommended jobs and submit your profile for review.</p>
          <Link to="/candidate/jobs">
            <Button variant="primary" size="sm" className="mt-2">
              Explore Available Positions
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const badge = getStatusBadgeStyle(app.status);
            return (
              <Card key={app.id} glass hoverEffect className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={app.companyLogo}
                      alt={app.company}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-sm shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                          {app.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-semibold">{app.company}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Resume: <span className="text-slate-300 font-medium">{app.resumeFileName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Applied on {formatFullDate(app.appliedDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block">ATS Match Score</span>
                      <span className="text-base font-extrabold text-emerald-400">{app.atsScore}/100</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      View Timeline
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* APPLICATION STATUS TIMELINE MODAL */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.jobTitle}
        description={`Application Progress at ${selectedApp?.company}`}
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{selectedApp.company}</p>
                <p className="text-slate-400 mt-0.5">Applied: {formatFullDate(selectedApp.appliedDate)}</p>
              </div>
              <Badge variant="primary" size="md">
                {selectedApp.status}
              </Badge>
            </div>

            {/* Visual Step Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Progression Log
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {selectedApp.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-slate-900 ring-2 ring-indigo-500/30" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{event.status}</span>
                        <span className="text-[11px] text-slate-500">{formatFullDate(event.date)}</span>
                      </div>
                      {event.note && (
                        <p className="text-xs text-slate-300 leading-relaxed">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
