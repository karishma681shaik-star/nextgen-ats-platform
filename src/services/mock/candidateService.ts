import {
  CandidateProfile,
  Resume,
  ATSAnalysis,
  Application,
  Job
} from '../../types';
import { storage, delay } from './storage';

export const candidateService = {
  async getProfile(): Promise<CandidateProfile> {
    await delay(200);
    return storage.getCandidateProfile();
  },

  async updateProfile(updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    await delay(300);
    const current = storage.getCandidateProfile();
    const updated: CandidateProfile = {
      ...current,
      ...updates,
      // Recalculate completeness
      profileCompletion: Math.min(
        100,
        (updates.name ? 15 : 0) +
        (updates.bio ? 15 : 0) +
        (updates.skills?.technical?.length ? 20 : 0) +
        (updates.education?.length ? 20 : 0) +
        (updates.experience?.length ? 20 : 0) +
        (updates.projects?.length ? 10 : 0)
      )
    };
    storage.setCandidateProfile(updated);
    return updated;
  },

  async getResumes(): Promise<Resume[]> {
    await delay(200);
    return storage.getResumes();
  },

  async uploadResume(file: File): Promise<Resume> {
    await delay(500);
    const resumes = storage.getResumes();
    const isDocx = file.name.endsWith('.docx');
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      userId: storage.getCurrentUserId(),
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString(),
      isPrimary: resumes.length === 0,
      fileType: isDocx ? 'docx' : 'pdf',
      status: 'ready',
      parsedData: {
        extractedSkills: ['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
        extractedEducation: ['Bachelor of Science in Computer Science'],
        extractedExperience: ['Software Engineer (5+ years cumulative)'],
        extractedProjects: ['Full Stack Application Portal', 'Distributed Backend Engine'],
        extractedCertifications: ['Cloud Architecture Certification']
      }
    };
    const updated = [newResume, ...resumes];
    storage.setResumes(updated);
    return newResume;
  },

  async deleteResume(resumeId: string): Promise<void> {
    await delay(250);
    const resumes = storage.getResumes().filter((r) => r.id !== resumeId);
    storage.setResumes(resumes);
  },

  async setPrimaryResume(resumeId: string): Promise<Resume[]> {
    await delay(200);
    const resumes = storage.getResumes().map((r) => ({
      ...r,
      isPrimary: r.id === resumeId
    }));
    storage.setResumes(resumes);
    return resumes;
  },

  async parseResume(resumeId: string): Promise<Resume> {
    await delay(600); // Simulate multi-step AI parsing engine
    const resumes = storage.getResumes();
    const resume = resumes.find((r) => r.id === resumeId);
    if (!resume) throw new Error('Resume not found');

    const updated: Resume = {
      ...resume,
      status: 'parsed',
      parsedData: {
        extractedSkills: [
          'React', 'TypeScript', 'Node.js', 'Java', 'Spring Boot',
          'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Tailwind CSS', 'REST APIs'
        ],
        extractedEducation: ['BS Computer Science, UC Berkeley (3.85 GPA)'],
        extractedExperience: [
          'Senior Software Engineer at Aether Cloud Systems (2023-Present)',
          'Full Stack Software Engineer at Vanguard Digital Labs (2021-2023)'
        ],
        extractedProjects: [
          'DevPulse — Real-Time Developer Analytics Engine',
          'DocuQuery AI — Smart Document Search'
        ],
        extractedCertifications: [
          'AWS Certified Solutions Architect – Associate',
          'Certified Kubernetes Application Developer (CKAD)'
        ]
      }
    };

    const updatedList = resumes.map((r) => (r.id === resumeId ? updated : r));
    storage.setResumes(updatedList);
    return updated;
  },

  async getATSAnalysis(): Promise<ATSAnalysis> {
    await delay(250);
    return storage.getAtsAnalysis();
  },

  async recalculateATSScore(targetJobSkills?: string[]): Promise<ATSAnalysis> {
    await delay(450);
    const current = storage.getAtsAnalysis();
    // Simulate score refinement
    const updated: ATSAnalysis = {
      ...current,
      overallScore: Math.min(98, current.overallScore + 2),
      technicalScore: Math.min(99, current.technicalScore + 1),
      lastAnalyzed: new Date().toISOString(),
      missingKeywords: targetJobSkills ? targetJobSkills.slice(0, 3) : current.missingKeywords
    };
    storage.setAtsAnalysis(updated);
    return updated;
  },

  async getApplications(): Promise<Application[]> {
    await delay(200);
    const currentUserId = storage.getCurrentUserId();
    const apps = storage.getApplications();
    return apps.filter((a) => a.candidateId === currentUserId);
  },

  async applyForJob(jobId: string, resumeId: string): Promise<Application> {
    await delay(400);
    const jobs = storage.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const profile = storage.getCandidateProfile();
    const resumes = storage.getResumes();
    const resume = resumes.find((r) => r.id === resumeId) || resumes[0];

    const apps = storage.getApplications();
    const existing = apps.find((a) => a.jobId === jobId && a.candidateId === profile.userId);
    if (existing) return existing;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      candidateId: profile.userId,
      candidateName: profile.name,
      candidateEmail: profile.email,
      candidateAvatar: profile.avatar,
      candidateTitle: profile.title,
      candidateLocation: profile.location,
      resumeId: resume?.id || 'res-1',
      resumeFileName: resume?.fileName || 'Resume.pdf',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
      atsScore: job.matchScore || 88,
      matchPercentage: job.matchScore || 88,
      skills: profile.skills.technical,
      experienceYears: 5,
      notes: [],
      timeline: [
        {
          status: 'Applied',
          date: new Date().toISOString(),
          note: 'Application submitted via AI ATS Portal'
        }
      ]
    };

    storage.setApplications([newApp, ...apps]);

    // Increment job applicant count
    const updatedJobs = jobs.map((j) =>
      j.id === jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
    );
    storage.setJobs(updatedJobs);

    return newApp;
  },

  async getSavedJobs(): Promise<Job[]> {
    await delay(200);
    const savedIds = storage.getSavedJobs();
    const jobs = storage.getJobs();
    return jobs.filter((j) => savedIds.includes(j.id));
  },

  async toggleSaveJob(jobId: string): Promise<boolean> {
    await delay(150);
    const saved = storage.getSavedJobs();
    const isSaved = saved.includes(jobId);
    const updated = isSaved ? saved.filter((id) => id !== jobId) : [...saved, jobId];
    storage.setSavedJobs(updated);
    return !isSaved;
  }
};
