import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { CandidateLayout } from '../layouts/CandidateLayout';
import { RecruiterLayout } from '../layouts/RecruiterLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../layouts/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { EmailVerificationPage } from '../pages/auth/EmailVerificationPage';

// Candidate Pages
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { CandidateProfilePage } from '../pages/candidate/CandidateProfilePage';
import { ResumeManagementPage } from '../pages/candidate/ResumeManagementPage';
import { ResumeParsingPage } from '../pages/candidate/ResumeParsingPage';
import { ATSAnalysisPage } from '../pages/candidate/ATSAnalysisPage';
import { JobDiscoveryPage } from '../pages/candidate/JobDiscoveryPage';
import { JobDetailsPage } from '../pages/candidate/JobDetailsPage';
import { ApplicationsPage } from '../pages/candidate/ApplicationsPage';
import { SavedJobsPage } from '../pages/candidate/SavedJobsPage';
import { ResumeBuilderPage } from '../pages/candidate/ResumeBuilderPage';

// Recruiter Pages
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { CompanyProfilePage } from '../pages/recruiter/CompanyProfilePage';
import { JobManagementPage } from '../pages/recruiter/JobManagementPage';
import { CreateJobPage } from '../pages/recruiter/CreateJobPage';
import { ApplicantManagementPage } from '../pages/recruiter/ApplicantManagementPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { RecruiterVerificationPage } from '../pages/admin/RecruiterVerificationPage';
import { JobModerationPage } from '../pages/admin/JobModerationPage';
import { PlatformAnalyticsPage } from '../pages/admin/PlatformAnalyticsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      {/* Standalone Fullscreen Resume Builder Routes */}
      <Route
        path="/resume-builder/:id"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'admin', 'recruiter']}>
            <ResumeBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/resume-builder/:id"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'admin', 'recruiter']}>
            <ResumeBuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Candidate Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'admin', 'recruiter']}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="resumes" element={<ResumeManagementPage />} />
        <Route path="resume-parser" element={<ResumeParsingPage />} />
        <Route path="resume-analysis" element={<ATSAnalysisPage />} />
        <Route path="jobs" element={<JobDiscoveryPage />} />
        <Route path="jobs/:id" element={<JobDetailsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="saved-jobs" element={<SavedJobsPage />} />
      </Route>

      {/* Recruiter Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'candidate']}>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="company" element={<CompanyProfilePage />} />
        <Route path="jobs" element={<JobManagementPage />} />
        <Route path="jobs/new" element={<CreateJobPage />} />
        <Route path="jobs/:id" element={<CreateJobPage />} />
        <Route path="applicants" element={<ApplicantManagementPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'recruiter', 'candidate']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="recruiters" element={<RecruiterVerificationPage />} />
        <Route path="jobs" element={<JobModerationPage />} />
        <Route path="analytics" element={<PlatformAnalyticsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
