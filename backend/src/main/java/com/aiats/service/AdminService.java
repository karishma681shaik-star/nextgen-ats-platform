package com.aiats.service;

import com.aiats.dto.admin.AdminStatsDTO;
import com.aiats.dto.admin.AuditPageResult;
import com.aiats.dto.admin.AuditSummaryDTO;
import com.aiats.dto.admin.RecruiterVerificationDTO;
import com.aiats.dto.admin.RecruitmentAnalyticsDTO;
import com.aiats.dto.admin.SystemActivityLogDTO;
import com.aiats.dto.auth.UserDTO;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import com.aiats.dto.admin.AiSuggestionDTO;
import com.aiats.dto.admin.AuditCleanupExecutionRequest;
import com.aiats.dto.admin.AuditCleanupPreviewDTO;
import com.aiats.dto.admin.AuditCleanupPreviewRequest;
import com.aiats.dto.admin.AuditCleanupReceiptDTO;
import com.aiats.dto.admin.VerificationDecisionRequest;
import com.aiats.dto.admin.VerificationHistoryDTO;
import com.aiats.dto.job.JobDTO;
import com.aiats.dto.admin.JobModerationDecisionRequest;
import com.aiats.dto.admin.RecruiterPerformanceDTO;
import com.aiats.dto.admin.CandidatePerformanceDTO;
import com.aiats.dto.admin.AiRiskFlagDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final SystemActivityLogRepository systemActivityLogRepository;
    private final ActivityLogService activityLogService;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final SavedJobRepository savedJobRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecurityAlertRepository securityAlertRepository;

    @Autowired(required = false)
    private VerificationHistoryRepository verificationHistoryRepository;

    @Autowired(required = false)
    private GeminiAiService geminiAiService;

    @Autowired(required = false)
    private AuditCleanupReceiptRepository auditCleanupReceiptRepository;

    @Autowired(required = false)
    private CandidateReportRepository candidateReportRepository;

    public AdminService(UserRepository userRepository,
                        JobRepository jobRepository,
                        ApplicationRepository applicationRepository,
                        CompanyRepository companyRepository,
                        SystemActivityLogRepository systemActivityLogRepository,
                        ActivityLogService activityLogService) {
        this(userRepository, jobRepository, applicationRepository, companyRepository,
             systemActivityLogRepository, activityLogService, null, null, null, null, null, null, null, null);
    }

    public AdminService(UserRepository userRepository,
                        JobRepository jobRepository,
                        ApplicationRepository applicationRepository,
                        CompanyRepository companyRepository,
                        SystemActivityLogRepository systemActivityLogRepository,
                        ActivityLogService activityLogService,
                        NotificationRepository notificationRepository,
                        EmailService emailService) {
        this(userRepository, jobRepository, applicationRepository, companyRepository,
             systemActivityLogRepository, activityLogService, notificationRepository, emailService,
             null, null, null, null, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AdminService(UserRepository userRepository,
                        JobRepository jobRepository,
                        ApplicationRepository applicationRepository,
                        CompanyRepository companyRepository,
                        SystemActivityLogRepository systemActivityLogRepository,
                        ActivityLogService activityLogService,
                        NotificationRepository notificationRepository,
                        EmailService emailService,
                        CandidateProfileRepository candidateProfileRepository,
                        ResumeRepository resumeRepository,
                        ResumeAnalysisRepository resumeAnalysisRepository,
                        SavedJobRepository savedJobRepository,
                        PasswordResetTokenRepository passwordResetTokenRepository,
                        SecurityAlertRepository securityAlertRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.systemActivityLogRepository = systemActivityLogRepository;
        this.activityLogService = activityLogService;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.candidateProfileRepository = candidateProfileRepository;
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.savedJobRepository = savedJobRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.securityAlertRepository = securityAlertRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        AdminStatsDTO dto = new AdminStatsDTO();
        long totalUsers = userRepository.count();
        long candidates = userRepository.countByRole(Role.CANDIDATE);
        long recruiters = userRepository.countByRole(Role.RECRUITER);
        long pendingVerifications = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.PENDING)
                + userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.RESUBMITTED);
        long verifiedRecruiters = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.VERIFIED);
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);

        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus(JobStatus.ACTIVE);
        long closedJobs = jobRepository.countByStatus(JobStatus.CLOSED);

        long totalApps = applicationRepository.count();
        long pendingApps = applicationRepository.countByStatus(ApplicationStatus.APPLIED);
        long shortlistedApps = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long selectedApps = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long rejectedApps = applicationRepository.countByStatus(ApplicationStatus.REJECTED);

        dto.setTotalUsers(totalUsers);
        dto.setTotalCandidates(candidates);
        dto.setTotalRecruiters(recruiters);
        dto.setPendingVerifications(pendingVerifications);
        dto.setVerifiedRecruiters(verifiedRecruiters);
        dto.setRejectedRecruiters(userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.REJECTED));
        dto.setSuspendedRecruiters(userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.SUSPENDED));
        dto.setActiveUsers(activeUsers);
        dto.setSuspendedAccounts(userRepository.countByStatus(UserStatus.SUSPENDED));

        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long activeAdmins = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);
        dto.setTotalAdmins(totalAdmins);
        dto.setActiveAdmins(activeAdmins);
        dto.setMultipleAdminsFlag(totalAdmins > 1);

        dto.setTotalJobs(totalJobs);
        dto.setActiveJobs(activeJobs);
        dto.setClosedJobs(closedJobs);

        dto.setTotalApplications(totalApps);
        dto.setPendingApplications(pendingApps);
        dto.setShortlistedCount(shortlistedApps);
        dto.setSelectedCount(selectedApps);
        dto.setRejectedCount(rejectedApps);
        dto.setTotalCompanies(companyRepository.count());

        // Placement rate rule: only calculate if valid outcome data exists
        if (totalApps > 0 && selectedApps > 0) {
            double rate = Math.round(((double) selectedApps / totalApps) * 1000.0) / 10.0;
            dto.setPlacementRate(rate);
        } else {
            dto.setPlacementRate(null); // Displays "Not available yet" on frontend
        }

        // SECTION 1.A: RECRUITER VERIFICATION OVERVIEW
        long additionalEvidence = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.ADDITIONAL_EVIDENCE_REQUIRED);
        dto.setAdditionalEvidenceRequiredRecruiters(additionalEvidence);

        // SECTION 1.B: COMPANY VERIFICATION OVERVIEW
        dto.setCompaniesAwaitingReview(companyRepository.countByVerifiedFalse());
        dto.setCompaniesVerified(companyRepository.countByVerifiedTrue());
        dto.setCompanyAssociationChecksPending(companyRepository.countByAssociationCheckStatus("PENDING"));
        dto.setCompanyDiscrepanciesCount(companyRepository.countByRegistrationCheckStatus("DISCREPANCY"));
        dto.setCompaniesReverificationRequired(companyRepository.countByReverificationRequiredTrue());

        // SECTION 1.C: JOB SAFETY OVERVIEW
        dto.setJobsPendingModeration(jobRepository.countByStatus(JobStatus.PENDING_APPROVAL));
        dto.setJobsPublished(activeJobs);
        dto.setJobsRejected(jobRepository.countByStatus(JobStatus.REJECTED));
        dto.setJobsFlaggedSuspicious(securityAlertRepository != null ? securityAlertRepository.countByRiskCategory("SUSPICIOUS_JOB_DESCRIPTION") : 0);
        dto.setJobsCandidateReported(candidateReportRepository != null ? candidateReportRepository.count() : 0);
        dto.setJobsUnpublishedForInvestigation(jobRepository.countByStatus(JobStatus.ARCHIVED));

        // SECTION 1.D: RISK REVIEW OVERVIEW
        dto.setHighPriorityRiskCases(securityAlertRepository != null ? securityAlertRepository.countByRiskLevel("HIGH") : 0);
        dto.setDuplicateRecruiterProfilesCount(securityAlertRepository != null ? securityAlertRepository.countByRiskCategory("DUPLICATE_REGISTRATION_ATTEMPT") : 0);
        dto.setCompanyInfoMismatchesCount(companyRepository.countByRegistrationCheckStatus("DISCREPANCY"));
        dto.setUnresolvedAssociationChecksCount(companyRepository.countByAssociationCheckStatus("UNRESOLVED"));
        dto.setRepeatedModerationViolationsCount(jobRepository.countByStatus(JobStatus.REJECTED));
        dto.setOpenCandidateComplaintsCount(candidateReportRepository != null ? candidateReportRepository.countByStatus("PENDING") : 0);

        dto.setSystemHealth("100% Operational (PostgreSQL Connected)");
        return dto;
    }

    public UUID getCanonicalAdminId() {
        return userRepository.findByEmailIgnoreCase("admin@ai-ats.internal")
                .map(User::getId)
                .orElse(null);
    }

    public String getCanonicalAdminName() {
        return userRepository.findByEmailIgnoreCase("admin@ai-ats.internal")
                .map(User::getFullName)
                .orElse("Marcus Vance");
    }

    @Transactional(readOnly = true)
    public RecruitmentAnalyticsDTO getRecruitmentAnalytics() {
        RecruitmentAnalyticsDTO dto = new RecruitmentAnalyticsDTO();

        // Account Metrics
        long candidates = userRepository.countByRole(Role.CANDIDATE);
        long recruiters = userRepository.countByRole(Role.RECRUITER);
        long pendingVerifications = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.PENDING);
        long verifiedRecruiters = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.VERIFIED);
        long rejectedRecruiters = userRepository.countByRoleAndVerificationStatus(Role.RECRUITER, VerificationStatus.REJECTED);
        long suspendedAccounts = userRepository.countByStatus(UserStatus.SUSPENDED);
        long activeAdmins = userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE);

        dto.setTotalCandidates(candidates);
        dto.setTotalRecruiters(recruiters);
        dto.setPendingVerifications(pendingVerifications);
        dto.setVerifiedRecruiters(verifiedRecruiters);
        dto.setRejectedRecruiters(rejectedRecruiters);
        dto.setSuspendedAccounts(suspendedAccounts);
        dto.setActiveAdmins(activeAdmins);

        // Job Metrics
        dto.setTotalJobs(jobRepository.count());
        dto.setActiveJobs(jobRepository.countByStatus(JobStatus.ACTIVE));
        dto.setClosedJobs(jobRepository.countByStatus(JobStatus.CLOSED));
        dto.setDraftJobs(jobRepository.countByStatus(JobStatus.DRAFT));

        // Application Pipeline Metrics
        long totalApps = applicationRepository.count();
        long awaitingReview = applicationRepository.countByStatus(ApplicationStatus.APPLIED) + applicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW);
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long interviewsScheduled = applicationRepository.countByStatus(ApplicationStatus.INTERVIEW);
        long offersIssued = applicationRepository.countByStatus(ApplicationStatus.OFFERED);
        long successfulHires = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        long rejectedApps = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long withdrawnApps = applicationRepository.countByStatus(ApplicationStatus.WITHDRAWN);

        dto.setTotalApplications(totalApps);
        dto.setAwaitingReview(awaitingReview);
        dto.setShortlisted(shortlisted);
        dto.setInterviewsScheduled(interviewsScheduled);
        dto.setOffersIssued(offersIssued);
        dto.setSuccessfulHires(successfulHires);
        dto.setRejectedApplications(rejectedApps);
        dto.setWithdrawnApplications(withdrawnApps);

        // Security Metrics
        if (securityAlertRepository != null) {
            dto.setPendingSecurityAlerts(securityAlertRepository.countByReviewStatus("PENDING"));
            dto.setTotalSecurityAlerts(securityAlertRepository.count());
            dto.setHighRiskAlerts(securityAlertRepository.countByRiskLevel("HIGH"));
        } else {
            dto.setPendingSecurityAlerts(0);
            dto.setTotalSecurityAlerts(0);
            dto.setHighRiskAlerts(0);
        }

        // Conversion Rates (Percentages, null if denominator is 0)
        if (totalApps > 0) {
            dto.setApplicationToShortlistRate(Math.round(((double) shortlisted / totalApps) * 1000.0) / 10.0);
        } else {
            dto.setApplicationToShortlistRate(null);
        }

        if (shortlisted > 0) {
            dto.setShortlistToInterviewRate(Math.round(((double) interviewsScheduled / shortlisted) * 1000.0) / 10.0);
        } else {
            dto.setShortlistToInterviewRate(null);
        }

        if (interviewsScheduled > 0) {
            dto.setInterviewToOfferRate(Math.round(((double) offersIssued / interviewsScheduled) * 1000.0) / 10.0);
        } else {
            dto.setInterviewToOfferRate(null);
        }

        if (offersIssued > 0) {
            dto.setOfferToHireRate(Math.round(((double) successfulHires / offersIssued) * 1000.0) / 10.0);
        } else {
            dto.setOfferToHireRate(null);
        }

        if (totalApps > 0 && successfulHires > 0) {
            dto.setOverallPlacementRate(Math.round(((double) successfulHires / totalApps) * 1000.0) / 10.0);
        } else {
            dto.setOverallPlacementRate(null);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(String roleFilter, String statusFilter, String search) {
        Role role = null;
        if (roleFilter != null && !roleFilter.equalsIgnoreCase("all") && !roleFilter.isBlank()) {
            try { role = Role.valueOf(roleFilter.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        UserStatus status = null;
        VerificationStatus vStatus = null;
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("all") && !statusFilter.isBlank()) {
            try {
                status = UserStatus.valueOf(statusFilter.toUpperCase());
            } catch (IllegalArgumentException e) {
                try {
                    vStatus = VerificationStatus.valueOf(statusFilter.toUpperCase());
                } catch (IllegalArgumentException ignored) {}
            }
        }

        String searchTrimmed = (search != null && !search.isBlank()) ? search.trim() : null;

        List<User> users = userRepository.filterUsers(role, status, vStatus, searchTrimmed);
        return users.stream().map(this::toUserDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecruiterVerificationDTO> getRecruiterVerificationQueue(String statusFilter) {
        List<User> recruiters;
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("all") && !statusFilter.isBlank()) {
            if ("pending".equalsIgnoreCase(statusFilter)) {
                List<User> pendingList = userRepository.findByRoleAndVerificationStatusOrderByCreatedAtDesc(Role.RECRUITER, VerificationStatus.PENDING);
                List<User> resubmittedList = userRepository.findByRoleAndVerificationStatusOrderByCreatedAtDesc(Role.RECRUITER, VerificationStatus.RESUBMITTED);
                recruiters = new ArrayList<>(pendingList);
                recruiters.addAll(resubmittedList);
                recruiters.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            } else if ("resubmitted".equalsIgnoreCase(statusFilter)) {
                recruiters = userRepository.findByRoleAndVerificationStatusOrderByCreatedAtDesc(Role.RECRUITER, VerificationStatus.RESUBMITTED);
            } else {
                try {
                    VerificationStatus vs = VerificationStatus.valueOf(statusFilter.toUpperCase());
                    recruiters = userRepository.findByRoleAndVerificationStatusOrderByCreatedAtDesc(Role.RECRUITER, vs);
                } catch (IllegalArgumentException e) {
                    recruiters = userRepository.findByRoleAndVerificationStatusNotOrderByCreatedAtDesc(Role.RECRUITER, VerificationStatus.ARCHIVED);
                }
            }
        } else {
            recruiters = userRepository.findByRoleAndVerificationStatusNotOrderByCreatedAtDesc(Role.RECRUITER, VerificationStatus.ARCHIVED);
        }

        List<RecruiterVerificationDTO> dtoList = new ArrayList<>();
        for (User r : recruiters) {
            Company company = companyRepository.findByRecruiter(r)
                    .or(() -> companyRepository.findByRecruiterId(r.getId()))
                    .orElse(null);
            dtoList.add(toVerificationDTO(r, company));
        }
        return dtoList;
    }

    @Transactional
    public RecruiterVerificationDTO approveRecruiter(UUID recruiterId, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();
        VerificationStatus prevStatus = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.PENDING;

        recruiter.setVerificationStatus(VerificationStatus.VERIFIED);
        recruiter.setVerifiedAt(Instant.now());
        recruiter.setVerifiedBy(resolvedAdminName);
        recruiter.setRejectionReason(null);
        recruiter.setRejectionCategory(null);
        recruiter.setStatus(UserStatus.ACTIVE);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(true);
            companyRepository.save(company);
        }

        if (verificationHistoryRepository != null) {
            VerificationHistory history = new VerificationHistory(
                    savedRecruiter, prevStatus, VerificationStatus.VERIFIED,
                    resolvedAdminId, resolvedAdminName, null, "Approved by administrator. Recruiter authorized to post job requisitions.",
                    null, null, true, null
            );
            verificationHistoryRepository.save(history);
        }

        if (notificationRepository != null) {
            String notifTitle = "Your Recruiter Account Has Been Verified";
            boolean alreadyNotified = notificationRepository.findByUserIdOrderByCreatedAtDesc(savedRecruiter.getId())
                    .stream().anyMatch(n -> notifTitle.equals(n.getTitle()));
            if (!alreadyNotified) {
                String companyNameDisplay = (company != null && company.getName() != null && !company.getName().isBlank())
                        ? company.getName() : (savedRecruiter.getCompanyName() != null ? savedRecruiter.getCompanyName() : "your organization");

                String notifMessage = "Hello " + savedRecruiter.getFullName() + ",\n\n"
                        + "Your recruiter account for " + companyNameDisplay + " has been successfully verified by the administrator.\n\n"
                        + "You are now eligible to publish job opportunities on the NextGen ATS Platform.\n\n"
                        + "Thank you,\nNextGen ATS Platform";

                Notification notif = new Notification(savedRecruiter, notifTitle, notifMessage, "success", "/recruiter/jobs/new");
                notificationRepository.save(notif);
            }
        }

        if (emailService != null) {
            try {
                String cName = (company != null && company.getName() != null) ? company.getName() : savedRecruiter.getCompanyName();
                emailService.sendVerificationApprovedEmail(savedRecruiter.getEmail(), savedRecruiter.getFullName(), cName);
            } catch (Exception ex) {
                // Safe email failure logging without rolling back transaction
            }
        }

        if (activityLogService != null) {
            String orgName = (company != null && company.getName() != null) ? company.getName() : savedRecruiter.getCompanyName();
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Recruiter Verification Approved", savedRecruiter.getFullName() + (orgName != null ? " (" + orgName + ")" : ""), null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public RecruiterVerificationDTO rejectRecruiter(UUID recruiterId, VerificationDecisionRequest request, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String category = (request != null && request.getCategory() != null && !request.getCategory().isBlank())
                ? request.getCategory().trim() : "Other — administrator specified reason";
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim() : null;

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A detailed rejection reason is required.");
        }

        String correctiveActions = (request != null && request.getCorrectiveActions() != null && !request.getCorrectiveActions().isBlank())
                ? request.getCorrectiveActions().trim() : null;
        String aiSuggestions = (request != null && request.getAiSuggestions() != null && !request.getAiSuggestions().isBlank())
                ? request.getAiSuggestions().trim() : null;
        Boolean resubmissionAllowed = (request != null && request.getResubmissionAllowed() != null)
                ? request.getResubmissionAllowed() : true;
        String resubmissionNotes = (request != null && request.getResubmissionNotes() != null && !request.getResubmissionNotes().isBlank())
                ? request.getResubmissionNotes().trim() : null;

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();
        VerificationStatus prevStatus = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.PENDING;

        recruiter.setVerificationStatus(VerificationStatus.REJECTED);
        recruiter.setRejectionCategory(category);
        recruiter.setRejectionReason(reason);
        recruiter.setCorrectiveActions(correctiveActions);
        recruiter.setAiSuggestions(aiSuggestions);
        recruiter.setResubmissionAllowed(resubmissionAllowed);
        recruiter.setResubmissionNotes(resubmissionNotes);
        recruiter.setVerifiedAt(Instant.now());
        recruiter.setVerifiedBy(resolvedAdminName);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(false);
            companyRepository.save(company);
        }

        if (verificationHistoryRepository != null) {
            VerificationHistory history = new VerificationHistory(
                    savedRecruiter, prevStatus, VerificationStatus.REJECTED,
                    resolvedAdminId, resolvedAdminName, category, reason,
                    correctiveActions, aiSuggestions, resubmissionAllowed, null
            );
            verificationHistoryRepository.save(history);
        }

        if (notificationRepository != null) {
            String companyNameDisplay = (company != null && company.getName() != null && !company.getName().isBlank())
                    ? company.getName() : (savedRecruiter.getCompanyName() != null ? savedRecruiter.getCompanyName() : "your organization");

            String notifTitle = "Recruiter Verification Update";
            String notifMessage = "Hello " + savedRecruiter.getFullName() + ",\n\n"
                    + "Your company verification request for " + companyNameDisplay + " requires further attention.\n\n"
                    + "Rejection Category: " + category + "\n"
                    + "Reason: " + reason + "\n"
                    + (correctiveActions != null ? "\nRequired Corrections: " + correctiveActions + "\n" : "")
                    + "\nPlease review the decision details and recommended corrective actions in your Verification & Improvement Centre.\n\n"
                    + "Thank you,\nNextGen ATS Platform";

            Notification notif = new Notification(savedRecruiter, notifTitle, notifMessage, "error", "/recruiter/verification");
            notificationRepository.save(notif);
        }

        if (emailService != null) {
            try {
                emailService.sendVerificationRejectedEmail(savedRecruiter.getEmail(), savedRecruiter.getFullName(), reason);
            } catch (Exception ex) {
                // Safe email failure logging without rolling back transaction
            }
        }

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Recruiter Verification Rejected", savedRecruiter.getFullName() + " (" + category + ": " + reason + ")", null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public RecruiterVerificationDTO rejectRecruiter(UUID recruiterId, String reason, String adminIdentifier) {
        VerificationDecisionRequest req = new VerificationDecisionRequest();
        req.setCategory("Company information is incomplete");
        req.setReason(reason != null && !reason.isBlank() ? reason : "Employer credentials could not be authenticated.");
        return rejectRecruiter(recruiterId, req, adminIdentifier);
    }

    @Transactional(readOnly = true)
    public List<AiSuggestionDTO> generateImprovementSuggestions(UUID recruiterId, String category, String reason) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        String companyName = (company != null && company.getName() != null) ? company.getName() : recruiter.getCompanyName();
        String website = (company != null && company.getWebsite() != null) ? company.getWebsite() : "Not provided";
        String industry = (company != null && company.getIndustry() != null) ? company.getIndustry() : "Not provided";
        String location = (company != null && company.getLocation() != null) ? company.getLocation() : "Not provided";
        String size = (company != null && company.getSize() != null) ? company.getSize() : "Not provided";
        String description = (company != null && company.getDescription() != null) ? company.getDescription() : "Not provided";

        if (geminiAiService != null && geminiAiService.isConfigured()) {
            try {
                String systemPrompt = "You are an enterprise recruitment compliance and identity verification AI assistant. "
                        + "Your task is to analyze recruiter verification rejection reasons and generate structured, actionable, and professional improvement suggestions. "
                        + "Do NOT invent legal statutes or government verification claims. "
                        + "Return ONLY a valid JSON array of objects conforming to the schema: "
                        + "[{\"issue\":\"...\",\"whyItMatters\":\"...\",\"recommendedAction\":\"...\",\"requiredDocumentOrInfo\":\"...\",\"profileCorrectionInstructions\":\"...\",\"adminReviewRequired\":true,\"status\":\"Action Required\"}]. "
                        + "Ensure the JSON is strictly valid without markdown backticks.";

                String userPrompt = "Recruiter: " + recruiter.getFullName() + " (" + recruiter.getEmail() + ")\n"
                        + "Company: " + companyName + "\n"
                        + "Website: " + website + "\n"
                        + "Industry: " + industry + "\n"
                        + "Location: " + location + "\n"
                        + "Company Size: " + size + "\n"
                        + "Company Description: " + description + "\n"
                        + "Selected Rejection Category: " + (category != null ? category : "General Incomplete Information") + "\n"
                        + "Administrator Stated Reason: " + (reason != null ? reason : "Verification documents or profile data require correction.") + "\n\n"
                        + "Generate 2 to 3 tailored corrective suggestions to help this employer rectify their verification profile.";

                String rawResponse = geminiAiService.chat(systemPrompt, userPrompt);
                if (rawResponse != null && !rawResponse.isBlank()) {
                    String cleanJson = rawResponse.trim();
                    if (cleanJson.startsWith("```json")) {
                        cleanJson = cleanJson.substring(7);
                    } else if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.substring(3);
                    }
                    if (cleanJson.endsWith("```")) {
                        cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                    }
                    cleanJson = cleanJson.trim();

                    ObjectMapper mapper = new ObjectMapper();
                    List<AiSuggestionDTO> suggestions = mapper.readValue(cleanJson, new TypeReference<List<AiSuggestionDTO>>() {});
                    if (suggestions != null && !suggestions.isEmpty()) {
                        for (int i = 0; i < suggestions.size(); i++) {
                            AiSuggestionDTO s = suggestions.get(i);
                            s.setId("ai-sugg-" + (i + 1));
                            if (s.getStatus() == null || s.getStatus().isBlank()) {
                                s.setStatus("Action Required");
                            }
                        }
                        return suggestions;
                    }
                }
            } catch (Exception ex) {
                // Fall back cleanly to curated non-hallucinated template guidance
            }
        }

        return buildSafeFallbackSuggestions(category, reason, companyName);
    }

    private List<AiSuggestionDTO> buildSafeFallbackSuggestions(String category, String reason, String companyName) {
        List<AiSuggestionDTO> list = new ArrayList<>();
        String cat = (category != null) ? category.trim() : "Other";
        String org = (companyName != null && !companyName.isBlank()) ? companyName : "your organization";

        if (cat.toLowerCase().contains("business registration")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Business registration details could not be verified",
                    "Platform integrity requires all hiring employers to operate as legally registered corporate entities.",
                    "Review the registered legal company name and registration/incorporation number. Ensure they match official government documentation exactly.",
                    "Certificate of Incorporation, Business License, or Tax Registration Certificate.",
                    "Update the Legal Company Name in your Company Profile to match your registration document precisely.",
                    true,
                    "Action Required"
            ));
            list.add(new AiSuggestionDTO(
                    "sugg-2",
                    "Registered operating address discrepancy",
                    "Official headquarters address must match commercial jurisdiction records.",
                    "Ensure registered company address, state, and country correspond with corporate headquarters records.",
                    "Commercial lease, utility statement, or registered office filings.",
                    "Update the Registered Location field in the company profile.",
                    true,
                    "Action Required"
            ));
        } else if (cat.toLowerCase().contains("website")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Company website could not be verified or is unreachable",
                    "An active, publicly accessible corporate website confirms operational presence and business legitimacy.",
                    "Provide a fully functional, public HTTPS corporate website presenting " + org + "'s operational products or services.",
                    "Public HTTPS website URL and domain contact information.",
                    "Enter the full HTTPS URL (e.g., https://yourcompany.com) in the Company Website field.",
                    true,
                    "Action Required"
            ));
            list.add(new AiSuggestionDTO(
                    "sugg-2",
                    "Brand identity alignment",
                    "Candidate trust requires website branding to directly match registered employer name.",
                    "Verify that the website contains official employer branding and an active about or careers presence.",
                    "Official web domain matching registered company name.",
                    "Align Company Description and tagline with information published on your website.",
                    true,
                    "Action Required"
            ));
        } else if (cat.toLowerCase().contains("corporate email") || cat.toLowerCase().contains("domain")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Corporate email domain could not be authenticated",
                    "Recruiters must communicate from an authorized corporate domain to protect candidates from impersonation.",
                    "Ensure your registered recruiter account or contact email uses an authenticated company domain rather than a free webmail service.",
                    "Business email address with domain corresponding to your official website.",
                    "Update Contact Email in your company profile to use your organization's domain name.",
                    true,
                    "Action Required"
            ));
        } else if (cat.toLowerCase().contains("incomplete")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Company profile fields are incomplete",
                    "Comprehensive company profiles are required before job requisition publishing authorization is granted.",
                    "Complete all primary profile fields including Industry, Company Size, Description, and Contact Information.",
                    "Detailed company overview, employee headcount range, and founded year.",
                    "Fill in all missing fields in the Verification & Improvement Centre company profile form.",
                    true,
                    "Action Required"
            ));
        } else if (cat.toLowerCase().contains("documents are missing") || cat.toLowerCase().contains("identity")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Employer authorization documents required",
                    "Verification requires confirmation that the recruiter is officially authorized to represent " + org + ".",
                    "Provide corporate credentials, authorized recruiter letter, or official organizational registration.",
                    "Corporate authorization letter on company letterhead or representative credentials.",
                    "Upload or reference authorized corporate documentation and provide official recruiter contact phone.",
                    true,
                    "Action Required"
            ));
        } else if (cat.toLowerCase().contains("unreadable") || cat.toLowerCase().contains("inconsistent")) {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Submitted verification details or documents are unreadable or inconsistent",
                    "Admin review requires clear, legible documentation with consistent company information.",
                    "Re-submit your credentials ensuring that company name, registration details, and contact information are fully legible and consistent.",
                    "Clear, uncropped PDF or high-resolution image of supporting documents.",
                    "Review and correct discrepancies between company profile name and uploaded document headers.",
                    true,
                    "Action Required"
            ));
        } else {
            list.add(new AiSuggestionDTO(
                    "sugg-1",
                    "Verification requirements not yet fulfilled",
                    "Platform compliance standards require addressing the administrator's specific observations.",
                    "Carefully address the administrator's stated reason: \"" + (reason != null && !reason.isBlank() ? reason : "Please update company profile with verified details.") + "\"",
                    "Relevant corporate credentials or updated profile data as requested.",
                    "Update your company profile in the Verification & Improvement Centre and resubmit for administrator evaluation.",
                    true,
                    "Action Required"
            ));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<VerificationHistoryDTO> getVerificationHistory(UUID recruiterId) {
        if (verificationHistoryRepository == null) return Collections.emptyList();
        return verificationHistoryRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId)
                .stream()
                .map(VerificationHistoryDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecruiterVerificationDTO reactivateRecruiter(UUID recruiterId, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();

        recruiter.setVerificationStatus(VerificationStatus.VERIFIED);
        recruiter.setStatus(UserStatus.ACTIVE);
        recruiter.setRejectionReason(null);
        recruiter.setVerifiedAt(Instant.now());
        recruiter.setVerifiedBy(resolvedAdminName);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(true);
            companyRepository.save(company);
        }

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Recruiter Reactivated", savedRecruiter.getFullName(), null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public void deleteRejectedRecruiter(UUID recruiterId, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        if (recruiter.getVerificationStatus() != VerificationStatus.REJECTED) {
            throw new BadRequestException("Only applications in REJECTED status can be permanently deleted. Current status: " + recruiter.getVerificationStatus());
        }

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();

        // Mark application as ARCHIVED (permanently removed from verification queue)
        recruiter.setVerificationStatus(VerificationStatus.ARCHIVED);
        recruiter.setRejectionReason("Application permanently deleted by administrator on " + Instant.now());
        userRepository.save(recruiter);

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Rejected Application Permanently Deleted", recruiter.getFullName() + " (" + recruiter.getEmail() + ")", null);
        }
    }

    @Transactional
    public RecruiterVerificationDTO suspendRecruiter(UUID recruiterId, String reason, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();

        recruiter.setVerificationStatus(VerificationStatus.SUSPENDED);
        recruiter.setStatus(UserStatus.SUSPENDED);
        recruiter.setRejectionReason(reason != null && !reason.isBlank() ? reason : "Account suspended for administrative policy review.");
        recruiter.setVerifiedAt(Instant.now());
        recruiter.setVerifiedBy(resolvedAdminName);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(false);
            companyRepository.save(company);
        }

        // Deactivate all active job requisitions owned by this suspended recruiter
        jobRepository.findByRecruiterId(recruiterId).forEach(j -> {
            j.setStatus(JobStatus.CLOSED);
            jobRepository.save(j);
        });

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Recruiter Suspended", savedRecruiter.getFullName(), null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public UserDTO updateUserStatus(UUID userId, String statusStr) {
        return updateUserStatus(userId, statusStr, getCanonicalAdminId(), getCanonicalAdminName(), null);
    }

    @Transactional
    public UserDTO updateUserStatus(UUID userId, String statusStr, UUID adminId, String adminIdentifier, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        try {
            UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());
            if (user.getRole() == Role.ADMIN && status == UserStatus.SUSPENDED) {
                throw new BadRequestException("The primary administrator account cannot be suspended.");
            }
            user.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }
        User saved = userRepository.save(user);

        if (activityLogService != null) {
            UUID actorId = adminId != null ? adminId : getCanonicalAdminId();
            String actorName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
            activityLogService.logActivity(actorId, actorName, Role.ADMIN,
                    "User Status Updated", saved.getFullName() + " -> " + saved.getStatus().name(), ipAddress);
        }

        return toUserDTO(saved);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        deleteUser(userId, null, "Administrator", null);
    }

    @Transactional
    public void deleteUser(UUID userId, com.aiats.security.UserPrincipal adminPrincipal, String adminIdentifier, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found: " + userId));

        // Protection 1: Self-deletion check
        if (adminPrincipal != null) {
            if (user.getId().equals(adminPrincipal.getId())
                    || (adminPrincipal.getUsername() != null && adminPrincipal.getUsername().equalsIgnoreCase(user.getEmail()))) {
                throw new BadRequestException("Administrators cannot delete their own account.");
            }
        }

        // Protection 2: Final active administrator check
        if (user.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.countByRole(Role.ADMIN);
            if (activeAdminCount <= 1 || "admin@ai-ats.internal".equalsIgnoreCase(user.getEmail())) {
                throw new BadRequestException("The final active administrator account cannot be deleted.");
            }
        }

        String userFullName = user.getFullName();
        String userEmail = user.getEmail();
        Role userRole = user.getRole();

        // 1. In-app notifications
        if (notificationRepository != null) {
            List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!notifs.isEmpty()) {
                notificationRepository.deleteAll(notifs);
            }
        }

        // 2. Password reset tokens
        if (passwordResetTokenRepository != null) {
            try {
                passwordResetTokenRepository.deleteByUser(user);
            } catch (Exception ignored) {
                List<PasswordResetToken> tokens = passwordResetTokenRepository.findAllByUserAndUsedFalse(user);
                if (!tokens.isEmpty()) {
                    passwordResetTokenRepository.deleteAll(tokens);
                }
            }
        }

        // 3. Saved Jobs (Candidate bookmarks)
        if (savedJobRepository != null) {
            savedJobRepository.deleteByCandidateId(userId);
        }

        // 4. Candidate Applications & Resumes
        if (applicationRepository != null) {
            List<Application> candidateApps = applicationRepository.findByCandidateIdOrderByAppliedDateDesc(userId);
            if (!candidateApps.isEmpty()) {
                applicationRepository.deleteAll(candidateApps);
            }
        }

        if (resumeRepository != null) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            for (Resume r : userResumes) {
                if (resumeAnalysisRepository != null) {
                    resumeAnalysisRepository.findByResumeId(r.getId()).ifPresent(resumeAnalysisRepository::delete);
                }
            }
            if (!userResumes.isEmpty()) {
                resumeRepository.deleteAll(userResumes);
            }
        }

        // 5. Candidate Profile (cascades educations, experiences, projects, skills, certifications)
        if (candidateProfileRepository != null) {
            candidateProfileRepository.findByUserId(userId).ifPresent(candidateProfileRepository::delete);
        }

        // 6. Recruiter Jobs, Applications to those jobs, Saved Jobs on those jobs, and Company
        if (jobRepository != null) {
            List<Job> recruiterJobs = jobRepository.findByRecruiterId(userId);
            for (Job j : recruiterJobs) {
                if (savedJobRepository != null) {
                    savedJobRepository.deleteByJobId(j.getId());
                }
                if (applicationRepository != null) {
                    List<Application> jobApps = applicationRepository.findByJobIdOrderByAppliedDateDesc(j.getId());
                    if (!jobApps.isEmpty()) {
                        applicationRepository.deleteAll(jobApps);
                    }
                }
                jobRepository.delete(j);
            }
        }

        if (companyRepository != null) {
            companyRepository.findByRecruiter(user)
                    .or(() -> companyRepository.findByRecruiterId(userId))
                    .ifPresent(companyRepository::delete);
        }

        // 7. Delete the User entity
        userRepository.delete(user);

        // 8. Log the Audit Event
        if (activityLogService != null) {
            activityLogService.logDetailedActivity(
                    adminPrincipal != null ? adminPrincipal.getId() : null,
                    adminIdentifier != null ? adminIdentifier : "Administrator",
                    Role.ADMIN,
                    "Permanent Account Deletion",
                    "PERMANENT_ACCOUNT_DELETION",
                    "ACCOUNT_GOVERNANCE",
                    "HIGH",
                    "SUCCESS",
                    "Permanently deleted " + userRole + " account: " + userFullName + " (" + userEmail + ")",
                    userRole.name(),
                    userId.toString(),
                    user.getStatus() != null ? user.getStatus().name() : "ACTIVE",
                    "PERMANENTLY_DELETED",
                    "Administrator executed permanent account deletion from PostgreSQL",
                    ipAddress,
                    null
            );
        }
    }

    @Transactional(readOnly = true)
    public List<SystemActivityLogDTO> getActivityLogs() {
        return systemActivityLogRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .map(SystemActivityLogDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuditPageResult<SystemActivityLogDTO> getPageAuditEvents(
            String search, String category, String severity, String result, String actorRole,
            Instant startDate, Instant endDate, int page, int size, String sortBy, String sortDir) {

        int validPage = Math.max(0, page);
        int validSize = (size <= 0 || size > 100) ? 20 : size;

        String validSortBy = "timestamp";
        if ("actorName".equalsIgnoreCase(sortBy) || "severity".equalsIgnoreCase(sortBy) ||
            "result".equalsIgnoreCase(sortBy) || "eventCategory".equalsIgnoreCase(sortBy) ||
            "action".equalsIgnoreCase(sortBy)) {
            validSortBy = sortBy;
        }

        Sort sort = "asc".equalsIgnoreCase(sortDir) ?
                Sort.by(validSortBy).ascending() :
                Sort.by(validSortBy).descending();

        Pageable pageable = PageRequest.of(validPage, validSize, sort);

        Specification<SystemActivityLog> spec = buildAuditSpecification(
                search, category, severity, result, actorRole, startDate, endDate);

        Page<SystemActivityLog> paged = systemActivityLogRepository.findAll(spec, pageable);
        List<SystemActivityLogDTO> dtoList = paged.getContent().stream()
                .map(SystemActivityLogDTO::new)
                .collect(Collectors.toList());

        return new AuditPageResult<>(
                dtoList,
                paged.getNumber(),
                paged.getSize(),
                paged.getTotalElements(),
                paged.getTotalPages(),
                paged.isFirst(),
                paged.isLast()
        );
    }

    private Specification<SystemActivityLog> buildAuditSpecification(
            String search, String category, String severity, String result, String actorRole,
            Instant startDate, Instant endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("action")), searchPattern),
                        cb.like(cb.lower(root.get("target")), searchPattern),
                        cb.like(cb.lower(root.get("actorName")), searchPattern),
                        cb.like(cb.lower(root.get("eventType")), searchPattern),
                        cb.like(cb.lower(root.get("eventCategory")), searchPattern),
                        cb.like(cb.lower(root.get("targetId")), searchPattern),
                        cb.like(cb.lower(root.get("reason")), searchPattern),
                        cb.like(cb.lower(root.get("ipAddress")), searchPattern)
                );
                predicates.add(searchPred);
            }

            if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(cb.upper(root.get("eventCategory")), category.trim().toUpperCase()));
            }

            if (severity != null && !severity.trim().isEmpty() && !"ALL".equalsIgnoreCase(severity)) {
                predicates.add(cb.equal(cb.upper(root.get("severity")), severity.trim().toUpperCase()));
            }

            if (result != null && !result.trim().isEmpty() && !"ALL".equalsIgnoreCase(result)) {
                predicates.add(cb.equal(cb.upper(root.get("result")), result.trim().toUpperCase()));
            }

            if (actorRole != null && !actorRole.trim().isEmpty() && !"ALL".equalsIgnoreCase(actorRole)) {
                try {
                    Role roleEnum = Role.fromString(actorRole.trim());
                    predicates.add(cb.equal(root.get("actorRole"), roleEnum));
                } catch (Exception ignored) {}
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Transactional(readOnly = true)
    public SystemActivityLogDTO getAuditEventById(UUID eventId) {
        SystemActivityLog log = systemActivityLogRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit event not found with ID: " + eventId));
        return new SystemActivityLogDTO(log);
    }

    @Transactional(readOnly = true)
    public AuditSummaryDTO getAuditSummary(Instant startDate, Instant endDate) {
        return getAuditSummary(null, null, null, null, null, startDate, endDate, null);
    }

    @Transactional(readOnly = true)
    public AuditSummaryDTO getAuditSummary(
            String search, String category, String severity, String result, String actorRole,
            Instant startDate, Instant endDate, String clientTimezone) {

        ZoneId zoneId;
        try {
            if (clientTimezone != null && !clientTimezone.isBlank()) {
                zoneId = ZoneId.of(clientTimezone);
            } else {
                zoneId = ZoneId.of("Asia/Kolkata");
            }
        } catch (Exception e) {
            zoneId = ZoneId.systemDefault();
        }

        Specification<SystemActivityLog> spec = buildAuditSpecification(
                search, category, severity, result, actorRole, startDate, endDate);

        List<SystemActivityLog> logs = systemActivityLogRepository.findAll(spec);

        long total = logs.size();
        long adminActions = 0;
        long secEvents = 0;
        long failedOps = 0;
        long accountGov = 0;
        long todayCount = 0;
        long yesterdayCount = 0;

        LocalDate today = LocalDate.now(zoneId);
        LocalDate yesterday = today.minusDays(1);
        Map<String, Long> dailyCounts = new LinkedHashMap<>();

        for (SystemActivityLog log : logs) {
            log.inferMetadata();
            if (log.getActorRole() == Role.ADMIN) {
                adminActions++;
            }
            if ("AUTHENTICATION_SECURITY".equalsIgnoreCase(log.getEventCategory()) ||
                "HIGH".equalsIgnoreCase(log.getSeverity()) ||
                "BLOCKED".equalsIgnoreCase(log.getResult())) {
                secEvents++;
            }
            if ("FAILURE".equalsIgnoreCase(log.getResult()) || "BLOCKED".equalsIgnoreCase(log.getResult())) {
                failedOps++;
            }
            if ("ACCOUNT_GOVERNANCE".equalsIgnoreCase(log.getEventCategory())) {
                accountGov++;
            }

            if (log.getTimestamp() != null) {
                LocalDate logDate = log.getTimestamp().atZone(zoneId).toLocalDate();
                String dateKey = logDate.toString();
                dailyCounts.put(dateKey, dailyCounts.getOrDefault(dateKey, 0L) + 1L);

                if (logDate.equals(today)) {
                    todayCount++;
                } else if (logDate.equals(yesterday)) {
                    yesterdayCount++;
                }
            }
        }

        String lastSync = systemActivityLogRepository.findTop1ByOrderByTimestampDesc()
                .map(l -> l.getTimestamp().toString())
                .orElse(Instant.now().toString());

        return new AuditSummaryDTO(
                total, adminActions, secEvents, failedOps, accountGov, lastSync, true,
                todayCount, yesterdayCount, dailyCounts, zoneId.getId());
    }

    @Transactional(readOnly = true)
    public List<SystemActivityLogDTO> getRelatedAuditEvents(UUID eventId) {
        SystemActivityLog targetLog = systemActivityLogRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit event not found with ID: " + eventId));

        Set<SystemActivityLog> related = new LinkedHashSet<>();
        if (targetLog.getTargetId() != null && !targetLog.getTargetId().isBlank()) {
            related.addAll(systemActivityLogRepository.findTop20ByTargetIdOrderByTimestampDesc(targetLog.getTargetId()));
        }
        if (targetLog.getActorId() != null) {
            related.addAll(systemActivityLogRepository.findTop20ByActorIdOrderByTimestampDesc(targetLog.getActorId()));
        }
        if (targetLog.getCorrelationId() != null && !targetLog.getCorrelationId().isBlank()) {
            related.addAll(systemActivityLogRepository.findTop20ByCorrelationIdOrderByTimestampDesc(targetLog.getCorrelationId()));
        }

        return related.stream()
                .filter(l -> !l.getId().equals(eventId))
                .limit(10)
                .map(SystemActivityLogDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public String exportAuditEventsCsv(
            String search, String category, String severity, String result, String actorRole,
            Instant startDate, Instant endDate, UUID adminId, String adminName, String clientIp) {

        AuditPageResult<SystemActivityLogDTO> pageResult = getPageAuditEvents(
                search, category, severity, result, actorRole, startDate, endDate, 0, 5000, "timestamp", "desc");

        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF"); // UTF-8 BOM
        csv.append("Event ID,Timestamp,Severity,Result,Category,Event Type,Actor Name,Actor Role,Action,Target Type,Target ID,Target,Reason,Source IP\n");

        for (SystemActivityLogDTO log : pageResult.getContent()) {
            csv.append(escapeCsv(log.getId())).append(",")
               .append(escapeCsv(log.getTimestamp())).append(",")
               .append(escapeCsv(log.getSeverity())).append(",")
               .append(escapeCsv(log.getResult())).append(",")
               .append(escapeCsv(log.getEventCategory())).append(",")
               .append(escapeCsv(log.getEventType())).append(",")
               .append(escapeCsv(log.getActorName())).append(",")
               .append(escapeCsv(log.getActorRole())).append(",")
               .append(escapeCsv(log.getAction())).append(",")
               .append(escapeCsv(log.getTargetType())).append(",")
               .append(escapeCsv(log.getTargetId())).append(",")
               .append(escapeCsv(log.getTarget())).append(",")
               .append(escapeCsv(log.getReason())).append(",")
               .append(escapeCsv(log.getIpAddress())).append("\n");
        }

        if (activityLogService != null) {
            activityLogService.logDetailedActivity(
                    adminId, adminName, Role.ADMIN,
                    "Audit Report Exported", "AUDIT_REPORT_EXPORTED", "AUTHENTICATION_SECURITY",
                    "NOTICE", "SUCCESS",
                    "CSV Export (" + pageResult.getContent().size() + " records)", "SYSTEM", null,
                    null, null, "Exported filtered platform audit logs to CSV", clientIp, null
            );
        }

        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "\"\"";
        }
        String clean = value.replace("\"", "\"\"");
        if (clean.startsWith("=") || clean.startsWith("+") || clean.startsWith("-") || clean.startsWith("@")) {
            clean = "'" + clean;
        }
        return "\"" + clean + "\"";
    }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId().toString());
        dto.setName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().name().toLowerCase());
        dto.setAvatar(u.getAvatarUrl());
        dto.setStatus(u.getStatus().name().toLowerCase());
        dto.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        dto.setPhone(u.getPhone());
        dto.setCompanyName(u.getCompanyName());
        dto.setTitle(u.getTitle());
        if (u.getVerificationStatus() != null) {
            dto.setVerificationStatus(u.getVerificationStatus().toFrontendStatus());
        }
        if (u.getVerifiedAt() != null) {
            dto.setVerifiedAt(u.getVerifiedAt().toString());
        }
        dto.setVerifiedBy(u.getVerifiedBy());
        dto.setRejectionReason(u.getRejectionReason());
        return dto;
    }

    @Transactional
    public RecruiterVerificationDTO requestAdditionalEvidence(UUID recruiterId, VerificationDecisionRequest request, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim() : "Additional supporting documentation is required to complete verification.";
        String correctiveActions = (request != null && request.getCorrectiveActions() != null)
                ? request.getCorrectiveActions().trim() : null;
        String category = (request != null && request.getCategory() != null)
                ? request.getCategory().trim() : "Additional evidence required";

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();
        VerificationStatus prevStatus = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.PENDING;

        recruiter.setVerificationStatus(VerificationStatus.ADDITIONAL_EVIDENCE_REQUIRED);
        recruiter.setRejectionCategory(category);
        recruiter.setRejectionReason(reason);
        recruiter.setCorrectiveActions(correctiveActions);
        recruiter.setResubmissionAllowed(true);
        recruiter.setVerifiedBy(resolvedAdminName);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(false);
            companyRepository.save(company);
        }

        if (verificationHistoryRepository != null) {
            VerificationHistory history = new VerificationHistory(
                    savedRecruiter, prevStatus, VerificationStatus.ADDITIONAL_EVIDENCE_REQUIRED,
                    resolvedAdminId, resolvedAdminName, category, reason,
                    correctiveActions, request != null ? request.getAiSuggestions() : null, true, null
            );
            verificationHistoryRepository.save(history);
        }

        if (notificationRepository != null) {
            String notifTitle = "Additional Verification Evidence Requested";
            String notifMessage = "Hello " + savedRecruiter.getFullName() + ",\n\n"
                    + "Our compliance team has reviewed your verification submission and requires additional supporting documentation:\n\n"
                    + "Category: " + category + "\n"
                    + "Details: " + reason + "\n"
                    + (correctiveActions != null ? "Guidance: " + correctiveActions + "\n" : "")
                    + "\nPlease visit the Recruiter Verification Center to provide the requested items.\n\n"
                    + "Thank you,\nNextGen ATS Platform";
            Notification notif = new Notification(savedRecruiter, notifTitle, notifMessage, "warning", "/recruiter/verification");
            notificationRepository.save(notif);
        }

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Additional Evidence Requested", savedRecruiter.getFullName() + " (" + category + ")", null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public RecruiterVerificationDTO reopenVerification(UUID recruiterId, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        if (recruiter.getRole() != Role.RECRUITER) {
            throw new BadRequestException("User is not a recruiter: " + recruiterId);
        }

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();
        VerificationStatus prevStatus = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.PENDING;

        recruiter.setVerificationStatus(VerificationStatus.IN_REVIEW);
        recruiter.setStatus(UserStatus.ACTIVE);
        recruiter.setVerifiedBy(resolvedAdminName);
        User savedRecruiter = userRepository.save(recruiter);

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElse(null);

        if (company != null) {
            company.setVerified(false);
            companyRepository.save(company);
        }

        if (verificationHistoryRepository != null) {
            VerificationHistory history = new VerificationHistory(
                    savedRecruiter, prevStatus, VerificationStatus.IN_REVIEW,
                    resolvedAdminId, resolvedAdminName, "Administrative Reopening",
                    "Verification record reopened for compliance investigation by " + resolvedAdminName,
                    null, null, true, null
            );
            verificationHistoryRepository.save(history);
        }

        if (notificationRepository != null) {
            Notification notif = new Notification(
                    savedRecruiter,
                    "Recruiter Verification Reopened for Review",
                    "Your recruiter verification has been reopened for administrative review by platform compliance.",
                    "info",
                    "/recruiter/verification"
            );
            notificationRepository.save(notif);
        }

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Recruiter Verification Reopened", savedRecruiter.getFullName(), null);
        }

        return toVerificationDTO(savedRecruiter, company);
    }

    @Transactional
    public RecruiterVerificationDTO updateCompanyChecks(UUID recruiterId, Map<String, Object> checks, String adminIdentifier) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found: " + recruiterId));

        Company company = companyRepository.findByRecruiter(recruiter)
                .or(() -> companyRepository.findByRecruiterId(recruiter.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for recruiter: " + recruiterId));

        String resolvedAdminName = (adminIdentifier != null && !adminIdentifier.isBlank()) ? adminIdentifier : getCanonicalAdminName();
        UUID resolvedAdminId = getCanonicalAdminId();

        if (checks.containsKey("registrationCheckStatus") && checks.get("registrationCheckStatus") != null) {
            company.setRegistrationCheckStatus((String) checks.get("registrationCheckStatus"));
        }
        if (checks.containsKey("websiteConsistencyStatus") && checks.get("websiteConsistencyStatus") != null) {
            company.setWebsiteConsistencyStatus((String) checks.get("websiteConsistencyStatus"));
        }
        if (checks.containsKey("associationVerified") && checks.get("associationVerified") != null) {
            company.setAssociationVerified(Boolean.valueOf(String.valueOf(checks.get("associationVerified"))));
        }
        if (checks.containsKey("associationCheckStatus") && checks.get("associationCheckStatus") != null) {
            company.setAssociationCheckStatus((String) checks.get("associationCheckStatus"));
        }
        if (checks.containsKey("independentConfirmationNotes") && checks.get("independentConfirmationNotes") != null) {
            company.setIndependentConfirmationNotes((String) checks.get("independentConfirmationNotes"));
        }
        if (checks.containsKey("reverificationRequired") && checks.get("reverificationRequired") != null) {
            company.setReverificationRequired(Boolean.valueOf(String.valueOf(checks.get("reverificationRequired"))));
        }
        if (checks.containsKey("phoneVerified") && checks.get("phoneVerified") != null) {
            recruiter.setPhoneVerified(Boolean.valueOf(String.valueOf(checks.get("phoneVerified"))));
            userRepository.save(recruiter);
        }

        companyRepository.save(company);

        if (activityLogService != null) {
            activityLogService.logActivity(resolvedAdminId, resolvedAdminName, Role.ADMIN,
                    "Company Verification Checks Updated", "Updated checks for " + company.getName(), null);
        }

        return toVerificationDTO(recruiter, company);
    }

    private RecruiterVerificationDTO toVerificationDTO(User r, Company company) {
        RecruiterVerificationDTO dto = new RecruiterVerificationDTO();
        dto.setRecruiterId(r.getId().toString());
        dto.setRecruiterName(r.getFullName());
        dto.setRecruiterEmail(r.getEmail());
        dto.setRecruiterPhone(r.getPhone());
        dto.setPhoneVerified(r.getPhoneVerified());
        dto.setEmailVerified(r.getEmailVerified());
        dto.setAccountStatus(r.getStatus() != null ? r.getStatus().name().toLowerCase() : "active");
        dto.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);

        VerificationStatus vStatus = r.getVerificationStatus() != null ? r.getVerificationStatus() : VerificationStatus.PENDING;
        dto.setVerificationStatus(vStatus.toFrontendStatus());
        dto.setVerified(vStatus == VerificationStatus.VERIFIED);
        dto.setVerifiedAt(r.getVerifiedAt() != null ? r.getVerifiedAt().toString() : null);
        dto.setVerifiedBy(r.getVerifiedBy());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setRejectionCategory(r.getRejectionCategory());
        dto.setCorrectiveActions(r.getCorrectiveActions());
        dto.setAiSuggestions(r.getAiSuggestions());
        dto.setResubmissionAllowed(r.getResubmissionAllowed());
        dto.setResubmissionNotes(r.getResubmissionNotes());
        dto.setResubmittedAt(r.getResubmittedAt() != null ? r.getResubmittedAt().toString() : null);

        if (company != null) {
            dto.setCompanyId(company.getId().toString());
            dto.setCompanyName(company.getName());
            dto.setCompanyLogo(company.getLogo());
            dto.setCompanyTagline(company.getTagline());
            dto.setIndustry(company.getIndustry());
            dto.setWebsite(company.getWebsite());
            dto.setLocation(company.getLocation());
            dto.setSize(company.getSize());
            dto.setDescription(company.getDescription());
            dto.setFoundedYear(company.getFoundedYear());
            dto.setBusinessRegistrationNumber(company.getBusinessRegistrationNumber());
            dto.setTaxId(company.getTaxId());
            dto.setOfficialEmailDomain(company.getOfficialEmailDomain());
            dto.setVerificationDocumentUrl(company.getVerificationDocumentUrl());
            dto.setVerificationEvidenceNotes(company.getVerificationEvidenceNotes());
            dto.setRegistrationCheckStatus(company.getRegistrationCheckStatus());
            dto.setWebsiteConsistencyStatus(company.getWebsiteConsistencyStatus());
            dto.setAssociationVerified(company.getAssociationVerified());
            dto.setAssociationCheckStatus(company.getAssociationCheckStatus());
            dto.setAuthorizationDocumentUrl(company.getAuthorizationDocumentUrl());
            dto.setAuthorizationNotes(company.getAuthorizationNotes());
            dto.setIndependentConfirmationNotes(company.getIndependentConfirmationNotes());
            dto.setReverificationRequired(company.getReverificationRequired());
            if (company.getBenefits() != null && !company.getBenefits().isBlank()) {
                dto.setBenefits(Arrays.asList(company.getBenefits().split("\\s*,\\s*")));
            }
        } else {
            dto.setCompanyName(r.getCompanyName() != null ? r.getCompanyName() : "Unassigned Organization");
            dto.setRegistrationCheckStatus("PENDING");
            dto.setWebsiteConsistencyStatus("PENDING");
            dto.setAssociationCheckStatus("PENDING");
            dto.setAssociationVerified(false);
        }

        // Section C: Identity Verification details
        boolean emailOk = Boolean.TRUE.equals(r.getEmailVerified());
        boolean phoneOk = Boolean.TRUE.equals(r.getPhoneVerified());
        dto.setEmailVerificationResult(emailOk ? "Email identity verified" : "Pending email verification");
        dto.setPhoneVerificationResult(phoneOk ? "Phone authenticated" : (r.getPhone() != null && !r.getPhone().isBlank() ? "Phone recorded (awaiting two-factor verification)" : "Phone number not supplied"));
        dto.setProfessionalIdentityReview(r.getTitle() != null && !r.getTitle().isBlank() ? "Declared Role: " + r.getTitle() : "Professional recruitment title pending review");

        List<String> outstandingIdentity = new ArrayList<>();
        if (!emailOk) outstandingIdentity.add("Email address domain authentication pending");
        if (!phoneOk) outstandingIdentity.add("Recruiter direct phone verification pending");
        dto.setOutstandingIdentityChecks(outstandingIdentity);

        // Section D: Company Authenticity Review
        dto.setCompanyAuthenticityReview((company != null && company.isVerified()) ? "Company credentials verified by administrator" : "Awaiting independent evidence review");
        List<String> discrepancies = new ArrayList<>();
        if (company != null && "DISCREPANCY".equalsIgnoreCase(company.getRegistrationCheckStatus())) {
            discrepancies.add("Registration details or legal entity name conflict with official records");
        }
        if (company != null && "INCONSISTENT".equalsIgnoreCase(company.getWebsiteConsistencyStatus())) {
            discrepancies.add("Website domain or public company profile does not match business branding");
        }
        dto.setUnresolvedDiscrepancies(discrepancies);

        // Section 6: Verification Readiness Score & Status
        int checksPassed = 0;
        int totalChecks = 5;
        if (emailOk) checksPassed++;
        if (r.getPhone() != null && !r.getPhone().isBlank()) checksPassed++;
        if (company != null && company.getName() != null && !company.getName().isBlank()) checksPassed++;
        if (company != null && company.getWebsite() != null && !company.getWebsite().isBlank()) checksPassed++;
        if (company != null && Boolean.TRUE.equals(company.getAssociationVerified())) checksPassed++;

        int readinessScore = Math.round(((float) checksPassed / totalChecks) * 100);
        dto.setVerificationReadinessScore(readinessScore);

        String readinessStatus;
        if (vStatus == VerificationStatus.VERIFIED) {
            readinessStatus = "Verification Complete";
        } else if (checksPassed == totalChecks) {
            readinessStatus = "Ready for Review";
        } else if (vStatus == VerificationStatus.ADDITIONAL_EVIDENCE_REQUIRED) {
            readinessStatus = "Additional Review Required";
        } else {
            readinessStatus = "Mandatory Check Incomplete";
        }
        dto.setVerificationReadinessStatus(readinessStatus);

        // Section 5: AI-Assisted Explainable Risk Assessment
        List<AiRiskFlagDTO> flags = new ArrayList<>();

        // 1. Email domain check
        String emailDomain = r.getEmail().substring(r.getEmail().indexOf('@') + 1).toLowerCase();
        boolean isFreeEmail = emailDomain.contains("gmail.com") || emailDomain.contains("yahoo.com")
                || emailDomain.contains("hotmail.com") || emailDomain.contains("outlook.com");
        if (isFreeEmail && company != null && company.getWebsite() != null && !company.getWebsite().isBlank()) {
            flags.add(new AiRiskFlagDTO(
                    "flag-domain",
                    "Email Domain & Company Association",
                    "Recruiter registered using public webmail provider (" + emailDomain + ") rather than corporate domain",
                    "Registered Email: " + r.getEmail() + " | Organization Website: " + company.getWebsite(),
                    "LOW",
                    "Verify corporate authorization letter or confirm representative affiliation with organization.",
                    "AI_FLAGGED"
            ));
        }

        // 2. Association check
        if (company == null || !Boolean.TRUE.equals(company.getAssociationVerified())) {
            String evidenceText = (company != null && company.getAuthorizationDocumentUrl() != null)
                    ? "Authorization document submitted: " + company.getAuthorizationDocumentUrl()
                    : "No corporate authorization letter on file";
            flags.add(new AiRiskFlagDTO(
                    "flag-assoc",
                    "Recruiter-Company Association",
                    "Authorized representative status has not yet been validated by administrator",
                    evidenceText,
                    "MEDIUM",
                    "Review submitted authorization letter or contact corporate headquarters to confirm representative status.",
                    "AI_FLAGGED"
            ));
        }

        // 3. Business registration
        if (company != null && (company.getBusinessRegistrationNumber() == null || company.getBusinessRegistrationNumber().isBlank())) {
            flags.add(new AiRiskFlagDTO(
                    "flag-reg",
                    "Business Registration",
                    "Business registration or corporate tax identification number not recorded",
                    "Incorporation / EIN / CIN field is blank",
                    "LOW",
                    "Request business registration certificate or tax identification number if operating in regulated market.",
                    "AI_FLAGGED"
            ));
        }

        // 4. Past moderation violations
        long rejJobs = jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.REJECTED);
        if (rejJobs > 0) {
            flags.add(new AiRiskFlagDTO(
                    "flag-mod",
                    "Moderation Violations",
                    rejJobs + " previous job requisition(s) rejected for compliance violations",
                    "Historical records in PostgreSQL jobs table",
                    "MEDIUM",
                    "Inspect recruiter's active requisitions for recurring policy concerns.",
                    "AI_FLAGGED"
            ));
        }

        // 5. Candidate complaints
        if (candidateReportRepository != null) {
            long complaints = candidateReportRepository.countByRecruiterId(r.getId());
            if (complaints > 0) {
                flags.add(new AiRiskFlagDTO(
                        "flag-reports",
                        "Candidate Complaints",
                        complaints + " candidate safety report(s) submitted against recruiter's job requisitions",
                        "Active complaint records in PostgreSQL candidate_reports table",
                        "HIGH",
                        "Prioritize investigation of reported requisition content and verify employer authenticity.",
                        "AI_FLAGGED"
                ));
            }
        }

        // 6. Duplicate company profile check
        if (company != null && company.getName() != null && !company.getName().isBlank()) {
            long dupCompanies = companyRepository.countByNameIgnoreCaseAndIdNot(company.getName().trim(), company.getId());
            if (dupCompanies > 0) {
                flags.add(new AiRiskFlagDTO(
                        "flag-dup",
                        "Duplicate Company Profile",
                        dupCompanies + " other organization profile(s) exist with matching name '" + company.getName() + "'",
                        "Matching employer name records in PostgreSQL companies table",
                        "HIGH",
                        "Verify whether this is an authorized subsidiary or unauthorized impersonation account.",
                        "AI_FLAGGED"
                ));
            }
        }

        dto.setAiRiskFlags(flags);

        // Compute Explainable Risk Score
        int score = 10;
        if (flags.stream().anyMatch(f -> "HIGH".equals(f.getSeverity()))) score += 40;
        if (flags.stream().anyMatch(f -> "MEDIUM".equals(f.getSeverity()))) score += 20;
        if (flags.stream().anyMatch(f -> "LOW".equals(f.getSeverity()))) score += 10;
        score = Math.min(95, score);
        String rLevel = score >= 60 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
        dto.setRiskScore(score);
        dto.setRiskLevel(rLevel);

        if (verificationHistoryRepository != null) {
            List<VerificationHistoryDTO> history = verificationHistoryRepository.findByRecruiterIdOrderByCreatedAtDesc(r.getId())
                    .stream()
                    .map(VerificationHistoryDTO::new)
                    .collect(Collectors.toList());
            dto.setHistory(history);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public AuditCleanupPreviewDTO previewAuditCleanup(AuditCleanupPreviewRequest request) {
        ZoneId zoneId = resolveZoneId(request.getTimezone());
        String opType = request.getOperationType() != null ? request.getOperationType().toUpperCase() : "SPECIFIC_DATE";

        AuditCleanupPreviewDTO dto = new AuditCleanupPreviewDTO();
        dto.setOperationType(opType);
        dto.setTimezone(zoneId.getId());

        Instant start;
        Instant end;
        String scopeLabel;

        if ("SPECIFIC_DATE".equals(opType)) {
            if (request.getDate() == null || request.getDate().isBlank()) {
                throw new BadRequestException("Target calendar date is required for date cleanup.");
            }
            LocalDate localDate;
            try {
                localDate = LocalDate.parse(request.getDate().trim());
            } catch (Exception e) {
                throw new BadRequestException("Invalid date format. Expected YYYY-MM-DD.");
            }
            start = localDate.atStartOfDay(zoneId).toInstant();
            end = localDate.plusDays(1).atStartOfDay(zoneId).minusNanos(1).toInstant();
            scopeLabel = "Calendar Date: " + localDate + " (" + zoneId.getId() + ")";
        } else if ("DATE_RANGE".equals(opType)) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new BadRequestException("Both start date and end date are required for range cleanup.");
            }
            LocalDate localStart;
            LocalDate localEnd;
            try {
                localStart = LocalDate.parse(request.getStartDate().trim().substring(0, 10));
                localEnd = LocalDate.parse(request.getEndDate().trim().substring(0, 10));
            } catch (Exception e) {
                throw new BadRequestException("Invalid date range format. Expected YYYY-MM-DD.");
            }
            if (localStart.isAfter(localEnd)) {
                throw new BadRequestException("Start date cannot be after end date.");
            }
            start = localStart.atStartOfDay(zoneId).toInstant();
            end = localEnd.plusDays(1).atStartOfDay(zoneId).minusNanos(1).toInstant();
            scopeLabel = "Date Range: " + localStart + " to " + localEnd + " (" + zoneId.getId() + ")";
        } else if ("DELETE_ALL".equals(opType)) {
            if (request.isPreserveActiveToday()) {
                LocalDate today = LocalDate.now(zoneId);
                Instant todayStart = today.atStartOfDay(zoneId).toInstant();
                start = Instant.EPOCH;
                end = todayStart.minusNanos(1);
                scopeLabel = "All Historical Logs (Excluding Active Day " + today + ")";
            } else {
                start = Instant.EPOCH;
                end = Instant.now();
                scopeLabel = "All Historical Audit Logs (Complete System History)";
            }
        } else {
            throw new BadRequestException("Unsupported cleanup operation type: " + opType);
        }

        dto.setTargetScopeLabel(scopeLabel);

        long totalMatching = systemActivityLogRepository.countByTimestampBetween(start, end);
        long protectedCount = 0;
        if (request.isPreserveHighSeverity()) {
            protectedCount = systemActivityLogRepository.countProtectedHighSeverityBetween(start, end);
        }

        long eligible = Math.max(0, totalMatching - protectedCount);
        Instant minTs = systemActivityLogRepository.findMinTimestampBetween(start, end);
        Instant maxTs = systemActivityLogRepository.findMaxTimestampBetween(start, end);

        dto.setTotalMatching(totalMatching);
        dto.setEligibleForDeletion(eligible);
        dto.setProtectedRecords(protectedCount);
        dto.setProtectionReason(protectedCount > 0 ?
                protectedCount + " high-severity security & compliance records protected under retention policy." :
                "Standard cleanup: All matching records in scope are eligible for purge.");
        dto.setEarliestTimestamp(minTs != null ? minTs.toString() : null);
        dto.setLatestTimestamp(maxTs != null ? maxTs.toString() : null);

        long estimatedBytes = eligible * 550L;
        if (estimatedBytes < 1024 * 1024) {
            dto.setEstimatedReclaimedBytes(String.format("%.1f KB", estimatedBytes / 1024.0));
        } else {
            dto.setEstimatedReclaimedBytes(String.format("%.2f MB", estimatedBytes / (1024.0 * 1024.0)));
        }

        dto.setStorageNotice("PostgreSQL storage notice: Deleting rows creates reusable dead tuples in PostgreSQL tables and indexes. Space is immediately reused for new incoming activity logs. Full OS-level disk shrink occurs during background autovacuum.");

        return dto;
    }

    @Transactional
    public AuditCleanupReceiptDTO executeAuditCleanup(
            AuditCleanupExecutionRequest request, UUID adminId, String adminEmail, String adminName, String clientIp) {

        Instant startedAt = Instant.now();
        ZoneId zoneId = resolveZoneId(request.getTimezone());
        String opType = request.getOperationType() != null ? request.getOperationType().toUpperCase() : "SPECIFIC_DATE";

        if ("DELETE_ALL".equals(opType)) {
            if (!"DELETE ALL".equals(request.getConfirmationCode())) {
                throw new BadRequestException("Safety confirmation failure: You must type 'DELETE ALL' exactly to execute bulk deletion.");
            }
        }

        Instant start;
        Instant end;
        String scopeLabel;

        if ("SPECIFIC_DATE".equals(opType)) {
            if (request.getDate() == null || request.getDate().isBlank()) {
                throw new BadRequestException("Target calendar date is required.");
            }
            LocalDate localDate = LocalDate.parse(request.getDate().trim());
            start = localDate.atStartOfDay(zoneId).toInstant();
            end = localDate.plusDays(1).atStartOfDay(zoneId).minusNanos(1).toInstant();
            scopeLabel = "Calendar Date: " + localDate + " (" + zoneId.getId() + ")";
        } else if ("DATE_RANGE".equals(opType)) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new BadRequestException("Both start date and end date are required.");
            }
            LocalDate localStart = LocalDate.parse(request.getStartDate().trim().substring(0, 10));
            LocalDate localEnd = LocalDate.parse(request.getEndDate().trim().substring(0, 10));
            if (localStart.isAfter(localEnd)) {
                throw new BadRequestException("Start date cannot be after end date.");
            }
            start = localStart.atStartOfDay(zoneId).toInstant();
            end = localEnd.plusDays(1).atStartOfDay(zoneId).minusNanos(1).toInstant();
            scopeLabel = "Date Range: " + localStart + " to " + localEnd + " (" + zoneId.getId() + ")";
        } else if ("DELETE_ALL".equals(opType)) {
            if (request.isPreserveActiveToday()) {
                LocalDate today = LocalDate.now(zoneId);
                Instant todayStart = today.atStartOfDay(zoneId).toInstant();
                start = Instant.EPOCH;
                end = todayStart.minusNanos(1);
                scopeLabel = "All Historical Logs (Excluding Active Day " + today + ")";
            } else {
                start = Instant.EPOCH;
                end = Instant.now();
                scopeLabel = "All Historical Audit Logs";
            }
        } else {
            throw new BadRequestException("Unsupported cleanup operation type: " + opType);
        }

        long totalMatching = systemActivityLogRepository.countByTimestampBetween(start, end);
        long protectedCount = 0;
        if (request.isPreserveHighSeverity()) {
            protectedCount = systemActivityLogRepository.countProtectedHighSeverityBetween(start, end);
        }

        int deletedCount = 0;
        String status = "SUCCESS";
        String failureReason = null;

        try {
            if ("DELETE_ALL".equals(opType) && !request.isPreserveActiveToday()) {
                if (request.isPreserveHighSeverity()) {
                    deletedCount = systemActivityLogRepository.deleteAllExcludingHighSeverity();
                } else {
                    deletedCount = (int) systemActivityLogRepository.count();
                    systemActivityLogRepository.deleteAll();
                }
            } else {
                if (request.isPreserveHighSeverity()) {
                    deletedCount = systemActivityLogRepository.deleteByTimestampBetweenExcludingHighSeverity(start, end);
                } else {
                    deletedCount = systemActivityLogRepository.deleteByTimestampBetween(start, end);
                }
            }
        } catch (Exception ex) {
            status = "FAILED";
            failureReason = ex.getMessage();
        }

        Instant completedAt = Instant.now();

        // 1. Create permanent protected receipt
        AuditCleanupReceipt receipt = new AuditCleanupReceipt();
        receipt.setAdminId(adminId != null ? adminId : UUID.randomUUID());
        receipt.setAdminEmail(adminEmail != null ? adminEmail : "admin@ai-ats.internal");
        receipt.setAdminName(adminName != null ? adminName : "System Administrator");
        receipt.setOperationType(opType);
        receipt.setTargetDate(request.getDate());
        receipt.setStartDate(start);
        receipt.setEndDate(end);
        receipt.setTimezone(zoneId.getId());
        receipt.setRecordsSelected(totalMatching);
        receipt.setRecordsDeleted(deletedCount);
        receipt.setRecordsProtected(protectedCount);
        receipt.setStatus(status);
        receipt.setFailureReason(failureReason);
        receipt.setStartedAt(startedAt);
        receipt.setCompletedAt(completedAt);
        receipt.setClientIp(clientIp);
        receipt.setNotes(request.getNotes() != null && !request.getNotes().isBlank() ?
                request.getNotes() : "Cleaned up " + deletedCount + " records (" + scopeLabel + ")");

        if (auditCleanupReceiptRepository != null) {
            receipt = auditCleanupReceiptRepository.save(receipt);
        }

        // 2. Also record in Security Alerts table for cross-channel audit integrity
        if (securityAlertRepository != null) {
            try {
                SecurityAlert alert = new SecurityAlert();
                alert.setRelatedUserId(adminId);
                alert.setAccountEmail(adminEmail);
                alert.setAccountRole("ADMIN");
                alert.setRiskCategory("AUDIT_LOG_CLEANUP");
                alert.setRiskLevel("MEDIUM");
                alert.setDescription(String.format("Audit log cleanup executed (%s): Purged %d records from scope '%s'. Protected %d records.",
                        opType, deletedCount, scopeLabel, protectedCount));
                alert.setRecommendedAction("Review audit cleanup receipt ID " + (receipt != null ? receipt.getId() : "N/A") + " for compliance log.");
                alert.setReviewStatus("RESOLVED");
                alert.setAssignedAdmin(adminName);
                alert.setAdminDecision("AUTHORIZED_PURGE");
                alert.setReviewNotes("Executed via Admin Console from IP " + clientIp);
                securityAlertRepository.save(alert);
            } catch (Exception ignored) {}
        }

        return new AuditCleanupReceiptDTO(receipt);
    }

    @Transactional(readOnly = true)
    public List<AuditCleanupReceiptDTO> getAuditCleanupHistory() {
        if (auditCleanupReceiptRepository == null) {
            return Collections.emptyList();
        }
        return auditCleanupReceiptRepository.findTop20ByOrderByCompletedAtDesc().stream()
                .map(AuditCleanupReceiptDTO::new)
                .collect(Collectors.toList());
    }

    private ZoneId resolveZoneId(String tz) {
        if (tz == null || tz.isBlank()) {
            return ZoneId.of("Asia/Kolkata");
        }
        try {
            return ZoneId.of(tz.trim());
        } catch (Exception e) {
            return ZoneId.systemDefault();
        }
    }

    // ─── JOB MODERATION & WORKFLOW GOVERNANCE ────────────────────────────────

    @Transactional(readOnly = true)
    public List<JobDTO> getJobsForModeration(String statusStr, String search) {
        JobStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !statusStr.equalsIgnoreCase("ALL")) {
            status = JobStatus.fromString(statusStr);
        }
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;
        List<Job> jobs = jobRepository.filterModerationJobs(status, searchParam);
        return jobs.stream().map(this::toModerationDTO).collect(Collectors.toList());
    }

    @Transactional
    public JobDTO approveJob(UUID jobId, String adminName) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job requisition not found: " + jobId));

        User recruiter = job.getRecruiter();
        if (recruiter == null) {
            throw new BadRequestException("Job requisition has no associated recruiter.");
        }

        if (recruiter.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Cannot approve job: Recruiter " + recruiter.getFullName() + 
                    " is " + (recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus().name() : "UNVERIFIED") + 
                    ". Only verified recruiters are authorized to have jobs published.");
        }

        String resolvedAdmin = (adminName != null && !adminName.isBlank()) ? adminName : getCanonicalAdminName();
        job.setStatus(JobStatus.ACTIVE);
        job.setApprovedBy(resolvedAdmin);
        job.setApprovedAt(Instant.now());
        job.setModeratedAt(Instant.now());
        job.setRejectionReason(null);
        Job saved = jobRepository.save(job);

        // Notify the recruiter
        if (notificationRepository != null) {
            Notification notif = new Notification(
                    recruiter,
                    "Job Requisition Approved 🎉",
                    "Your job requisition '" + saved.getTitle() + "' has been approved by administrator " + resolvedAdmin + " and is now live across the candidate discovery portal.",
                    "success",
                    "/recruiter/jobs"
            );
            notificationRepository.save(notif);
        }

        // Audit log
        if (activityLogService != null) {
            activityLogService.logActivity(getCanonicalAdminId(), resolvedAdmin, Role.ADMIN,
                    "Job Approved & Published", saved.getTitle() + " at " + (saved.getCompany() != null ? saved.getCompany().getName() : "Company"), null);
        }

        return toModerationDTO(saved);
    }

    @Transactional
    public JobDTO rejectJob(UUID jobId, String reason, String adminName) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job requisition not found: " + jobId));

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A valid rejection reason or required corrections must be provided.");
        }

        String resolvedAdmin = (adminName != null && !adminName.isBlank()) ? adminName : getCanonicalAdminName();
        job.setStatus(JobStatus.REJECTED);
        job.setRejectionReason(reason.trim());
        job.setModeratedAt(Instant.now());
        Job saved = jobRepository.save(job);

        // Notify the recruiter
        if (notificationRepository != null && job.getRecruiter() != null) {
            Notification notif = new Notification(
                    job.getRecruiter(),
                    "Job Moderation: Changes Required ⚠️",
                    "Your job requisition '" + saved.getTitle() + "' requires revisions before it can be published. Reason: " + reason.trim(),
                    "warning",
                    "/recruiter/jobs"
            );
            notificationRepository.save(notif);
        }

        // Audit log
        if (activityLogService != null) {
            activityLogService.logActivity(getCanonicalAdminId(), resolvedAdmin, Role.ADMIN,
                    "Job Requisition Rejected", saved.getTitle() + " (Feedback: " + reason.trim() + ")", null);
        }

        return toModerationDTO(saved);
    }

    @Transactional
    public JobDTO archiveJob(UUID jobId, String adminName) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job requisition not found: " + jobId));

        String resolvedAdmin = (adminName != null && !adminName.isBlank()) ? adminName : getCanonicalAdminName();
        job.setStatus(JobStatus.ARCHIVED);
        job.setModeratedAt(Instant.now());
        Job saved = jobRepository.save(job);

        if (notificationRepository != null && job.getRecruiter() != null) {
            Notification notif = new Notification(
                    job.getRecruiter(),
                    "Job Unpublished & Archived",
                    "Your job requisition '" + saved.getTitle() + "' has been unpublished and archived from active candidate discovery by platform administration.",
                    "info",
                    "/recruiter/jobs"
            );
            notificationRepository.save(notif);
        }

        if (activityLogService != null) {
            activityLogService.logActivity(getCanonicalAdminId(), resolvedAdmin, Role.ADMIN,
                    "Job Requisition Archived", saved.getTitle() + " unpublished from active candidate discovery", null);
        }

        return toModerationDTO(saved);
    }

    @Transactional
    public void deleteJobByAdmin(UUID jobId, String adminName) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job requisition not found: " + jobId));

        long appCount = applicationRepository.countByJobId(jobId);
        if (appCount > 0) {
            throw new BadRequestException("Cannot permanently delete job '" + job.getTitle() + "' because it has " + 
                    appCount + " candidate applications. Use 'Archive / Unpublish' to preserve application audit records and candidate history.");
        }

        String title = job.getTitle();
        jobRepository.delete(job);

        if (activityLogService != null) {
            activityLogService.logActivity(getCanonicalAdminId(), adminName != null ? adminName : getCanonicalAdminName(), Role.ADMIN,
                    "Job Permanently Deleted", "Permanently removed job requisition: " + title, null);
        }
    }

    // ─── RECRUITER & CANDIDATE PERFORMANCE ANALYTICS ────────────────────────

    @Transactional(readOnly = true)
    public List<RecruiterPerformanceDTO> getRecruiterPerformanceList() {
        List<User> recruiters = userRepository.findByRole(Role.RECRUITER);
        List<RecruiterPerformanceDTO> result = new ArrayList<>();

        for (User r : recruiters) {
            RecruiterPerformanceDTO dto = new RecruiterPerformanceDTO();
            dto.setRecruiterId(r.getId().toString());
            dto.setRecruiterName(r.getFullName());
            dto.setRecruiterEmail(r.getEmail());
            dto.setVerificationStatus(r.getVerificationStatus() != null ? r.getVerificationStatus().name() : "PENDING");
            dto.setAccountStatus(r.getStatus() != null ? r.getStatus().name() : "ACTIVE");

            Company comp = companyRepository.findByRecruiter(r)
                    .or(() -> companyRepository.findByRecruiterId(r.getId()))
                    .orElse(null);
            if (comp != null) {
                dto.setCompanyName(comp.getName());
                dto.setCompanyLogo(comp.getLogo());
            } else {
                dto.setCompanyName(r.getCompanyName() != null ? r.getCompanyName() : "Unassigned Organization");
            }

            long submitted = jobRepository.countByRecruiterId(r.getId());
            long pending = jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.PENDING_APPROVAL);
            long active = jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.ACTIVE);
            long rejected = jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.REJECTED);
            long closed = jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.CLOSED)
                    + jobRepository.countByRecruiterIdAndStatus(r.getId(), JobStatus.ARCHIVED);

            long totalApps = applicationRepository.countByJobRecruiterId(r.getId());
            long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(r.getId(), ApplicationStatus.SHORTLISTED);
            long interviews = applicationRepository.countByJobRecruiterIdAndStatus(r.getId(), ApplicationStatus.INTERVIEW);
            long hired = applicationRepository.countByJobRecruiterIdAndStatus(r.getId(), ApplicationStatus.SELECTED)
                    + applicationRepository.countByJobRecruiterIdAndStatus(r.getId(), ApplicationStatus.OFFERED);

            dto.setJobsSubmitted(submitted);
            dto.setJobsPending(pending);
            dto.setJobsApproved(active);
            dto.setJobsRejected(rejected);
            dto.setActiveJobs(active);
            dto.setClosedJobs(closed);

            dto.setTotalApplications(totalApps);
            dto.setShortlistedCandidates(shortlisted);
            dto.setInterviewsScheduled(interviews);
            dto.setHires(hired);

            if (totalApps > 0 && interviews > 0) {
                dto.setApplicationToInterviewRate(Math.round(((double) interviews / totalApps) * 1000.0) / 10.0);
            } else {
                dto.setApplicationToInterviewRate(null);
            }

            if (interviews > 0 && hired > 0) {
                dto.setInterviewToHireRate(Math.round(((double) hired / interviews) * 1000.0) / 10.0);
            } else {
                dto.setInterviewToHireRate(null);
            }

            if (totalApps > 0 && hired > 0) {
                dto.setPlacementRate(Math.round(((double) hired / totalApps) * 1000.0) / 10.0);
            } else {
                dto.setPlacementRate(null);
            }

            dto.setLastActivityAt(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : r.getCreatedAt().toString());
            result.add(dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public CandidatePerformanceDTO getCandidatePerformanceOverview() {
        CandidatePerformanceDTO dto = new CandidatePerformanceDTO();
        long totalCandidates = userRepository.countByRole(Role.CANDIDATE);
        long activeCandidates = userRepository.countByRoleAndStatus(Role.CANDIDATE, UserStatus.ACTIVE);
        long totalApps = applicationRepository.count();
        long underReview = applicationRepository.countByStatus(ApplicationStatus.UNDER_REVIEW) 
                + applicationRepository.countByStatus(ApplicationStatus.APPLIED);
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByStatus(ApplicationStatus.INTERVIEW);
        long offers = applicationRepository.countByStatus(ApplicationStatus.OFFERED);
        long hired = applicationRepository.countByStatus(ApplicationStatus.SELECTED);

        dto.setTotalCandidates(totalCandidates);
        dto.setActiveCandidates(activeCandidates);
        dto.setTotalApplications(totalApps);
        dto.setApplicationsUnderReview(underReview);
        dto.setShortlistedCount(shortlisted);
        dto.setInterviewsScheduled(interviews);
        dto.setOffersCount(offers);
        dto.setHiredCount(hired);

        if (totalApps > 0 && shortlisted > 0) {
            dto.setShortlistingRate(Math.round(((double) shortlisted / totalApps) * 1000.0) / 10.0);
        }
        if (totalApps > 0 && interviews > 0) {
            dto.setInterviewRate(Math.round(((double) interviews / totalApps) * 1000.0) / 10.0);
        }
        if (totalApps > 0 && hired > 0) {
            dto.setPlacementRate(Math.round(((double) hired / totalApps) * 1000.0) / 10.0);
        }

        List<User> candidateUsers = userRepository.findByRole(Role.CANDIDATE);
        List<CandidatePerformanceDTO.CandidateDetailItem> items = new ArrayList<>();
        for (User u : candidateUsers) {
            CandidatePerformanceDTO.CandidateDetailItem item = new CandidatePerformanceDTO.CandidateDetailItem();
            item.setCandidateId(u.getId().toString());
            item.setCandidateName(u.getFullName());
            item.setCandidateEmail(u.getEmail());
            item.setRegisteredAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);

            var profileOpt = candidateProfileRepository.findByUserId(u.getId());
            item.setProfileCompletion(profileOpt.map(com.aiats.entity.CandidateProfile::getProfileCompletion).orElse(0));
            item.setHasResume(resumeRepository.existsByUserId(u.getId()));

            long cApps = applicationRepository.countByCandidateId(u.getId());
            long cShort = applicationRepository.countByCandidateIdAndStatus(u.getId(), ApplicationStatus.SHORTLISTED);
            long cInt = applicationRepository.countByCandidateIdAndStatus(u.getId(), ApplicationStatus.INTERVIEW);
            long cOff = applicationRepository.countByCandidateIdAndStatus(u.getId(), ApplicationStatus.OFFERED)
                    + applicationRepository.countByCandidateIdAndStatus(u.getId(), ApplicationStatus.SELECTED);

            item.setApplicationsCount(cApps);
            item.setShortlistedCount(cShort);
            item.setInterviewsCount(cInt);
            item.setOffersCount(cOff);
            item.setLatestStatus(cOff > 0 ? "Offered / Hired" : cInt > 0 ? "Interviewing" : cShort > 0 ? "Shortlisted" : cApps > 0 ? "Applied" : "Profile Active");
            item.setLastActivityAt(u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null);
            items.add(item);
        }
        dto.setCandidates(items);

        return dto;
    }

    public JobDTO toModerationDTO(Job job) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId().toString());
        dto.setTitle(job.getTitle());
        dto.setDepartment(job.getDepartment());
        dto.setLocation(job.getLocation());
        dto.setType(job.getEmploymentType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setDescription(job.getDescription());
        dto.setEducationRequired(job.getEducationRequired());
        dto.setDeadline(job.getDeadline());
        dto.setPostedAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        dto.setApplicantsCount(job.getApplicantCount());
        dto.setStatus(job.getStatus() != null ? job.getStatus().name().toLowerCase() : "active");

        if (job.getSalaryMin() != null) dto.setSalaryMin(job.getSalaryMin().toPlainString());
        if (job.getSalaryMax() != null) dto.setSalaryMax(job.getSalaryMax().toPlainString());
        dto.setCurrency(job.getSalaryCurrency());

        if (job.getRequirements() != null && !job.getRequirements().isBlank()) {
            dto.setRequirements(Arrays.asList(job.getRequirements().split("\\|\\|")));
        }
        if (job.getResponsibilities() != null && !job.getResponsibilities().isBlank()) {
            dto.setResponsibilities(Arrays.asList(job.getResponsibilities().split("\\|\\|")));
        }
        if (job.getSkills() != null && !job.getSkills().isBlank()) {
            dto.setSkills(Arrays.asList(job.getSkills().split(",")));
        }

        if (job.getCompany() != null) {
            dto.setCompany(job.getCompany().getName());
            dto.setCompanyId(job.getCompany().getId().toString());
            dto.setCompanyLogo(job.getCompany().getLogo());
            dto.setVerifiedRecruiter(job.getCompany().isVerified());
        }
        if (job.getRecruiter() != null) {
            dto.setRecruiterId(job.getRecruiter().getId().toString());
            dto.setRecruiterName(job.getRecruiter().getFullName());
            dto.setRecruiterEmail(job.getRecruiter().getEmail());
            dto.setRecruiterVerificationStatus(job.getRecruiter().getVerificationStatus() != null ? job.getRecruiter().getVerificationStatus().name() : "PENDING");
            dto.setVerifiedRecruiter(job.getRecruiter().getVerificationStatus() == VerificationStatus.VERIFIED);
        }

        dto.setRejectionReason(job.getRejectionReason());
        dto.setApprovedBy(job.getApprovedBy());
        dto.setApprovedAt(job.getApprovedAt() != null ? job.getApprovedAt().toString() : null);
        dto.setModeratedAt(job.getModeratedAt() != null ? job.getModeratedAt().toString() : null);

        return dto;
    }
}

