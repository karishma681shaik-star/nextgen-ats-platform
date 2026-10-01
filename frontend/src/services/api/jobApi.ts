import { apiClient } from './apiClient';
import { Job, JobStatus, EmploymentType, ExperienceLevel } from '../../types';

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

export const jobApi = {
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location && filters.location !== 'All') params.append('location', filters.location);
    if (filters?.type && filters.type !== 'All') params.append('type', filters.type);
    if (filters?.experienceLevel && filters.experienceLevel !== 'All') params.append('level', filters.experienceLevel);

    const queryString = params.toString();
    const endpoint = `/jobs${queryString ? `?${queryString}` : ''}`;
    const rawJobs = await apiClient<any[]>(endpoint);

    return rawJobs.map(mapJobDtoToJob);
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const rawJob = await apiClient<any>(`/jobs/${id}`);
      return mapJobDtoToJob(rawJob);
    } catch {
      return null;
    }
  },

  async getRecommendedJobs(limit: number = 6): Promise<Job[]> {
    const jobs = await this.getJobs();
    return jobs.filter(j => j.status === 'active').slice(0, limit);
  },

  async createJob(data: Omit<Job, 'id' | 'postedDate' | 'applicantCount' | 'recruiterId'>): Promise<Job> {
    const payload = {
      title: data.title,
      location: data.location,
      type: data.type,
      experienceLevel: data.experienceLevel,
      salaryMin: String(data.salary?.min || 0),
      salaryMax: String(data.salary?.max || 0),
      currency: data.salary?.currency || 'USD',
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities,
      skills: data.skills,
      deadline: data.deadline,
      status: data.status?.toUpperCase() || 'ACTIVE',
    };

    const res = await apiClient<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapJobDtoToJob(res);
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const payload: any = { ...updates };
    if (updates.salary) {
      payload.salaryMin = String(updates.salary.min);
      payload.salaryMax = String(updates.salary.max);
      payload.currency = updates.salary.currency;
    }
    const res = await apiClient<any>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapJobDtoToJob(res);
  },

  async deleteJob(id: string): Promise<void> {
    await apiClient(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleJobStatus(id: string, status: JobStatus): Promise<Job> {
    return this.updateJob(id, { status });
  },
};

export function mapJobDtoToJob(dto: any): Job {
  return {
    id: dto.id,
    title: dto.title,
    company: dto.company || 'Enterprise Partner',
    companyId: dto.companyId || 'comp-1',
    companyLogo: dto.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    location: dto.location,
    type: (dto.type as EmploymentType) || 'Full-time',
    experienceLevel: (dto.experienceLevel as ExperienceLevel) || 'Mid Level',
    department: dto.department || 'Engineering',
    salary: {
      min: Number(dto.salaryMin) || 120000,
      max: Number(dto.salaryMax) || 160000,
      currency: dto.currency || 'USD',
      period: 'yearly',
    },
    description: dto.description || '',
    responsibilities: dto.responsibilities || [],
    requirements: dto.requirements || [],
    skills: dto.skills || [],
    educationRequired: dto.educationRequired || "Bachelor's Degree in CS or related field",
    experienceRequiredYears: dto.experienceRequiredYears || 3,
    status: (dto.status?.toLowerCase() as JobStatus) || 'active',
    postedDate: dto.postedAt ? dto.postedAt.split('T')[0] : '2026-08-01',
    deadline: dto.deadline || '2026-12-31',
    applicantCount: dto.applicantsCount || 0,
    recruiterId: dto.recruiterId || 'rec-1',
    matchScore: dto.matchScore && !isNaN(Number(dto.matchScore)) ? Number(dto.matchScore) : undefined,
    applied: dto.applied === true,
    saved: dto.saved === true,
    verifiedRecruiter: dto.verifiedRecruiter !== undefined ? dto.verifiedRecruiter : true,
  };
}
