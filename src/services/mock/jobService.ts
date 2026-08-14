import { Job, JobStatus, EmploymentType, ExperienceLevel } from '../../types';
import { storage, delay } from './storage';

export interface JobFilters {
  search?: string;
  department?: string;
  location?: string;
  type?: EmploymentType | 'All';
  experienceLevel?: ExperienceLevel | 'All';
  status?: JobStatus | 'All';
  minSalary?: number;
  minMatchScore?: number;
}

export const jobService = {
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    await delay(200);
    let jobs = storage.getJobs();

    if (!filters) return jobs;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.department && filters.department !== 'All') {
      jobs = jobs.filter((j) => j.department.toLowerCase().includes(filters.department!.toLowerCase()));
    }

    if (filters.location && filters.location !== 'All') {
      jobs = jobs.filter((j) => j.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    if (filters.type && filters.type !== 'All') {
      jobs = jobs.filter((j) => j.type === filters.type);
    }

    if (filters.experienceLevel && filters.experienceLevel !== 'All') {
      jobs = jobs.filter((j) => j.experienceLevel === filters.experienceLevel);
    }

    if (filters.status && filters.status !== 'All') {
      jobs = jobs.filter((j) => j.status === filters.status);
    }

    if (filters.minSalary) {
      jobs = jobs.filter((j) => j.salary.min >= filters.minSalary!);
    }

    if (filters.minMatchScore) {
      jobs = jobs.filter((j) => (j.matchScore || 0) >= filters.minMatchScore!);
    }

    return jobs;
  },

  async getJobById(id: string): Promise<Job | null> {
    await delay(150);
    const jobs = storage.getJobs();
    return jobs.find((j) => j.id === id) || null;
  },

  async getRecommendedJobs(limit: number = 6): Promise<Job[]> {
    await delay(200);
    const jobs = storage.getJobs().filter((j) => j.status === 'active');
    // Sort descending by match score
    return jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)).slice(0, limit);
  },

  async createJob(data: Omit<Job, 'id' | 'postedDate' | 'applicantCount' | 'recruiterId'>): Promise<Job> {
    await delay(350);
    const jobs = storage.getJobs();
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      applicantCount: 0,
      recruiterId: storage.getCurrentUserId(),
      matchScore: Math.floor(Math.random() * 20) + 75 // Mock candidate relevance score
    };
    storage.setJobs([newJob, ...jobs]);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    await delay(300);
    const jobs = storage.getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) throw new Error('Job not found');

    const updated = { ...jobs[index], ...updates };
    jobs[index] = updated;
    storage.setJobs([...jobs]);
    return updated;
  },

  async deleteJob(id: string): Promise<void> {
    await delay(250);
    const jobs = storage.getJobs().filter((j) => j.id !== id);
    storage.setJobs(jobs);
  },

  async toggleJobStatus(id: string, status: JobStatus): Promise<Job> {
    return this.updateJob(id, { status });
  }
};
