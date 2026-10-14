package com.aiats.service;

import com.aiats.dto.admin.CandidateReportReviewRequest;
import com.aiats.dto.candidate.CandidateReportDTO;
import com.aiats.dto.candidate.CandidateReportRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CandidateReportService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateReportService.class);

    private final CandidateReportRepository candidateReportRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;
    private final SecurityAlertService securityAlertService;

    public CandidateReportService(CandidateReportRepository candidateReportRepository,
                                  UserRepository userRepository,
                                  JobRepository jobRepository,
                                  CompanyRepository companyRepository,
                                  NotificationService notificationService,
                                  ActivityLogService activityLogService,
                                  SecurityAlertService securityAlertService) {
        this.candidateReportRepository = candidateReportRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
        this.securityAlertService = securityAlertService;
    }

    @Transactional
    public CandidateReportDTO submitReport(UUID reporterId, CandidateReportRequest request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found: " + reporterId));

        if (request.getJobId() == null) {
            throw new BadRequestException("A valid target Job ID must be specified for candidate reports.");
        }

        // Prevent duplicate open reports for the same job from this candidate
        if (candidateReportRepository.existsByReporterIdAndJobIdAndStatusNot(reporterId, request.getJobId(), "RESOLVED") &&
            candidateReportRepository.existsByReporterIdAndJobIdAndStatusNot(reporterId, request.getJobId(), "DISMISSED")) {
            throw new BadRequestException("You have already submitted an active report for this job requisition. Our compliance moderation team is reviewing it.");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Reported job requisition not found: " + request.getJobId()));

        User recruiter = job.getRecruiter();
        Company company = job.getCompany();

        CandidateReport report = new CandidateReport(
                reporterId,
                reporter.getEmail(),
                reporter.getFullName(),
                job.getId(),
                job.getTitle(),
                recruiter != null ? recruiter.getId() : null,
                recruiter != null ? recruiter.getFullName() : "Unknown Recruiter",
                company != null ? company.getId() : null,
                company != null ? company.getName() : "Unknown Company",
                request.getCategory() != null ? request.getCategory() : "OTHER",
                request.getDescription()
        );

        CandidateReport saved = candidateReportRepository.save(report);

        // Security Alert Integration: Automatically trigger High Priority alert for fraud/fee demands
        if ("RECRUITMENT_FEE_DEMAND".equalsIgnoreCase(request.getCategory()) ||
            "SUSPECTED_FAKE_RECRUITER".equalsIgnoreCase(request.getCategory())) {
            if (securityAlertService != null && recruiter != null) {
                securityAlertService.createAlert(
                        recruiter.getId(),
                        recruiter.getEmail(),
                        "RECRUITER",
                        "CANDIDATE_FRAUD_COMPLAINT_" + request.getCategory(),
                        "HIGH",
                        "Candidate " + reporter.getFullName() + " reported job '" + job.getTitle() + "' under category: " + request.getCategory() + ". Observation: " + request.getDescription(),
                        "Immediately inspect job requisition, check for fee/payment demands, and consider unpublishing requisition pending review."
                );
            }
        }

        // Notify Lead Administrator
        if (notificationService != null) {
            userRepository.findByEmailIgnoreCase("admin@ai-ats.internal").ifPresent(admin -> {
                notificationService.createNotification(
                        admin,
                        "Job Safety Alert: Candidate Report Filed",
                        "Candidate report filed against '" + job.getTitle() + "' (" + (company != null ? company.getName() : "Company") + ") for: " + request.getCategory(),
                        "warning",
                        "/admin/jobs"
                );
            });
        }

        // Log audit event
        if (activityLogService != null) {
            activityLogService.logActivity(
                    reporterId,
                    reporter.getFullName(),
                    Role.CANDIDATE,
                    "Candidate Report Submitted",
                    request.getCategory() + " on job '" + job.getTitle() + "'",
                    null
            );
        }

        return new CandidateReportDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<CandidateReportDTO> getReports(String status, String category, String search) {
        String statusParam = (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;
        String categoryParam = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;

        List<CandidateReport> reports;
        if (statusParam == null && categoryParam == null && searchParam == null) {
            reports = candidateReportRepository.findAllByOrderByCreatedAtDesc();
        } else {
            reports = candidateReportRepository.filterReports(statusParam, categoryParam, searchParam);
        }

        return reports
                .stream()
                .map(CandidateReportDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CandidateReportDTO getReportById(UUID reportId) {
        CandidateReport report = candidateReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));
        return new CandidateReportDTO(report);
    }

    @Transactional
    public CandidateReportDTO reviewReport(UUID adminId, String adminName, UUID reportId, CandidateReportReviewRequest request) {
        CandidateReport report = candidateReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        String resolvedAdmin = (adminName != null && !adminName.isBlank()) ? adminName : "Marcus Vance";
        report.setAssignedAdmin(resolvedAdmin);
        report.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "RESOLVED");
        report.setAdminDecision(request.getAdminDecision() != null ? request.getAdminDecision() : "Moderation Review Completed");
        report.setAdminNotes(request.getAdminNotes());
        report.setActionTaken(request.getActionTaken() != null ? request.getActionTaken().toUpperCase() : "NONE");
        report.setUpdatedAt(Instant.now());

        // Perform administrative actions based on actionTaken
        if ("JOB_UNPUBLISHED".equalsIgnoreCase(request.getActionTaken()) && report.getJobId() != null) {
            jobRepository.findById(report.getJobId()).ifPresent(job -> {
                job.setStatus(JobStatus.ARCHIVED);
                job.setModeratedAt(Instant.now());
                jobRepository.save(job);
                if (notificationService != null && job.getRecruiter() != null) {
                    notificationService.createNotification(
                            job.getRecruiter(),
                            "Job Requisition Unpublished Following Moderation",
                            "Your job requisition '" + job.getTitle() + "' has been unpublished pending safety investigation. Admin note: " + (request.getAdminNotes() != null ? request.getAdminNotes() : "Safety review"),
                            "warning",
                            "/recruiter/jobs"
                    );
                }
            });
        } else if ("REOPEN_VERIFICATION".equalsIgnoreCase(request.getActionTaken()) && report.getRecruiterId() != null) {
            userRepository.findById(report.getRecruiterId()).ifPresent(r -> {
                r.setVerificationStatus(VerificationStatus.IN_REVIEW);
                userRepository.save(r);
                if (notificationService != null) {
                    notificationService.createNotification(
                            r,
                            "Recruiter Verification Reopened for Review",
                            "Your recruiter credentials have been reopened for administrative review following report analysis. Please ensure profile and company credentials remain accurate.",
                            "info",
                            "/recruiter/verification"
                    );
                }
            });
        } else if ("SUSPEND_RECRUITER".equalsIgnoreCase(request.getActionTaken()) && report.getRecruiterId() != null) {
            userRepository.findById(report.getRecruiterId()).ifPresent(r -> {
                r.setVerificationStatus(VerificationStatus.SUSPENDED);
                r.setStatus(UserStatus.SUSPENDED);
                r.setRejectionReason("Account suspended following confirmed moderation report: " + (request.getAdminDecision() != null ? request.getAdminDecision() : "Platform policy violation"));
                userRepository.save(r);
                jobRepository.findByRecruiterId(r.getId()).forEach(j -> {
                    j.setStatus(JobStatus.CLOSED);
                    jobRepository.save(j);
                });
                if (notificationService != null) {
                    notificationService.createNotification(
                            r,
                            "Recruiter Account Suspended",
                            "Your account has been suspended following administrative report review. Contact platform support if you believe this is in error.",
                            "error",
                            "/recruiter/verification"
                    );
                }
            });
        }

        CandidateReport saved = candidateReportRepository.save(report);

        // Notify reporting candidate of resolution
        if (notificationService != null && report.getReporterId() != null) {
            userRepository.findById(report.getReporterId()).ifPresent(c -> {
                String outcome = report.getStatus().equalsIgnoreCase("RESOLVED") ? "investigated and addressed" : "reviewed";
                notificationService.createNotification(
                        c,
                        "Report Status Update",
                        "Thank you for helping keep our platform safe. Your report concerning '" + report.getJobTitle() + "' has been " + outcome + " by our trust & safety team.",
                        "info",
                        "/candidate/jobs"
                );
            });
        }

        // Log audit event
        if (activityLogService != null) {
            activityLogService.logActivity(
                    adminId,
                    resolvedAdmin,
                    Role.ADMIN,
                    "Candidate Report Moderated",
                    "Report " + report.getId() + " on job '" + report.getJobTitle() + "' marked as " + report.getStatus() + " (Action: " + report.getActionTaken() + ")",
                    null
            );
        }

        return new CandidateReportDTO(saved);
    }
}
