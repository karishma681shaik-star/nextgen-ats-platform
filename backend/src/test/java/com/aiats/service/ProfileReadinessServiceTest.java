package com.aiats.service;

import com.aiats.dto.candidate.ProfileReadinessDTO;
import com.aiats.entity.*;
import com.aiats.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfileReadinessServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CandidateProfileRepository profileRepository;
    @Mock private CandidateSkillRepository skillRepository;
    @Mock private EducationRepository educationRepository;
    @Mock private ExperienceRepository experienceRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private CertificationRepository certificationRepository;
    @Mock private ResumeRepository resumeRepository;

    private ProfileReadinessService readinessService;

    private UUID userId;
    private User user;
    private CandidateProfile profile;

    @BeforeEach
    void setUp() {
        readinessService = new ProfileReadinessService(
                userRepository,
                profileRepository,
                skillRepository,
                educationRepository,
                experienceRepository,
                projectRepository,
                certificationRepository,
                resumeRepository
        );

        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setFullName("Karishma Shaik");
        user.setEmail("karishma@example.com");
        user.setPhone("+1-555-0199");

        profile = new CandidateProfile(user);
        profile.setId(UUID.randomUUID());
    }

    private void mockDefaults() {
        when(skillRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(educationRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(experienceRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(projectRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(certificationRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.empty());
        when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());
    }

    @Test
    @DisplayName("CASE 1 — Empty profile: result is 0% when all criteria are incomplete")
    void testEmptyProfileCalculatesZeroPercent() {
        User emptyUser = new User();
        emptyUser.setId(UUID.randomUUID());
        emptyUser.setFullName(""); // empty
        emptyUser.setEmail(""); // invalid

        CandidateProfile emptyProfile = new CandidateProfile(emptyUser);
        emptyProfile.setId(UUID.randomUUID());

        when(skillRepository.findByCandidateProfileId(emptyProfile.getId())).thenReturn(Collections.emptyList());
        when(educationRepository.findByCandidateProfileId(emptyProfile.getId())).thenReturn(Collections.emptyList());
        when(experienceRepository.findByCandidateProfileId(emptyProfile.getId())).thenReturn(Collections.emptyList());
        when(projectRepository.findByCandidateProfileId(emptyProfile.getId())).thenReturn(Collections.emptyList());
        when(certificationRepository.findByCandidateProfileId(emptyProfile.getId())).thenReturn(Collections.emptyList());
        when(resumeRepository.findByUserIdAndPrimaryTrue(emptyUser.getId())).thenReturn(Optional.empty());
        when(resumeRepository.findByUserIdOrderByCreatedAtDesc(emptyUser.getId())).thenReturn(Collections.emptyList());

        ProfileReadinessDTO result = readinessService.calculateReadiness(emptyUser, emptyProfile);

        assertNotNull(result);
        assertEquals(0, result.getCompletionPercentage(), "Empty profile must result in exactly 0%");
        assertEquals(0, result.getCompletedItems());
        assertEquals(8, result.getTotalItems());
        assertEquals(8, result.getMissingItems().size());
        assertEquals("Add Contact Details", result.getNextActionLabel());
        assertEquals("/candidate/profile?action=about", result.getNextActionRoute());
    }

    @Test
    @DisplayName("CASE 2 — Partially completed profile: equals sum of weights for completed criteria")
    void testPartiallyCompletedProfileCalculatesAccurateSum() {
        mockDefaults();
        // Candidate has Contact Info (15) and Headline (10) -> exactly 25%
        profile.setTitle("Senior Full Stack Developer");

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        assertNotNull(result);
        assertEquals(25, result.getCompletionPercentage(), "15 (basic info) + 10 (headline) must equal exactly 25%");
        assertEquals(2, result.getCompletedItems());
        assertEquals(6, result.getMissingItems().size());
        assertTrue(result.getMissingItems().contains("Academic Education"));
        assertTrue(result.getMissingItems().contains("Skills & Competencies"));
        assertTrue(result.getMissingItems().contains("Resume"));
    }

    @Test
    @DisplayName("CASE 3 — Fully completed profile: returns 100% when all criteria are complete")
    void testFullyCompletedProfileReturnsHundredPercent() {
        profile.setTitle("Principal Architect");
        profile.setBio("Experienced architect leading enterprise AI distributed platforms for 10+ years.");
        profile.setLocation("Hyderabad, India");
        profile.setLinkedinUrl("https://linkedin.com/in/karishma");

        CandidateSkill skill = new CandidateSkill(profile, "Spring Boot", SkillType.TECHNICAL);
        when(skillRepository.findByCandidateProfileId(profile.getId())).thenReturn(List.of(skill));

        Education edu = new Education();
        edu.setCandidateProfile(profile);
        edu.setDegree("B.Tech in Computer Science");
        edu.setInstitution("RGUKT");
        when(educationRepository.findByCandidateProfileId(profile.getId())).thenReturn(List.of(edu));

        Experience exp = new Experience();
        exp.setCandidateProfile(profile);
        exp.setRole("Lead Engineer");
        exp.setCompany("NextGen Technologies");
        when(experienceRepository.findByCandidateProfileId(profile.getId())).thenReturn(List.of(exp));

        when(projectRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());
        when(certificationRepository.findByCandidateProfileId(profile.getId())).thenReturn(Collections.emptyList());

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName("Karishma_Principal_Resume.pdf");
        resume.setStatus("parsed");
        resume.setPrimary(true);
        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.of(resume));

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        assertEquals(100, result.getCompletionPercentage(), "Fully completed profile must equal 100%");
        assertEquals(8, result.getCompletedItems());
        assertEquals(0, result.getMissingItems().size());
        assertEquals("View Profile", result.getNextActionLabel());
        assertTrue(result.getGuidance().contains("100% complete"));
    }

    @Test
    @DisplayName("CASE 4 — Missing optional fields: candidate is not penalized")
    void testMissingOptionalFieldsDoesNotBlockBasicInfoCompletion() {
        mockDefaults();
        // Candidate has NO phone, but has location
        user.setPhone(null);
        profile.setLocation("Hyderabad, India");

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        // Basic Info should still be awarded 15% because location is provided as contact channel
        assertEquals(15, result.getCompletionPercentage());
        assertTrue(result.getCriteria().stream().filter(c -> c.getKey().equals("basicInfo")).findFirst().get().isCompleted());
    }

    @Test
    @DisplayName("CASE 5 — Fresh candidate: projects fulfill experience requirement without fake experience")
    void testFresherWithProjectsSatisfiesExperienceRequirement() {
        mockDefaults();
        // Fresher has NO experience records, but has 1 valid academic project
        Project project = new Project();
        project.setCandidateProfile(profile);
        project.setTitle("AI ATS Applicant Tracker");
        project.setDescription("Built a high performance recruitment platform with Spring Boot and React.");

        when(projectRepository.findByCandidateProfileId(profile.getId())).thenReturn(List.of(project));

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        // Basic info (15) + Experience/Projects (15) = 30%
        assertEquals(30, result.getCompletionPercentage());
        assertTrue(result.getCriteria().stream().filter(c -> c.getKey().equals("experienceOrProjects")).findFirst().get().isCompleted(),
                "Fresher with a project must receive full points for experience/projects");
    }

    @Test
    @DisplayName("CASE 6 — Whitespace-only values: do not count as completed")
    void testWhitespaceOnlyValuesDoNotCountAsCompleted() {
        mockDefaults();
        profile.setTitle("   "); // whitespace
        profile.setBio("             "); // whitespace

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        // Only basic info is valid (15%), headline and bio must fail
        assertEquals(15, result.getCompletionPercentage());
        assertFalse(result.getCriteria().stream().filter(c -> c.getKey().equals("headline")).findFirst().get().isCompleted());
        assertFalse(result.getCriteria().stream().filter(c -> c.getKey().equals("summary")).findFirst().get().isCompleted());
    }

    @Test
    @DisplayName("CASE 7 — Failed resume upload: does not count towards resume completion")
    void testFailedResumeUploadDoesNotIncreaseCompletion() {
        mockDefaults();

        Resume failedResume = new Resume();
        failedResume.setUser(user);
        failedResume.setFileName("corrupt_file.pdf");
        failedResume.setStatus("failed");
        failedResume.setPrimary(true);

        when(resumeRepository.findByUserIdAndPrimaryTrue(userId)).thenReturn(Optional.of(failedResume));

        ProfileReadinessDTO result = readinessService.calculateReadiness(user, profile);

        // Resume criterion should not be marked as completed
        assertFalse(result.getCriteria().stream().filter(c -> c.getKey().equals("resume")).findFirst().get().isCompleted(),
                "Failed resume upload must not count as completed");
    }

    @Test
    @DisplayName("CASE 8 — Distinct candidates: calculations are strictly isolated per candidate")
    void testSeparateCandidatesReceiveIndependentCalculations() {
        mockDefaults();

        // Candidate A: 15%
        ProfileReadinessDTO resultA = readinessService.calculateReadiness(user, profile);
        assertEquals(15, resultA.getCompletionPercentage());

        // Candidate B: different user and profile with skills added
        User userB = new User();
        userB.setId(UUID.randomUUID());
        userB.setFullName("Alex Rivera");
        userB.setEmail("alex@example.com");
        userB.setPhone("+1-555-8822");

        CandidateProfile profileB = new CandidateProfile(userB);
        profileB.setId(UUID.randomUUID());
        profileB.setTitle("Senior Full Stack Engineer");

        CandidateSkill skillB = new CandidateSkill(profileB, "React", SkillType.TECHNICAL);
        when(skillRepository.findByCandidateProfileId(profileB.getId())).thenReturn(List.of(skillB));
        when(educationRepository.findByCandidateProfileId(profileB.getId())).thenReturn(Collections.emptyList());
        when(experienceRepository.findByCandidateProfileId(profileB.getId())).thenReturn(Collections.emptyList());
        when(projectRepository.findByCandidateProfileId(profileB.getId())).thenReturn(Collections.emptyList());
        when(certificationRepository.findByCandidateProfileId(profileB.getId())).thenReturn(Collections.emptyList());
        when(resumeRepository.findByUserIdAndPrimaryTrue(userB.getId())).thenReturn(Optional.empty());
        when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userB.getId())).thenReturn(Collections.emptyList());

        ProfileReadinessDTO resultB = readinessService.calculateReadiness(userB, profileB);

        // Candidate B has Basic Info (15) + Headline (10) + Skills (15) = 40%
        assertEquals(40, resultB.getCompletionPercentage());
        // Candidate A remains 15%
        assertEquals(15, resultA.getCompletionPercentage());
    }
}
