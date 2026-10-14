package com.aiats.security;

import com.aiats.dto.admin.AiSuggestionDTO;
import com.aiats.dto.admin.VerificationDecisionRequest;
import com.aiats.dto.job.JobRequest;
import com.aiats.dto.recruiter.VerificationResubmitRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.*;
import com.aiats.service.ActivityLogService;
import com.aiats.service.AdminService;
import com.aiats.service.JobService;
import com.aiats.service.RecruiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecruiterVerificationWorkflowTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private SavedJobRepository savedJobRepository;
    @Mock
    private CandidateProfileRepository candidateProfileRepository;
    @Mock
    private CandidateSkillRepository candidateSkillRepository;
    @Mock
    private SystemActivityLogRepository systemActivityLogRepository;
    @Mock
    private VerificationHistoryRepository verificationHistoryRepository;
    @Mock
    private NotificationRepository notificationRepository;

    private ActivityLogService activityLogService;
    private AdminService adminService;
    private JobService jobService;
    private RecruiterService recruiterService;

    private User recruiter;
    private Company company;

    @BeforeEach
    void setUp() {
        activityLogService = new ActivityLogService(systemActivityLogRepository);

        adminService = new AdminService(
                userRepository, jobRepository, applicationRepository, companyRepository,
                systemActivityLogRepository, activityLogService, notificationRepository, null
        );

        jobService = new JobService(
                jobRepository, companyRepository, userRepository, savedJobRepository,
                applicationRepository, candidateProfileRepository, candidateSkillRepository,
                activityLogService
        );

        recruiterService = new RecruiterService(
                companyRepository, userRepository, jobRepository, applicationRepository
        );

        recruiter = new User();
        recruiter.setId(UUID.randomUUID());
        recruiter.setEmail("recruiter@apexglobal.com");
        recruiter.setFullName("Elena Rostova");
        recruiter.setRole(Role.RECRUITER);
        recruiter.setStatus(UserStatus.ACTIVE);
        recruiter.setVerificationStatus(VerificationStatus.PENDING);
        recruiter.setCompanyName("Apex Global");

        company = new Company();
        company.setId(UUID.randomUUID());
        company.setName("Apex Global");
        company.setRecruiter(recruiter);
        company.setVerified(false);
    }

    @Test
    @DisplayName("WORKFLOW TEST 1: Administrator rejects recruiter with structured category, reason, corrective actions")
    void testStructuredRejectionWithCategoryAndActions() {
        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(companyRepository.findByRecruiter(recruiter)).thenReturn(Optional.of(company));

        VerificationDecisionRequest request = new VerificationDecisionRequest(
                "Business registration could not be verified",
                "Submitted Certificate of Incorporation did not match the registered legal business name in state registry.",
                "Review registered legal entity name and upload official registration document with clear seal.",
                "[{\"issue\":\"Entity mismatch\"}]",
                true,
                "Please upload verified documentation within 14 business days."
        );

        var result = adminService.rejectRecruiter(recruiter.getId(), request, "Marcus Vance");

        assertNotNull(result);
        assertEquals("rejected", result.getVerificationStatus());
        assertFalse(result.isVerified());
        assertEquals("Business registration could not be verified", result.getRejectionCategory());
        assertEquals("Submitted Certificate of Incorporation did not match the registered legal business name in state registry.", result.getRejectionReason());
        assertEquals("Review registered legal entity name and upload official registration document with clear seal.", result.getCorrectiveActions());
        assertTrue(result.getResubmissionAllowed());

        // Verify in-app persistent notification created
        verify(notificationRepository, times(1)).save(argThat(n ->
                n.getUser().getId().equals(recruiter.getId()) &&
                n.getTitle().contains("Recruiter Verification Update") &&
                n.getLink().equals("/recruiter/verification")
        ));
    }

    @Test
    @DisplayName("WORKFLOW TEST 2: Rejection without a valid detailed reason throws BadRequestException")
    void testRejectionWithoutReasonFails() {
        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));

        VerificationDecisionRequest emptyReasonReq = new VerificationDecisionRequest(
                "Company information is incomplete",
                "   ",
                null, null, true, null
        );

        assertThrows(BadRequestException.class, () ->
                adminService.rejectRecruiter(recruiter.getId(), emptyReasonReq, "Marcus Vance")
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("WORKFLOW TEST 3: RESUBMITTED recruiter is strictly blocked from publishing jobs at backend API")
    void testResubmittedRecruiterCannotPostJobs() {
        recruiter.setVerificationStatus(VerificationStatus.RESUBMITTED);
        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));

        JobRequest jobReq = new JobRequest();
        jobReq.setTitle("Lead DevOps Architect");
        jobReq.setLocation("Remote");
        jobReq.setDescription("DevOps role");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                jobService.createJob(recruiter.getId(), jobReq)
        );
        assertTrue(ex.getMessage().contains("resubmitted and is awaiting administrator review"));
        verify(jobRepository, never()).save(any(Job.class));
    }

    @Test
    @DisplayName("WORKFLOW TEST 4: Recruiter resubmits updated company info -> status becomes RESUBMITTED")
    void testRecruiterResubmissionWorkflow() {
        recruiter.setVerificationStatus(VerificationStatus.REJECTED);
        recruiter.setRejectionCategory("Company information is incomplete");
        recruiter.setRejectionReason("Missing official website and contact phone.");
        recruiter.setResubmissionAllowed(true);

        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        when(companyRepository.findByRecruiterId(recruiter.getId())).thenReturn(Optional.of(company));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        VerificationResubmitRequest req = new VerificationResubmitRequest();
        req.setName("Apex Global Enterprise LLC");
        req.setWebsite("https://apexglobal.com");
        req.setContactPhone("+1-555-0199");
        req.setIndustry("Technology & Cloud Software");
        req.setRecruiterNotes("Updated legal entity name and provided direct corporate contact.");

        var res = recruiterService.resubmitVerification(recruiter.getId(), req);

        assertNotNull(res);
        assertEquals("resubmitted", res.getVerificationStatus());
        assertFalse(res.isVerified());
        assertNotNull(res.getResubmittedAt());
        assertEquals("Updated legal entity name and provided direct corporate contact.", res.getResubmissionNotes());

        // Verify company profile was updated
        verify(companyRepository, times(1)).save(argThat(c ->
                "Apex Global Enterprise LLC".equals(c.getName()) &&
                "https://apexglobal.com".equals(c.getWebsite()) &&
                !c.isVerified()
        ));
    }

    @Test
    @DisplayName("WORKFLOW TEST 5: Resubmission blocked if admin configured resubmissionAllowed = false")
    void testResubmissionBlockedWhenDisallowed() {
        recruiter.setVerificationStatus(VerificationStatus.REJECTED);
        recruiter.setResubmissionAllowed(false);

        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));

        VerificationResubmitRequest req = new VerificationResubmitRequest();
        req.setName("New Name");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                recruiterService.resubmitVerification(recruiter.getId(), req)
        );
        assertTrue(ex.getMessage().contains("Resubmission is currently not permitted"));
    }

    @Test
    @DisplayName("WORKFLOW TEST 6: Administrator approves resubmitted recruiter -> status becomes VERIFIED")
    void testAdminApprovesResubmittedRecruiter() {
        recruiter.setVerificationStatus(VerificationStatus.RESUBMITTED);
        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(companyRepository.findByRecruiter(recruiter)).thenReturn(Optional.of(company));

        var approved = adminService.approveRecruiter(recruiter.getId(), "Marcus Vance");

        assertNotNull(approved);
        assertEquals("verified", approved.getVerificationStatus());
        assertTrue(approved.isVerified());
        assertEquals("Marcus Vance", approved.getVerifiedBy());
        assertNull(approved.getRejectionReason());
        verify(companyRepository, times(1)).save(argThat(Company::isVerified));
    }

    @Test
    @DisplayName("WORKFLOW TEST 7: AI improvement suggestions provide safe, structured fallback when AI service is unconfigured")
    void testAiImprovementSuggestionsFallbackSafety() {
        when(userRepository.findById(recruiter.getId())).thenReturn(Optional.of(recruiter));
        when(companyRepository.findByRecruiter(recruiter)).thenReturn(Optional.of(company));

        List<AiSuggestionDTO> suggestions = adminService.generateImprovementSuggestions(
                recruiter.getId(),
                "Business registration could not be verified",
                "Certificate of incorporation details do not match registry."
        );

        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty());
        for (AiSuggestionDTO s : suggestions) {
            assertNotNull(s.getIssue());
            assertNotNull(s.getWhyItMatters());
            assertNotNull(s.getRecommendedAction());
            assertNotNull(s.getRequiredDocumentOrInfo());
            assertNotNull(s.getProfileCorrectionInstructions());
            assertTrue(s.isAdminReviewRequired());
            assertEquals("Action Required", s.getStatus());
        }
    }
}
