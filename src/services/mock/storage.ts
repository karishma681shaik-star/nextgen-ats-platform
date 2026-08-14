import {
  INITIAL_USERS,
  INITIAL_CANDIDATE_PROFILE,
  INITIAL_RESUMES,
  INITIAL_ATS_ANALYSIS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SAVED_JOB_IDS,
  INITIAL_ADMIN_STATS,
  INITIAL_RECRUITER_STATS,
  INITIAL_SYSTEM_LOGS
} from '../../data/mockData';

const STORAGE_KEYS = {
  USERS: 'ai_ats_users_v1',
  CURRENT_USER_ID: 'ai_ats_current_user_id_v1',
  CANDIDATE_PROFILE: 'ai_ats_candidate_profile_v1',
  RESUMES: 'ai_ats_resumes_v1',
  ATS_ANALYSIS: 'ai_ats_analysis_v1',
  COMPANIES: 'ai_ats_companies_v1',
  JOBS: 'ai_ats_jobs_v1',
  APPLICATIONS: 'ai_ats_applications_v1',
  NOTIFICATIONS: 'ai_ats_notifications_v1',
  SAVED_JOBS: 'ai_ats_saved_jobs_v1',
  ADMIN_STATS: 'ai_ats_admin_stats_v1',
  RECRUITER_STATS: 'ai_ats_recruiter_stats_v1',
  SYSTEM_LOGS: 'ai_ats_system_logs_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

// Simulated network latency helper
export const delay = (ms: number = 250): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const storage = {
  getUsers: () => getItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  setUsers: (users: typeof INITIAL_USERS) => setItem(STORAGE_KEYS.USERS, users),

  getCurrentUserId: () => getItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr-cand-1'),
  setCurrentUserId: (id: string) => setItem(STORAGE_KEYS.CURRENT_USER_ID, id),

  getCandidateProfile: () => getItem(STORAGE_KEYS.CANDIDATE_PROFILE, INITIAL_CANDIDATE_PROFILE),
  setCandidateProfile: (profile: typeof INITIAL_CANDIDATE_PROFILE) => setItem(STORAGE_KEYS.CANDIDATE_PROFILE, profile),

  getResumes: () => getItem(STORAGE_KEYS.RESUMES, INITIAL_RESUMES),
  setResumes: (resumes: typeof INITIAL_RESUMES) => setItem(STORAGE_KEYS.RESUMES, resumes),

  getAtsAnalysis: () => getItem(STORAGE_KEYS.ATS_ANALYSIS, INITIAL_ATS_ANALYSIS),
  setAtsAnalysis: (analysis: typeof INITIAL_ATS_ANALYSIS) => setItem(STORAGE_KEYS.ATS_ANALYSIS, analysis),

  getCompanies: () => getItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES),
  setCompanies: (companies: typeof INITIAL_COMPANIES) => setItem(STORAGE_KEYS.COMPANIES, companies),

  getJobs: () => getItem(STORAGE_KEYS.JOBS, INITIAL_JOBS),
  setJobs: (jobs: typeof INITIAL_JOBS) => setItem(STORAGE_KEYS.JOBS, jobs),

  getApplications: () => getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
  setApplications: (applications: typeof INITIAL_APPLICATIONS) => setItem(STORAGE_KEYS.APPLICATIONS, applications),

  getNotifications: () => getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (notifications: typeof INITIAL_NOTIFICATIONS) => setItem(STORAGE_KEYS.NOTIFICATIONS, notifications),

  getSavedJobs: () => getItem(STORAGE_KEYS.SAVED_JOBS, INITIAL_SAVED_JOB_IDS),
  setSavedJobs: (jobIds: string[]) => setItem(STORAGE_KEYS.SAVED_JOBS, jobIds),

  getAdminStats: () => getItem(STORAGE_KEYS.ADMIN_STATS, INITIAL_ADMIN_STATS),
  setAdminStats: (stats: typeof INITIAL_ADMIN_STATS) => setItem(STORAGE_KEYS.ADMIN_STATS, stats),

  getRecruiterStats: () => getItem(STORAGE_KEYS.RECRUITER_STATS, INITIAL_RECRUITER_STATS),
  setRecruiterStats: (stats: typeof INITIAL_RECRUITER_STATS) => setItem(STORAGE_KEYS.RECRUITER_STATS, stats),

  getSystemLogs: () => getItem(STORAGE_KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS),
  setSystemLogs: (logs: typeof INITIAL_SYSTEM_LOGS) => setItem(STORAGE_KEYS.SYSTEM_LOGS, logs),

  resetToDefault: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
