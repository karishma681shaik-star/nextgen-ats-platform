package com.aiats.service;

import com.aiats.dto.candidate.ProfileReadinessCriterionDTO;
import com.aiats.dto.candidate.ProfileReadinessDTO;
import com.aiats.entity.*;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProfileReadinessService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileReadinessService.class);

    private final UserRepository userRepository;
    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository skillRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final ResumeRepository resumeRepository;

    public ProfileReadinessService(
            UserRepository userRepository,
            CandidateProfileRepository profileRepository,
            CandidateSkillRepository skillRepository,
            EducationRepository educationRepository,
            ExperienceRepository experienceRepository,
            ProjectRepository projectRepository,
            CertificationRepository certificationRepository,
            ResumeRepository resumeRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.resumeRepository = resumeRepository;
    }

    @Transactional
    public ProfileReadinessDTO calculateReadiness(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(user);
                    return profileRepository.save(newProfile);
                });

        return calculateReadiness(user, profile);
    }

    @Transactional
    public ProfileReadinessDTO calculateReadiness(User user, CandidateProfile profile) {
        UUID profileId = profile.getId();
        UUID userId = user.getId();

        // Retrieve persisted related records safely
        List<CandidateSkill> skills = profileId != null
                ? skillRepository.findByCandidateProfileId(profileId)
                : Collections.emptyList();
        List<Education> edus = profileId != null
                ? educationRepository.findByCandidateProfileId(profileId)
                : Collections.emptyList();
        List<Experience> exps = profileId != null
                ? experienceRepository.findByCandidateProfileId(profileId)
                : Collections.emptyList();
        List<Project> projs = profileId != null
                ? projectRepository.findByCandidateProfileId(profileId)
                : Collections.emptyList();
        List<Certification> certs = profileId != null
                ? certificationRepository.findByCandidateProfileId(profileId)
                : Collections.emptyList();

        Optional<Resume> primaryResumeOpt = resumeRepository.findByUserIdAndPrimaryTrue(userId);
        if (primaryResumeOpt.isEmpty()) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!userResumes.isEmpty()) {
                primaryResumeOpt = Optional.of(userResumes.get(0));
            }
        }

        // 1. Basic Info (15%): Name >= 2 chars, valid email, and contact info (phone or location)
        boolean hasName = user.getFullName() != null && user.getFullName().trim().length() >= 2;
        boolean hasEmail = user.getEmail() != null && user.getEmail().trim().contains("@");
        boolean hasContact = (user.getPhone() != null && !user.getPhone().trim().isBlank())
                || (profile.getLocation() != null && !profile.getLocation().trim().isBlank());
        boolean basicInfoCompleted = hasName && hasEmail && hasContact;

        // 2. Professional Headline (10%): Title >= 3 chars
        boolean headlineCompleted = profile.getTitle() != null && profile.getTitle().trim().length() >= 3;

        // 3. Career Summary / Bio (10%): Bio >= 15 chars
        boolean summaryCompleted = profile.getBio() != null && profile.getBio().trim().length() >= 15;

        // 4. Education (15%): At least 1 valid entry with degree & institution
        boolean educationCompleted = edus.stream().anyMatch(e ->
                e.getDegree() != null && !e.getDegree().trim().isBlank() &&
                e.getInstitution() != null && !e.getInstitution().trim().isBlank());

        // 5. Skills (15%): At least 1 valid skill
        boolean skillsCompleted = skills.stream().anyMatch(s ->
                s.getName() != null && !s.getName().trim().isBlank());

        // 6. Experience or Projects (15%):
        // Fair to freshers: A candidate can satisfy this via professional experience OR academic/personal projects!
        boolean hasValidExp = exps.stream().anyMatch(e ->
                e.getRole() != null && !e.getRole().trim().isBlank() &&
                e.getCompany() != null && !e.getCompany().trim().isBlank());
        boolean hasValidProj = projs.stream().anyMatch(p ->
                p.getTitle() != null && !p.getTitle().trim().isBlank());
        boolean experienceCompleted = hasValidExp || hasValidProj;

        // 7. Resume (15%): Valid uploaded resume that is not in failed state
        boolean resumeCompleted = primaryResumeOpt.isPresent()
                && primaryResumeOpt.get().getFileName() != null
                && !primaryResumeOpt.get().getFileName().trim().isBlank()
                && !"failed".equalsIgnoreCase(primaryResumeOpt.get().getStatus());

        // 8. Portfolio Links or Certifications (5%):
        boolean hasLinks = (profile.getLinkedinUrl() != null && !profile.getLinkedinUrl().trim().isBlank())
                || (profile.getGithubUrl() != null && !profile.getGithubUrl().trim().isBlank())
                || (profile.getWebsiteUrl() != null && !profile.getWebsiteUrl().trim().isBlank());
        boolean hasValidCert = certs.stream().anyMatch(c ->
                c.getTitle() != null && !c.getTitle().trim().isBlank());
        boolean linksCompleted = hasLinks || hasValidCert;

        // Assemble criteria list (Sum of weights: 15 + 10 + 10 + 15 + 15 + 15 + 15 + 5 = 100)
        List<ProfileReadinessCriterionDTO> criteria = new ArrayList<>();
        criteria.add(new ProfileReadinessCriterionDTO(
                "basicInfo",
                "Contact & Personal Information",
                15,
                basicInfoCompleted,
                "Add your full name, email, and phone number or location.",
                "/candidate/profile?action=about",
                "Add Contact Details"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "headline",
                "Professional Headline",
                10,
                headlineCompleted,
                "Add a descriptive role headline (e.g. 'Full Stack Java Engineer').",
                "/candidate/profile?action=about",
                "Add Headline"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "summary",
                "Career Summary",
                10,
                summaryCompleted,
                "Write a short professional summary or career objective.",
                "/candidate/profile?action=about",
                "Add Career Summary"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "education",
                "Academic Education",
                15,
                educationCompleted,
                "List at least one degree, institution, or academic background.",
                "/candidate/profile?action=education",
                "Add Education"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "skills",
                "Skills & Competencies",
                15,
                skillsCompleted,
                "Add your core technical or soft skills.",
                "/candidate/profile?action=skills",
                "Add Skills"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "experienceOrProjects",
                "Work Experience or Projects",
                15,
                experienceCompleted,
                "Add work experience, or key projects if you are a fresher.",
                "/candidate/profile?action=experience",
                "Add Experience"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "resume",
                "Resume",
                15,
                resumeCompleted,
                "Upload or build a primary resume for recruiter screening.",
                "/candidate/resumes",
                "Upload Resume"
        ));
        criteria.add(new ProfileReadinessCriterionDTO(
                "linksOrCerts",
                "Portfolio Links & Certifications",
                5,
                linksCompleted,
                "Link your LinkedIn, GitHub, website, or add a certification.",
                "/candidate/profile?action=about",
                "Add Links"
        ));

        // Calculate total score
        int totalScore = 0;
        int completedCount = 0;
        List<String> missingItems = new ArrayList<>();
        ProfileReadinessCriterionDTO firstIncomplete = null;

        for (ProfileReadinessCriterionDTO c : criteria) {
            if (c.isCompleted()) {
                totalScore += c.getWeight();
                completedCount++;
            } else {
                missingItems.add(c.getLabel());
                if (firstIncomplete == null) {
                    firstIncomplete = c;
                }
            }
        }

        totalScore = Math.max(0, Math.min(100, totalScore));

        ProfileReadinessDTO dto = new ProfileReadinessDTO();
        dto.setCompletionPercentage(totalScore);
        dto.setCompletedItems(completedCount);
        dto.setTotalItems(criteria.size());
        dto.setMissingItems(missingItems);
        dto.setCriteria(criteria);

        if (firstIncomplete != null) {
            dto.setNextActionLabel(firstIncomplete.getActionLabel());
            dto.setNextActionRoute(firstIncomplete.getActionRoute());
            dto.setGuidance("Complete your " + firstIncomplete.getLabel().toLowerCase()
                    + " to boost your profile readiness to " + (totalScore + firstIncomplete.getWeight()) + "%.");
        } else {
            dto.setNextActionLabel("View Profile");
            dto.setNextActionRoute("/candidate/profile");
            dto.setGuidance("Outstanding! Your profile is 100% complete and fully optimized for recruiter visibility.");
        }

        // Synchronize with database if value changed
        if (profile.getProfileCompletion() != totalScore) {
            profile.setProfileCompletion(totalScore);
            profileRepository.save(profile);
            logger.info("Recalculated profile readiness for candidate {}: {}%", userId, totalScore);
        }

        return dto;
    }
}
