export * from './api/apiClient';
export * from './api/authApi';
export * from './api/candidateApi';
export * from './api/jobApi';
export * from './api/recruiterApi';
export * from './api/adminApi';

// Re-export services under original names for seamless compatibility
export { authApi as authService } from './api/authApi';
export { candidateApi as candidateService } from './api/candidateApi';
export { jobApi as jobService } from './api/jobApi';
export { recruiterApi as recruiterService } from './api/recruiterApi';
export { adminApi as adminService } from './api/adminApi';
