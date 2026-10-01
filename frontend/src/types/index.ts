export type Role = 'candidate' | 'recruiter' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  phone?: string;
  companyName?: string;
  title?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface SkillCategory {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  avatar: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills: SkillCategory;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  profileCompletion: number; // 0 to 100
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  title?: string;
  fileSize: string;
  uploadDate: string;
  isPrimary: boolean;
  fileType: 'pdf' | 'docx';
  status: 'ready' | 'processing' | 'parsed';
  parsedData?: {
    extractedSkills: string[];
    extractedEducation: string[];
    extractedExperience: string[];
    extractedProjects: string[];
    extractedCertifications: string[];
  };
  resumeData?: string;
}

export interface ATSScoreBreakdown {
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  formattingScore: number;
}

export interface ATSAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  technicalScore: number;
  breakdown: ATSScoreBreakdown;
  missingKeywords: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  lastAnalyzed: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Internship';
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead' | 'Executive';
export type JobStatus = 'active' | 'closed' | 'draft';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  companyLogo: string;
  department: string;
  location: string;
  type: EmploymentType;
  experienceLevel: ExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  educationRequired: string;
  experienceRequiredYears: number;
  deadline: string;
  postedDate: string;
  status: JobStatus;
  applicantCount: number;
  recruiterId: string;
  matchScore?: number; // Computed score for candidate
  applied?: boolean;
  saved?: boolean;
  verifiedRecruiter?: boolean;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected';

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  candidateTitle: string;
  candidateLocation: string;
  resumeId: string;
  resumeFileName: string;
  resumeUrl?: string;
  appliedDate: string;
  status: ApplicationStatus;
  atsScore: number;
  matchPercentage: number;
  skills: string[];
  experienceYears: number;
  education?: string;
  notes: string[];
  timeline: ApplicationTimelineEvent[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  industry: string;
  website: string;
  location: string;
  size: string;
  description: string;
  foundedYear: string;
  benefits: string[];
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
}

export interface AdminStats {
  totalCandidates: number;
  totalRecruiters: number;
  activeUsers: number;
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  shortlistedCount: number;
  selectedCount: number;
  rejectedCount: number;
  placementRate: number;
  systemHealth: string;
}

export interface RecruiterStats {
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  interviewsScheduled: number;
  hiresThisMonth: number;
  averageTimeToHireDays: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface SystemActivityLog {
  id: string;
  actorName: string;
  actorRole: Role;
  action: string;
  target: string;
  timestamp: string;
  ipAddress?: string;
}
