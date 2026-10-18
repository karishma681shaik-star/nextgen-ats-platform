package com.aiats.service;

import com.aiats.dto.candidate.CandidateDashboardDTO;
import com.aiats.entity.*;
import com.aiats.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateServiceDashboardTest {

    @Mock private CandidateProfileRepository profileRepository;
    @Mock private CandidateSkillRepository skillRepository;
    @Mock private EducationRepository educationRepository;
    @Mock private ExperienceRepository experienceRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private CertificationRepository certificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private ResumeAnalysisRepository resumeAnalysisRepository;
    @Mock private ResumeService resumeService;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private ApplicationService applicationService;
    @Mock private JobRepository jobRepository;
    @Mock private JobService jobService;
    @Mock private SavedJobRepository savedJobRepository;

    private CandidateService candidateService;

    private UUID userId;
    private User user;
    private CandidateProfile profile;

    @BeforeEach
    void setUp() {
        candidateService = new CandidateService(
                profileRepository,
                skillRepository,
                educationRepository,
                experienceRepository,
                projectRepository,
                certificationRepository,
                userRepository,
                resumeRepository,
                resumeAnalysisRepository,
                resumeService,
                applicationRepository,
                applicationService,
                jobRepository,
                jobService,
                savedJobRepository
        );

        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setFullName("Karishma Shaik");
        user.setEmail("karishma@example.com");
        user.setRole(Role.CANDIDATE);
        user.setPhone("+1234567890");

        profile = new CandidateProfile();
        profile.setId(UUID.randomUUID());
        profile.setUser(user);
        profile.setTitle("Senior Full Stack Engineer");
        profile.setBio("Passionate developer building scalable systems.");
        profile.setProfileCompletion(75);
    }

    private void mockCommonProfileData() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(skillRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(experienceRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(educationRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(certificationRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(projectRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());

        when(applicationRepository.countByCandidateId(userId)).thenReturn(0L);
        when(applicationRepository.countByCandidateIdAndStatus(eq(userId), any())).thenReturn(0L);
        when(savedJobRepository.countByCandidateId(userId)).thenReturn(0L);
        when(applicationRepository.findByCandidateIdOrderByAppliedDateDesc(userId)).thenReturn(Collections.emptyList());
        when(jobRepository.findByStatus(JobStatus.ACTIVE)).thenReturn(Collections.emptyList());
    }

    @Test
    @DisplayName("TEST 1: Newly registered candidate with no resume has atsScore=null and atsStatus=NO_RESUME")
    void testCandidateWithNoResumeHasNoAtsScore() {
        mockCommonProfileData();
        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.empty());
        when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());

        CandidateDashboardDTO dto = candidateService.getCandidateDashboard(userId);

        assertNotNull(dto);
        assertEquals("Karishma Shaik", dto.getCandidateName());
        assertFalse(dto.isHasPrimaryResume(), "Should not report primary resume");
        assertEquals("NO_RESUME", dto.getAtsStatus(), "atsStatus must be NO_RESUME");
        assertNull(dto.getAtsScore(), "atsScore MUST be null when candidate has no resume");
        assertNull(dto.getAtsTier(), "atsTier must be null");
        assertNull(dto.getAtsSummary(), "atsSummary must be null");
        // Profile completion remains independent (e.g. 75%), NEVER copied to atsScore!
        assertTrue(dto.getProfileCompletion() > 0, "Profile completion should be calculated independently");
        assertNotEquals(dto.getProfileCompletion(), dto.getAtsScore(), "Profile completion must NOT be labeled as ATS score");
    }

    @Test
    @DisplayName("TEST 2: Candidate with uploaded resume in processing status has atsScore=null and atsStatus=PROCESSING")
    void testCandidateWithProcessingResumeHasNoScore() {
        mockCommonProfileData();

        Resume resume = new Resume();
        resume.setId(UUID.randomUUID());
        resume.setUser(user);
        resume.setFileName("Karishma_Resume.pdf");
        resume.setStatus("processing");
        resume.setPrimary(true);

        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.of(resume));

        CandidateDashboardDTO dto = candidateService.getCandidateDashboard(userId);

        assertNotNull(dto);
        assertTrue(dto.isHasPrimaryResume());
        assertEquals("PROCESSING", dto.getAtsStatus());
        assertNull(dto.getAtsScore(), "Score must not be invented while processing");
        assertEquals("Analyzing your resume...", dto.getAtsSummary());
    }

    @Test
    @DisplayName("TEST 3: Candidate with analyzed resume receives genuine persisted score and atsStatus=ATS_SCORE_AVAILABLE")
    void testCandidateWithAnalyzedResumeReceivesActualScore() {
        mockCommonProfileData();

        Resume resume = new Resume();
        resume.setId(UUID.randomUUID());
        resume.setUser(user);
        resume.setFileName("Karishma_Resume.pdf");
        resume.setStatus("parsed");
        resume.setPrimary(true);

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setId(UUID.randomUUID());
        analysis.setResume(resume);
        analysis.setOverallScore(84); // Genuine 84/100 score

        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.of(resume));
        when(resumeAnalysisRepository.findByResume(resume)).thenReturn(Optional.of(analysis));

        CandidateDashboardDTO dto = candidateService.getCandidateDashboard(userId);

        assertNotNull(dto);
        assertTrue(dto.isHasPrimaryResume());
        assertEquals("ATS_SCORE_AVAILABLE", dto.getAtsStatus());
        assertEquals(84, dto.getAtsScore(), "Must return genuine overallScore from analysis");
        assertEquals("Excellent", dto.getAtsTier());
        assertNotNull(dto.getAtsSummary());
    }
}
