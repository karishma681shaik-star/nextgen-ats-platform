package com.aiats.service;

import com.aiats.dto.resume.ResumeAtsAnalysisDTO;
import com.aiats.dto.resume.ResumeRecommendationDTO;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ResumeRecommendationServiceTest {

    @Mock private ResumeRepository resumeRepository;
    @Mock private UserRepository userRepository;
    @Mock private ResumeParserService resumeParserService;
    @Mock private ResumeAnalysisRepository resumeAnalysisRepository;

    private ObjectMapper objectMapper;
    private ResumeService resumeService;
    private UUID userId;
    private UUID otherUserId;
    private UUID resumeId;
    private User user;
    private User otherUser;
    private Resume resume;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        resumeService = new ResumeService(
                resumeRepository,
                userRepository,
                resumeParserService,
                resumeAnalysisRepository,
                objectMapper
        );

        userId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();
        resumeId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("test@candidate.com");

        otherUser = new User();
        otherUser.setId(otherUserId);
        otherUser.setEmail("other@candidate.com");

        resume = new Resume();
        resume.setId(resumeId);
        resume.setUser(user);
        resume.setFileName("Test_Resume.pdf");
        resume.setResumeData("{}");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findById(otherUserId)).thenReturn(Optional.of(otherUser));
        when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(resume));
        when(resumeAnalysisRepository.findByResumeId(resumeId)).thenReturn(Optional.empty());
        when(resumeAnalysisRepository.save(any(ResumeAnalysis.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("Scenario 1: Blank resume should place missing sections into PENDING with accurate counts")
    void testBlankResumeRecommendationsPending() {
        resume.setResumeData("{}");

        ResumeAtsAnalysisDTO analysis = resumeService.getAtsAnalysis(userId, resumeId);

        assertNotNull(analysis);
        assertTrue(analysis.getPendingCount() > 0, "Pending count should be greater than 0");
        assertEquals(0, analysis.getCompletedCount(), "Completed count should be 0 on blank resume");
        assertEquals(0, analysis.getDeletedCount(), "Deleted count should be 0 initially");
        assertEquals(analysis.getTotalCount(), analysis.getPendingCount() + analysis.getCompletedCount() + analysis.getDeletedCount());

        // Check that missing skills, experience, education are in pending
        boolean hasPendingSkills = analysis.getPending().stream()
                .anyMatch(r -> r.getId().equals("section-skills"));
        boolean hasPendingExp = analysis.getPending().stream()
                .anyMatch(r -> r.getId().equals("section-work-projects") || r.getId().equals("section-practical-exp"));
        boolean hasPendingEdu = analysis.getPending().stream()
                .anyMatch(r -> r.getId().equals("section-education"));

        assertTrue(hasPendingSkills, "Skills recommendation must be PENDING");
        assertTrue(hasPendingExp, "Experience/Projects recommendation must be PENDING");
        assertTrue(hasPendingEdu, "Education recommendation must be PENDING");
    }

    @Test
    @DisplayName("Scenario 2: Adding valid skills moves skills recommendation to COMPLETED")
    void testAddingValidSkillsMovesToCompleted() {
        // Resume with valid skills
        String resumeDataWithSkills = "{\"skills\":[\"Java\",\"Spring Boot\",\"PostgreSQL\",\"Docker\",\"React\"]}";
        resume.setResumeData(resumeDataWithSkills);

        ResumeAtsAnalysisDTO analysis = resumeService.getAtsAnalysis(userId, resumeId);

        assertNotNull(analysis);
        boolean skillsInCompleted = analysis.getCompleted().stream()
                .anyMatch(r -> r.getId().equals("section-skills"));
        assertTrue(skillsInCompleted, "Skills recommendation should be COMPLETED when valid skills are present");

        ResumeRecommendationDTO skillsRec = analysis.getCompleted().stream()
                .filter(r -> r.getId().equals("section-skills"))
                .findFirst().orElseThrow();
        assertEquals("COMPLETED", skillsRec.getStatus());
        assertTrue(skillsRec.isPassing(), "Recommendation must have passing=true");
        assertNotNull(skillsRec.getCompletedDescription());
    }

    @Test
    @DisplayName("Scenario 3: Adding only placeholder or empty skills keeps recommendation in PENDING")
    void testAddingPlaceholderSkillsStaysPending() {
        String resumeDataWithPlaceholders = "{\"skills\":[\"   \", \"[Skill Name]\", \"<Insert Skill>\", \"Skill Here\"]}";
        resume.setResumeData(resumeDataWithPlaceholders);

        ResumeAtsAnalysisDTO analysis = resumeService.getAtsAnalysis(userId, resumeId);

        assertNotNull(analysis);
        boolean skillsInPending = analysis.getPending().stream()
                .anyMatch(r -> r.getId().equals("section-skills"));
        assertTrue(skillsInPending, "Placeholder skills should not count and remain in PENDING");
    }

    @Test
    @DisplayName("Scenario 4: Removing all skills moves recommendation back to PENDING")
    void testRemovingSkillsMovesBackToPending() {
        // First with skills
        resume.setResumeData("{\"skills\":[\"Java\",\"Spring Boot\"]}");
        ResumeAtsAnalysisDTO initial = resumeService.getAtsAnalysis(userId, resumeId);
        assertTrue(initial.getCompleted().stream().anyMatch(r -> r.getId().equals("section-skills")));

        // Then removed
        resume.setResumeData("{\"skills\":[]}");
        ResumeAtsAnalysisDTO afterRemoval = resumeService.getAtsAnalysis(userId, resumeId);
        assertTrue(afterRemoval.getPending().stream().anyMatch(r -> r.getId().equals("section-skills")),
                "Removing skills must move recommendation back to PENDING");
    }

    @Test
    @DisplayName("Scenario 5: Dismissing recommendation moves to DELETED without touching resume data")
    void testDismissRecommendation() {
        resume.setResumeData("{\"skills\":[\"Java\"]}");
        String originalResumeData = resume.getResumeData();

        ResumeAtsAnalysisDTO analysis = resumeService.dismissRecommendation(userId, resumeId, "section-education");

        // Verify education is in DELETED
        boolean eduInDeleted = analysis.getDeleted().stream()
                .anyMatch(r -> r.getId().equals("section-education"));
        assertTrue(eduInDeleted, "Dismissed recommendation should be in DELETED");

        // Verify resume data was untouched
        assertEquals(originalResumeData, resume.getResumeData(), "Dismissing recommendation must never touch resume content");

        // Total count invariant
        assertEquals(analysis.getTotalCount(), analysis.getPendingCount() + analysis.getCompletedCount() + analysis.getDeletedCount());
    }

    @Test
    @DisplayName("Scenario 6: Restoring recommendation moves it back to PENDING or COMPLETED")
    void testRestoreRecommendation() {
        // Dismiss first
        resumeService.dismissRecommendation(userId, resumeId, "section-education");

        // Restore
        ResumeAtsAnalysisDTO restored = resumeService.restoreRecommendation(userId, resumeId, "section-education");

        boolean eduInDeleted = restored.getDeleted().stream()
                .anyMatch(r -> r.getId().equals("section-education"));
        assertFalse(eduInDeleted, "Restored recommendation should no longer be in DELETED");

        boolean eduInPending = restored.getPending().stream()
                .anyMatch(r -> r.getId().equals("section-education"));
        assertTrue(eduInPending, "Missing education without content should restore to PENDING");
    }

    @Test
    @DisplayName("Scenario 7: Unauthorized candidate cannot access or dismiss another candidate's recommendations")
    void testCandidateAuthorizationEnforced() {
        assertThrows(BadRequestException.class, () -> {
            resumeService.getAtsAnalysis(otherUserId, resumeId);
        }, "Accessing another candidate's resume recommendations must throw BadRequestException");

        assertThrows(BadRequestException.class, () -> {
            resumeService.dismissRecommendation(otherUserId, resumeId, "section-skills");
        }, "Dismissing another candidate's resume recommendations must throw BadRequestException");
    }
}
