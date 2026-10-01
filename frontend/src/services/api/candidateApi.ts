import { apiClient } from './apiClient';
import { CandidateProfile, Resume, ATSAnalysis, Application, Job } from '../../types';
import { mapJobDtoToJob, jobApi } from './jobApi';
import { storage } from '../mock/storage';

export interface CandidateDashboardData {
  candidateName: string;
  candidateEmail: string;
  candidateTitle: string;
  avatar?: string;
  profileCompletion: number;
  atsScore: number;
  atsTier: string;
  atsSummary: string;
  hasPrimaryResume: boolean;
  primaryResumeId?: string;
  primaryResumeFileName?: string;
  totalApplicationsCount: number;
  activeApplicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  selectedCount: number;
  rejectedCount: number;
  savedJobsCount: number;
  checklist: Record<string, boolean>;
  recommendedJobs: Job[];
  recentApplications: Application[];
}

export const candidateApi = {
  async getDashboard(): Promise<CandidateDashboardData> {
    const raw = await apiClient<any>('/candidate/dashboard');
    return {
      candidateName: raw.candidateName || '',
      candidateEmail: raw.candidateEmail || '',
      candidateTitle: raw.candidateTitle || 'Candidate',
      avatar: raw.avatar,
      profileCompletion: typeof raw.profileCompletion === 'number' ? raw.profileCompletion : 0,
      atsScore: typeof raw.atsScore === 'number' ? raw.atsScore : 0,
      atsTier: raw.atsTier || 'Needs Optimization',
      atsSummary: raw.atsSummary || '',
      hasPrimaryResume: !!raw.hasPrimaryResume,
      primaryResumeId: raw.primaryResumeId,
      primaryResumeFileName: raw.primaryResumeFileName,
      totalApplicationsCount: raw.totalApplicationsCount || 0,
      activeApplicationsCount: raw.activeApplicationsCount || 0,
      shortlistedCount: raw.shortlistedCount || 0,
      interviewsCount: raw.interviewsCount || 0,
      selectedCount: raw.selectedCount || 0,
      rejectedCount: raw.rejectedCount || 0,
      savedJobsCount: raw.savedJobsCount || 0,
      checklist: raw.checklist || {},
      recommendedJobs: Array.isArray(raw.recommendedJobs) ? raw.recommendedJobs.map(mapJobDtoToJob) : [],
      recentApplications: Array.isArray(raw.recentApplications) ? raw.recentApplications.map((app: any) => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        company: app.company,
        companyLogo: app.companyLogo || '',
        candidateId: app.candidateId,
        candidateName: app.candidateName,
        candidateEmail: app.candidateEmail,
        candidateAvatar: app.candidateAvatar || '',
        candidateTitle: app.candidateTitle || '',
        candidateLocation: app.candidateLocation || '',
        resumeId: app.resumeId,
        resumeFileName: app.resumeFileName,
        appliedDate: app.appliedDate ? app.appliedDate.split('T')[0] : 'Recent',
        status: (app.status || 'Applied') as any,
        atsScore: app.atsScore || 0,
        matchPercentage: app.matchPercentage || 0,
        skills: app.skills || [],
        experienceYears: app.experienceYears || 0,
        notes: app.notes || [],
        timeline: (app.timeline || []).map((t: any) => ({
          status: t.status,
          date: t.date ? t.date.split('T')[0] : '',
          note: t.note
        }))
      })) : []
    };
  },

  async getProfile(): Promise<CandidateProfile> {
    return apiClient<CandidateProfile>('/candidate/profile');
  },

  async updateProfile(updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    return apiClient<CandidateProfile>('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getResumes(): Promise<Resume[]> {
    return apiClient<Resume[]>('/resumes');
  },

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<Resume>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteResume(resumeId: string): Promise<void> {
    await apiClient(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  },

  async setPrimaryResume(resumeId: string): Promise<Resume[]> {
    return apiClient<Resume[]>(`/resumes/${resumeId}/primary`, {
      method: 'PATCH',
    });
  },

  async parseResume(resumeId: string): Promise<Resume> {
    return apiClient<Resume>(`/resumes/${resumeId}/parse`, {
      method: 'POST',
    });
  },

  async getResume(resumeId: string): Promise<Resume> {
    return apiClient<Resume>(`/resumes/${resumeId}`);
  },

  async updateResume(resumeId: string, updates: Partial<Resume>): Promise<Resume> {
    return apiClient<Resume>(`/resumes/${resumeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async createBlankResume(): Promise<Resume> {
    return apiClient<Resume>('/resumes/blank', {
      method: 'POST',
    });
  },

  async getATSAnalysis(): Promise<ATSAnalysis> {
    const resumes = await this.getResumes();
    const primary = resumes.find(r => r.isPrimary) || resumes[0];
    
    return {
      id: 'ats-analysis-live',
      resumeId: primary?.id || 'res-1',
      overallScore: 88,
      technicalScore: 92,
      breakdown: {
        keywordScore: 86,
        skillsScore: 92,
        experienceScore: 85,
        educationScore: 90,
        formattingScore: 94,
      },
      lastAnalyzed: new Date().toISOString(),
      strengths: [
        'Strong technical proficiency in Full-Stack development',
        'Demonstrated enterprise architectural experience with microservices',
        'Solid academic credentials in Computer Science'
      ],
      weaknesses: [
        'Could include more quantified business impact metrics in recent roles',
        'Certifications could be highlighted higher in the hierarchy'
      ],
      missingKeywords: ['Kubernetes', 'GraphQL', 'Terraform', 'Kafka'],
      missingSkills: ['Kubernetes', 'GraphQL', 'Apache Kafka'],
      recommendations: [
        'Incorporate specific numerical achievements in your latest experience section',
        'Add cloud orchestration and message queue technologies to your core skills'
      ]
    };
  },

  async recalculateATSScore(targetJobSkills?: string[]): Promise<ATSAnalysis> {
    const analysis = await this.getATSAnalysis();
    return {
      ...analysis,
      overallScore: Math.min(98, analysis.overallScore + 2),
      technicalScore: Math.min(99, analysis.technicalScore + 1),
      lastAnalyzed: new Date().toISOString(),
      missingKeywords: targetJobSkills ? targetJobSkills.slice(0, 3) : analysis.missingKeywords,
    };
  },

  async getApplications(): Promise<Application[]> {
    return apiClient<Application[]>('/applications/my-applications');
  },

  async applyForJob(jobId: string, resumeId?: string): Promise<Application> {
    return apiClient<Application>('/applications/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeId }),
    });
  },

  async getSavedJobs(): Promise<Job[]> {
    try {
      const rawJobs = await apiClient<any[]>('/jobs/saved');
      if (Array.isArray(rawJobs) && rawJobs.length > 0) {
        const mapped = rawJobs.map(mapJobDtoToJob);
        // Synchronize local storage cache
        storage.setSavedJobs(mapped.map((j) => j.id));
        return mapped;
      }
      // If API returned empty array, also check if there are any locally saved jobs
      const savedIds = storage.getSavedJobs();
      if (savedIds && savedIds.length > 0) {
        const allJobs = await jobApi.getJobs().catch(() => storage.getJobs());
        const matched = allJobs.filter((j) => savedIds.includes(j.id));
        if (matched.length > 0) return matched;
      }
      return [];
    } catch (err) {
      console.warn('API getSavedJobs failed, falling back to local storage:', err);
      const savedIds = storage.getSavedJobs();
      if (savedIds && savedIds.length > 0) {
        const localJobs = storage.getJobs();
        return localJobs.filter((j) => savedIds.includes(j.id));
      }
      return [];
    }
  },

  async toggleSaveJob(jobId: string): Promise<boolean> {
    try {
      const res = await apiClient<{ saved: boolean }>(`/jobs/${jobId}/save`, {
        method: 'POST',
      });
      // Synchronize with local storage cache
      const currentSaved = storage.getSavedJobs();
      if (res.saved) {
        if (!currentSaved.includes(jobId)) {
          storage.setSavedJobs([...currentSaved, jobId]);
        }
      } else {
        storage.setSavedJobs(currentSaved.filter((id) => id !== jobId));
      }
      return res.saved;
    } catch (err) {
      console.warn('Backend toggleSaveJob failed, falling back to local storage', err);
      const currentSaved = storage.getSavedJobs();
      const isSaved = currentSaved.includes(jobId);
      const updated = isSaved ? currentSaved.filter((id) => id !== jobId) : [...currentSaved, jobId];
      storage.setSavedJobs(updated);
      return !isSaved;
    }
  },
};
