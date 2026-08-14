import {
  AdminStats,
  User,
  Company,
  Job,
  SystemActivityLog,
  UserStatus,
  Role
} from '../../types';
import { storage, delay } from './storage';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    await delay(150);
    const users = storage.getUsers();
    const jobs = storage.getJobs();
    const apps = storage.getApplications();

    return {
      totalCandidates: users.filter((u) => u.role === 'candidate').length * 240 + 82,
      totalRecruiters: users.filter((u) => u.role === 'recruiter').length * 45 + 14,
      activeUsers: users.filter((u) => u.status === 'active').length * 150 + 40,
      totalJobs: jobs.length + 320,
      activeJobs: jobs.filter((j) => j.status === 'active').length + 240,
      closedJobs: jobs.filter((j) => j.status === 'closed').length + 70,
      totalApplications: apps.length * 500 + 190,
      shortlistedCount: apps.filter((a) => a.status === 'Shortlisted').length * 120 + 40,
      selectedCount: apps.filter((a) => a.status === 'Selected').length * 60 + 12,
      rejectedCount: apps.filter((a) => a.status === 'Rejected').length * 100 + 54,
      placementRate: 76.4,
      systemHealth: '100% Operational (0.008s API Latency)'
    };
  },

  async getUsers(role?: Role | 'All', search?: string): Promise<User[]> {
    await delay(200);
    let users = storage.getUsers();

    if (role && role !== 'All') {
      users = users.filter((u) => u.role === role);
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyName && u.companyName.toLowerCase().includes(q))
      );
    }

    return users;
  },

  async toggleUserStatus(userId: string, status: UserStatus): Promise<User> {
    await delay(250);
    const users = storage.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const updated = { ...users[index], status };
    users[index] = updated;
    storage.setUsers([...users]);
    return updated;
  },

  async getCompanies(): Promise<Company[]> {
    await delay(200);
    return storage.getCompanies();
  },

  async verifyRecruiter(companyId: string, verified: boolean): Promise<Company> {
    await delay(250);
    const companies = storage.getCompanies();
    const index = companies.findIndex((c) => c.id === companyId);
    if (index === -1) throw new Error('Company not found');

    const updated = { ...companies[index], verified };
    companies[index] = updated;
    storage.setCompanies([...companies]);
    return updated;
  },

  async getJobsForModeration(): Promise<Job[]> {
    await delay(200);
    return storage.getJobs();
  },

  async moderateJob(jobId: string, action: 'approve' | 'reject' | 'remove'): Promise<void> {
    await delay(250);
    const jobs = storage.getJobs();
    if (action === 'remove' || action === 'reject') {
      storage.setJobs(jobs.filter((j) => j.id !== jobId));
    } else {
      const updated = jobs.map((j) => (j.id === jobId ? { ...j, status: 'active' as const } : j));
      storage.setJobs(updated);
    }
  },

  async getActivityLogs(): Promise<SystemActivityLog[]> {
    await delay(150);
    return storage.getSystemLogs();
  }
};
