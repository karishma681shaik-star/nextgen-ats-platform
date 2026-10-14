package com.aiats.service;

import com.aiats.dto.admin.CandidateReportReviewRequest;
import com.aiats.dto.candidate.CandidateReportDTO;
import com.aiats.dto.candidate.CandidateReportRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateReportServiceTest {

    @Mock
    private CandidateReportRepository candidateReportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private SystemActivityLogRepository systemActivityLogRepository;
    @Mock
    private SecurityAlertRepository securityAlertRepository;

    private NotificationService notificationService;
    private ActivityLogService activityLogService;
    private SecurityAlertService securityAlertService;
    private CandidateReportService candidateReportService;

    private User candidate;
    private User recruiter;
    private Company company;
    private Job job;
    private UUID candidateId;
    private UUID recruiterId;
    private UUID jobId;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository);
        activityLogService = new ActivityLogService(systemActivityLogRepository);
        securityAlertService = new SecurityAlertService(securityAlertRepository, userRepository, notificationService, activityLogService);
        candidateReportService = new CandidateReportService(
                candidateReportRepository, userRepository, jobRepository, companyRepository,
                notificationService, activityLogService, securityAlertService
        );

        candidateId = UUID.randomUUID();
        recruiterId = UUID.randomUUID();
        jobId = UUID.randomUUID();

        candidate = new User();
        candidate.setId(candidateId);
        candidate.setEmail("candidate@test.com");
        candidate.setFullName("Jane Candidate");
        candidate.setRole(Role.CANDIDATE);
        candidate.setStatus(UserStatus.ACTIVE);

        recruiter = new User();
        recruiter.setId(recruiterId);
        recruiter.setEmail("recruiter@fakecorp.com");
        recruiter.setFullName("John Recruiter");
        recruiter.setRole(Role.RECRUITER);
        recruiter.setStatus(UserStatus.ACTIVE);
        recruiter.setVerificationStatus(VerificationStatus.VERIFIED);

        company = new Company();
        company.setId(UUID.randomUUID());
        company.setName("Fake Corp");
        company.setRecruiter(recruiter);

        job = new Job();
        job.setId(jobId);
        job.setTitle("Senior Cloud Architect");
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setStatus(JobStatus.ACTIVE);
    }

    @Test
    @DisplayName("Submit report successfully and persist security alert on fee demand")
    void testSubmitReportFeeDemand() {
        CandidateReportRequest req = new CandidateReportRequest();
        req.setJobId(jobId);
        req.setCategory("RECRUITMENT_FEE_DEMAND");
        req.setDescription("Recruiter asked for $500 application processing fee");

        when(userRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(candidateReportRepository.existsByReporterIdAndJobIdAndStatusNot(candidateId, jobId, "RESOLVED")).thenReturn(false);
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(candidateReportRepository.save(any(CandidateReport.class))).thenAnswer(inv -> {
            CandidateReport r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        CandidateReportDTO result = candidateReportService.submitReport(candidateId, req);

        assertNotNull(result);
        assertEquals("RECRUITMENT_FEE_DEMAND", result.getCategory());
        assertEquals("Senior Cloud Architect", result.getJobTitle());
        assertEquals("Fake Corp", result.getCompanyName());

        // Verify security alert was saved in repository for high-risk fee demand
        verify(securityAlertRepository, atLeastOnce()).save(any(SecurityAlert.class));
    }

    @Test
    @DisplayName("Duplicate active report is rejected with BadRequestException")
    void testDuplicateReportBlocked() {
        CandidateReportRequest req = new CandidateReportRequest();
        req.setJobId(jobId);
        req.setCategory("SUSPECTED_FAKE_RECRUITER");
        req.setDescription("Duplicate report attempt");

        when(userRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(candidateReportRepository.existsByReporterIdAndJobIdAndStatusNot(candidateId, jobId, "RESOLVED")).thenReturn(true);
        when(candidateReportRepository.existsByReporterIdAndJobIdAndStatusNot(candidateId, jobId, "DISMISSED")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> candidateReportService.submitReport(candidateId, req));
    }

    @Test
    @DisplayName("Admin review report with action JOB_UNPUBLISHED unpublishes job")
    void testReviewReportUnpublishJob() {
        UUID reportId = UUID.randomUUID();
        CandidateReport report = new CandidateReport(
                candidateId, candidate.getEmail(), candidate.getFullName(),
                jobId, job.getTitle(), recruiterId, recruiter.getFullName(),
                company.getId(), company.getName(), "MISLEADING_JOB_DESCRIPTION", "Job description is deceptive"
        );
        report.setId(reportId);

        when(candidateReportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(candidateReportRepository.save(any(CandidateReport.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidateReportReviewRequest reviewReq = new CandidateReportReviewRequest();
        reviewReq.setStatus("RESOLVED");
        reviewReq.setActionTaken("JOB_UNPUBLISHED");
        reviewReq.setAdminDecision("Job unpublished for safety review");
        reviewReq.setAdminNotes("Salary and duties found to be misrepresented");

        CandidateReportDTO reviewed = candidateReportService.reviewReport(UUID.randomUUID(), "Marcus Vance", reportId, reviewReq);

        assertNotNull(reviewed);
        assertEquals("RESOLVED", reviewed.getStatus());
        assertEquals("JOB_UNPUBLISHED", reviewed.getActionTaken());
        assertEquals("Marcus Vance", reviewed.getAssignedAdmin());

        // Verify job was archived/unpublished
        assertEquals(JobStatus.ARCHIVED, job.getStatus());
        verify(jobRepository, times(1)).save(job);
    }

    @Test
    @DisplayName("Admin review report with action SUSPEND_RECRUITER suspends recruiter")
    void testReviewReportSuspendRecruiter() {
        UUID reportId = UUID.randomUUID();
        CandidateReport report = new CandidateReport(
                candidateId, candidate.getEmail(), candidate.getFullName(),
                jobId, job.getTitle(), recruiterId, recruiter.getFullName(),
                company.getId(), company.getName(), "RECRUITMENT_FEE_DEMAND", "Confirmed fee demand"
        );
        report.setId(reportId);

        when(candidateReportRepository.findById(reportId)).thenReturn(Optional.of(report));
        when(userRepository.findById(recruiterId)).thenReturn(Optional.of(recruiter));
        when(candidateReportRepository.save(any(CandidateReport.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidateReportReviewRequest reviewReq = new CandidateReportReviewRequest();
        reviewReq.setStatus("RESOLVED");
        reviewReq.setActionTaken("SUSPEND_RECRUITER");
        reviewReq.setAdminDecision("Account suspended for platform violation");

        CandidateReportDTO reviewed = candidateReportService.reviewReport(UUID.randomUUID(), "Marcus Vance", reportId, reviewReq);

        assertNotNull(reviewed);
        assertEquals(VerificationStatus.SUSPENDED, recruiter.getVerificationStatus());
        assertEquals(UserStatus.SUSPENDED, recruiter.getStatus());
        verify(userRepository, times(1)).save(recruiter);
    }
}
