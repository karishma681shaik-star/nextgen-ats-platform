package com.aiats.security;

import com.aiats.dto.job.JobRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.*;
import com.aiats.service.ActivityLogService;
import com.aiats.service.AdminService;
import com.aiats.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecruiterVerificationSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private SavedJobRepository savedJobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private CandidateSkillRepository candidateSkillRepository;

    @Mock
    private SystemActivityLogRepository systemActivityLogRepository;

    private ActivityLogService activityLogService;

    private JobService jobService;
    private AdminService adminService;

    private User pendingRecruiter;
    private User verifiedRecruiter;
    private User rejectedRecruiter;
    private User suspendedRecruiter;
    private Company verifiedCompany;
    private Company pendingCompany;

    @BeforeEach
    void setUp() {
        activityLogService = new ActivityLogService(systemActivityLogRepository);

        jobService = new JobService(
                jobRepository, companyRepository, userRepository,
                savedJobRepository, applicationRepository,
                candidateProfileRepository, candidateSkillRepository,
                activityLogService
        );

        adminService = new AdminService(
                userRepository, jobRepository, applicationRepository,
                companyRepository, systemActivityLogRepository, activityLogService
        );

        // Pending Recruiter
        pendingRecruiter = new User();
        pendingRecruiter.setId(UUID.randomUUID());
        pendingRecruiter.setEmail("pending@techcorp.io");
        pendingRecruiter.setFullName("Jane Doe");
        pendingRecruiter.setRole(Role.RECRUITER);
        pendingRecruiter.setStatus(UserStatus.ACTIVE);
        pendingRecruiter.setVerificationStatus(VerificationStatus.PENDING);
        pendingRecruiter.setCompanyName("TechCorp AI");

        pendingCompany = new Company();
        pendingCompany.setId(UUID.randomUUID());
        pendingCompany.setName("TechCorp AI");
        pendingCompany.setRecruiter(pendingRecruiter);
        pendingCompany.setVerified(false);

        // Verified Recruiter
        verifiedRecruiter = new User();
        verifiedRecruiter.setId(UUID.randomUUID());
        verifiedRecruiter.setEmail("verified@cloudscale.io");
        verifiedRecruiter.setFullName("Sarah Jenkins");
        verifiedRecruiter.setRole(Role.RECRUITER);
        verifiedRecruiter.setStatus(UserStatus.ACTIVE);
        verifiedRecruiter.setVerificationStatus(VerificationStatus.VERIFIED);
        verifiedRecruiter.setCompanyName("CloudScale AI");

        verifiedCompany = new Company();
        verifiedCompany.setId(UUID.randomUUID());
        verifiedCompany.setName("CloudScale AI");
        verifiedCompany.setRecruiter(verifiedRecruiter);
        verifiedCompany.setVerified(true);

        // Rejected Recruiter
        rejectedRecruiter = new User();
        rejectedRecruiter.setId(UUID.randomUUID());
        rejectedRecruiter.setEmail("rejected@bogus.com");
        rejectedRecruiter.setFullName("Bob Fake");
        rejectedRecruiter.setRole(Role.RECRUITER);
        rejectedRecruiter.setStatus(UserStatus.ACTIVE);
        rejectedRecruiter.setVerificationStatus(VerificationStatus.REJECTED);
        rejectedRecruiter.setRejectionReason("Invalid business registration document");

        // Suspended Recruiter
        suspendedRecruiter = new User();
        suspendedRecruiter.setId(UUID.randomUUID());
        suspendedRecruiter.setEmail("suspended@spam.com");
        suspendedRecruiter.setFullName("Spam Recruiter");
        suspendedRecruiter.setRole(Role.RECRUITER);
        suspendedRecruiter.setStatus(UserStatus.SUSPENDED);
        suspendedRecruiter.setVerificationStatus(VerificationStatus.SUSPENDED);
    }

    @Test
    @DisplayName("RULE ENFORCEMENT: Pending recruiter cannot post jobs (403 Access Denied)")
    void testPendingRecruiterCannotPostJobs() {
        when(userRepository.findById(pendingRecruiter.getId())).thenReturn(Optional.of(pendingRecruiter));

        JobRequest req = new JobRequest();
        req.setTitle("Senior Full Stack Engineer");
        req.setLocation("Remote");
        req.setDescription("Job description");
        req.setSkills(List.of("Java", "Spring Boot"));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                jobService.createJob(pendingRecruiter.getId(), req)
        );
        assertTrue(ex.getMessage().contains("awaiting administrator verification"));
        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    @DisplayName("RULE ENFORCEMENT: Rejected recruiter cannot post jobs (403 Access Denied)")
    void testRejectedRecruiterCannotPostJobs() {
        when(userRepository.findById(rejectedRecruiter.getId())).thenReturn(Optional.of(rejectedRecruiter));

        JobRequest req = new JobRequest();
        req.setTitle("Backend Engineer");
        req.setLocation("Remote");
        req.setDescription("Job description");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                jobService.createJob(rejectedRecruiter.getId(), req)
        );
        assertTrue(ex.getMessage().contains("rejected"));
        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    @DisplayName("RULE ENFORCEMENT: Suspended recruiter cannot post jobs (403 Access Denied)")
    void testSuspendedRecruiterCannotPostJobs() {
        when(userRepository.findById(suspendedRecruiter.getId())).thenReturn(Optional.of(suspendedRecruiter));

        JobRequest req = new JobRequest();
        req.setTitle("Lead Architect");
        req.setLocation("Remote");
        req.setDescription("Job description");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                jobService.createJob(suspendedRecruiter.getId(), req)
        );
        assertTrue(ex.getMessage().contains("suspended"));
        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    @DisplayName("RULE ENFORCEMENT: Verified recruiter is authorized to post jobs")
    void testVerifiedRecruiterCanPostJobs() {
        when(userRepository.findById(verifiedRecruiter.getId())).thenReturn(Optional.of(verifiedRecruiter));
        when(companyRepository.findByRecruiterId(verifiedRecruiter.getId())).thenReturn(Optional.of(verifiedCompany));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
            Job j = invocation.getArgument(0);
            j.setId(UUID.randomUUID());
            return j;
        });

        JobRequest req = new JobRequest();
        req.setTitle("Senior Cloud Platform Architect");
        req.setLocation("San Francisco, CA");
        req.setDescription("Lead high-scale Kubernetes and Java microservices.");
        req.setSkills(List.of("Java", "Spring Boot", "AWS", "Kubernetes"));

        var created = jobService.createJob(verifiedRecruiter.getId(), req);

        assertNotNull(created);
        assertEquals("Senior Cloud Platform Architect", created.getTitle());
        verify(jobRepository, times(1)).save(any(Job.class));
        verify(systemActivityLogRepository, times(1)).save(argThat(log ->
                "Job Created".equals(log.getAction()) &&
                log.getTarget().contains("Senior Cloud Platform Architect")
        ));
    }

    @Test
    @DisplayName("ADMIN DECISION: Administrator approves pending recruiter -> status becomes VERIFIED")
    void testAdministratorApprovesRecruiter() {
        when(userRepository.findById(pendingRecruiter.getId())).thenReturn(Optional.of(pendingRecruiter));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(companyRepository.findByRecruiter(pendingRecruiter)).thenReturn(Optional.of(pendingCompany));

        var result = adminService.approveRecruiter(pendingRecruiter.getId(), "Marcus Vance");

        assertNotNull(result);
        assertEquals("verified", result.getVerificationStatus());
        assertTrue(result.isVerified());
        assertEquals("Marcus Vance", result.getVerifiedBy());
        assertNotNull(result.getVerifiedAt());
        assertNull(result.getRejectionReason());

        verify(userRepository, times(1)).save(argThat(u ->
                u.getVerificationStatus() == VerificationStatus.VERIFIED &&
                "Marcus Vance".equals(u.getVerifiedBy())
        ));
        verify(companyRepository, times(1)).save(argThat(Company::isVerified));
    }

    @Test
    @DisplayName("ADMIN DECISION: Administrator rejects recruiter with reason -> status becomes REJECTED")
    void testAdministratorRejectsRecruiter() {
        when(userRepository.findById(pendingRecruiter.getId())).thenReturn(Optional.of(pendingRecruiter));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(companyRepository.findByRecruiter(pendingRecruiter)).thenReturn(Optional.of(pendingCompany));

        String reason = "Corporate website and tax identification number could not be validated.";
        var result = adminService.rejectRecruiter(pendingRecruiter.getId(), reason, "Marcus Vance");

        assertNotNull(result);
        assertEquals("rejected", result.getVerificationStatus());
        assertFalse(result.isVerified());
        assertEquals(reason, result.getRejectionReason());

        verify(userRepository, times(1)).save(argThat(u ->
                u.getVerificationStatus() == VerificationStatus.REJECTED &&
                reason.equals(u.getRejectionReason())
        ));
        verify(companyRepository, times(1)).save(argThat(c -> !c.isVerified()));
    }

    @Test
    @DisplayName("SECURITY OWNERSHIP: Recruiter cannot modify another recruiter's job")
    void testRecruiterCannotEditAnotherRecruitersJob() {
        UUID jobUuid = UUID.randomUUID();
        Job otherJob = new Job();
        otherJob.setId(jobUuid);
        otherJob.setTitle("Competitor Job");
        otherJob.setRecruiter(verifiedRecruiter); // Owned by Sarah Jenkins

        when(jobRepository.findById(jobUuid)).thenReturn(Optional.of(otherJob));

        UUID rogueRecruiterId = UUID.randomUUID();
        JobRequest req = new JobRequest();
        req.setTitle("Hijacked Job Title");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                jobService.updateJob(rogueRecruiterId, jobUuid, req)
        );
        assertTrue(ex.getMessage().contains("not authorized to edit this job"));
    }
}
