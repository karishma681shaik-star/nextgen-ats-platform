import {
  RecruiterStats,
  Company,
  Job,
  Application,
  ApplicationStatus
} from '../../types';
import { storage, delay } from './storage';

export interface ApplicantFilters {
  jobId?: string;
  status?: ApplicationStatus | 'All';
  search?: string;
  minAtsScore?: number;
}

export const recruiterService = {
  async getStats(): Promise<RecruiterStats> {
    await delay(150);
    const jobs = storage.getJobs();
    const apps = storage.getApplications();

    return {
      activeJobs: jobs.filter((j) => j.status === 'active').length,
      totalApplicants: apps.length,
      shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
      interviewsScheduled: apps.filter((a) => a.status === 'Interview').length,
      hiresThisMonth: apps.filter((a) => a.status === 'Selected').length,
      averageTimeToHireDays: 15
    };
  },

  async getCompanyProfile(): Promise<Company> {
    await delay(200);
    const companies = storage.getCompanies();
    return companies[0];
  },

  async updateCompanyProfile(updates: Partial<Company>): Promise<Company> {
    await delay(300);
    const companies = storage.getCompanies();
    const current = companies[0];
    const updated = { ...current, ...updates };
    storage.setCompanies([updated, ...companies.slice(1)]);
    return updated;
  },

  async getPostedJobs(): Promise<Job[]> {
    await delay(200);
    return storage.getJobs();
  },

  async getAllApplicants(filters?: ApplicantFilters): Promise<Application[]> {
    await delay(200);
    let apps = storage.getApplications();

    if (!filters) return apps;

    if (filters.jobId && filters.jobId !== 'All') {
      apps = apps.filter((a) => a.jobId === filters.jobId);
    }

    if (filters.status && filters.status !== 'All') {
      apps = apps.filter((a) => a.status === filters.status);
    }

    if (filters.minAtsScore) {
      apps = apps.filter((a) => a.atsScore >= filters.minAtsScore!);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          a.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return apps;
  },

  async updateApplicantStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ): Promise<Application> {
    await delay(250);
    const apps = storage.getApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const newTimelineEvent = {
      status: newStatus,
      date: new Date().toISOString(),
      note: note || `Status updated to ${newStatus} by recruiter`
    };

    const updatedApp: Application = {
      ...app,
      status: newStatus,
      notes: note ? [...app.notes, note] : app.notes,
      timeline: [newTimelineEvent, ...app.timeline]
    };

    const updatedList = apps.map((a) => (a.id === applicationId ? updatedApp : a));
    storage.setApplications(updatedList);
    return updatedApp;
  },

  async addApplicantNote(applicationId: string, note: string): Promise<Application> {
    await delay(200);
    const apps = storage.getApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const updatedApp: Application = {
      ...app,
      notes: [note, ...app.notes]
    };

    const updatedList = apps.map((a) => (a.id === applicationId ? updatedApp : a));
    storage.setApplications(updatedList);
    return updatedApp;
  }
};
