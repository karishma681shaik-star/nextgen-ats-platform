import { apiClient } from './apiClient';
import {
  RecruiterStats,
  Company,
  Job,
  Application,
  ApplicationStatus
} from '../../types';
import { mapJobDtoToJob } from './jobApi';
import { storage } from '../mock/storage';

export interface ApplicantFilters {
  jobId?: string;
  status?: ApplicationStatus | 'All';
  search?: string;
  minAtsScore?: number;
}

export const recruiterApi = {
  async getStats(): Promise<RecruiterStats> {
    return apiClient<RecruiterStats>('/recruiter/stats');
  },

  async getCompanyProfile(): Promise<Company> {
    const raw = await apiClient<any>('/recruiter/company');
    return mapCompany(raw);
  },

  async updateCompanyProfile(updates: Partial<Company>): Promise<Company> {
    const raw = await apiClient<any>('/recruiter/company', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return mapCompany(raw);
  },

  async getPostedJobs(): Promise<Job[]> {
    const rawJobs = await apiClient<any[]>('/jobs/my-jobs');
    return rawJobs.map(mapJobDtoToJob);
  },

  async getAllApplicants(filters?: ApplicantFilters): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters?.jobId && filters.jobId !== 'All') params.append('jobId', filters.jobId);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.minAtsScore) params.append('minScore', String(filters.minAtsScore));
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const rawApps = await apiClient<any[]>(`/applications/recruiter${queryString ? `?${queryString}` : ''}`);
    return rawApps.map(mapApplication);
  },

  async updateApplicantStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ): Promise<Application> {
    const raw = await apiClient<any>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note }),
    });
    return mapApplication(raw);
  },

  async updateAtsScore(applicationId: string, atsScore: number): Promise<Application> {
    const raw = await apiClient<any>(`/applications/${applicationId}/ats-score`, {
      method: 'PATCH',
      body: JSON.stringify({ atsScore }),
    });
    return mapApplication(raw);
  },

  async deleteApplicant(applicationId: string): Promise<void> {
    await apiClient(`/applications/${applicationId}`, {
      method: 'DELETE',
    });
  },

  async addApplicantNote(applicationId: string, note: string): Promise<Application> {
    const raw = await apiClient<any>(`/applications/${applicationId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    return mapApplication(raw);
  },

  async createManualApplicant(appData: Partial<Application>): Promise<Application> {
    try {
      const raw = await apiClient<any>('/applications/manual', {
        method: 'POST',
        body: JSON.stringify(appData),
      });
      return mapApplication(raw);
    } catch {
      const newApp: Application = {
        id: 'app-man-' + Date.now(),
        jobId: appData.jobId || 'job-general',
        jobTitle: appData.jobTitle || 'Software Engineer',
        company: appData.company || 'TechCorp Global',
        companyLogo: appData.companyLogo || '',
        candidateId: 'cand-man-' + Date.now(),
        candidateName: appData.candidateName || 'Candidate',
        candidateEmail: appData.candidateEmail || '',
        candidateAvatar: appData.candidateAvatar || '',
        candidateTitle: appData.candidateTitle || appData.jobTitle || 'Applicant',
        candidateLocation: appData.candidateLocation || 'Remote',
        resumeId: 'res-man-' + Date.now(),
        resumeFileName: appData.resumeFileName || `${(appData.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
        resumeUrl: '#',
        appliedDate: new Date().toISOString(),
        status: appData.status || 'Applied',
        atsScore: appData.atsScore ?? 85,
        matchPercentage: appData.matchPercentage ?? appData.atsScore ?? 85,
        experienceYears: appData.experienceYears ?? 3,
        skills: appData.skills || [],
        notes: appData.notes || ['Candidate manually registered by Talent Acquisition recruiter.'],
        timeline: [
          {
            status: appData.status || 'Applied',
            date: new Date().toISOString().split('T')[0],
            note: 'Profile created manually by Recruiter'
          }
        ]
      };
      const apps = storage.getApplications();
      storage.setApplications([newApp, ...apps]);
      return newApp;
    }
  },
};

function mapCompany(raw: any): Company {
  return {
    id: raw.id,
    name: raw.name || 'Company Name',
    logo: raw.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    tagline: raw.tagline || 'Leading innovation',
    industry: raw.industry || 'Technology',
    website: raw.website || 'https://example.com',
    location: raw.location || 'San Francisco, CA',
    size: raw.size || '100-500 employees',
    description: raw.description || 'Company description',
    foundedYear: raw.foundedYear || '2020',
    benefits: raw.benefits || ['Health Insurance', 'Remote Flexibility', '401(k) Matching'],
    contactEmail: raw.contactEmail || 'contact@example.com',
    contactPhone: raw.contactPhone || '+1 (555) 000-0000',
    verified: Boolean(raw.verified),
  };
}

function mapApplication(raw: any): Application {
  return {
    id: raw.id,
    jobId: raw.jobId,
    jobTitle: raw.jobTitle || 'Position',
    company: raw.company || 'Enterprise Company',
    companyLogo: raw.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    candidateId: raw.candidateId,
    candidateName: raw.candidateName || 'Candidate',
    candidateEmail: raw.candidateEmail || 'candidate@example.com',
    candidateAvatar: raw.candidateAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    candidateTitle: raw.candidateTitle || 'Software Engineer',
    candidateLocation: raw.candidateLocation || 'Remote',
    resumeId: raw.resumeId || 'res-1',
    resumeFileName: raw.resumeFileName || 'Resume.pdf',
    appliedDate: raw.appliedDate ? raw.appliedDate.split('T')[0] : '2026-08-01',
    status: (raw.status?.charAt(0).toUpperCase() + raw.status?.slice(1).toLowerCase()) as ApplicationStatus,
    atsScore: raw.atsScore || 85,
    matchPercentage: raw.matchPercentage || 85,
    skills: raw.skills || ['React', 'TypeScript', 'Java', 'Spring Boot'],
    experienceYears: raw.experienceYears || 4,
    notes: raw.notes || [],
    timeline: (raw.timeline || []).map((t: any) => ({
      status: t.status,
      date: t.date ? t.date.split('T')[0] : '2026-08-01',
      note: t.note,
    })),
  };
}
