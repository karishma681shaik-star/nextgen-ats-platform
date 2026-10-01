package com.aiats.service;

import com.aiats.entity.*;
import com.aiats.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Builds a compact, role-aware context string from the database
 * to feed into the AI prompt alongside the user's question.
 *
 * Design rules:
 * - Only load aggregate counts and short summaries, never full records.
 * - Never include passwords, JWT secrets, API keys, or sensitive internal data.
 * - Cap context to ~600 tokens to stay within AI prompt budget.
 */
@Service
public class CopilotContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(CopilotContextBuilder.class);

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public CopilotContextBuilder(UserRepository userRepository,
                                  ResumeRepository resumeRepository,
                                  ResumeAnalysisRepository resumeAnalysisRepository,
                                  ApplicationRepository applicationRepository,
                                  SavedJobRepository savedJobRepository,
                                  CandidateProfileRepository candidateProfileRepository,
                                  CandidateSkillRepository candidateSkillRepository,
                                  ExperienceRepository experienceRepository,
                                  EducationRepository educationRepository,
                                  ProjectRepository projectRepository,
                                  CertificationRepository certificationRepository,
                                  JobRepository jobRepository,
                                  CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.applicationRepository = applicationRepository;
        this.savedJobRepository = savedJobRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.experienceRepository = experienceRepository;
        this.educationRepository = educationRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
    }

    /**
     * Build context string based on the user's role.
     */
    @Transactional(readOnly = true)
    public String buildContext(UUID userId, Role role) {
        return buildContext(userId, role, Collections.emptyMap());
    }

    /**
     * Build context string based on the user's role and frontend context (e.g. resumeId, jobId).
     */
    @Transactional(readOnly = true)
    public String buildContext(UUID userId, Role role, Map<String, String> frontendContext) {
        log.debug("Building copilot context for userId={} role={} frontendContext={}", userId, role, frontendContext);

        return switch (role) {
            case CANDIDATE -> buildCandidateContext(userId, frontendContext);
            case RECRUITER -> buildRecruiterContext(userId);
            case ADMIN -> buildAdminContext();
        };
    }

    private String buildCandidateContext(UUID userId, Map<String, String> frontendContext) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("=== CANDIDATE PROFILE & RESUME DATA ===\n");

        // 1. User basics
        userRepository.findById(userId).ifPresent(u -> {
            ctx.append("Candidate Name: ").append(u.getFullName()).append("\n");
            ctx.append("Email: ").append(u.getEmail()).append("\n");
            if (u.getTitle() != null && !u.getTitle().isBlank()) ctx.append("Professional Title: ").append(u.getTitle()).append("\n");
        });

        // 2. Profile completion & bio
        Optional<CandidateProfile> profileOpt = candidateProfileRepository.findByUserId(userId);
        profileOpt.ifPresent(p -> {
            ctx.append("Profile Completion: ").append(p.getProfileCompletion()).append("%\n");
            if (p.getLocation() != null && !p.getLocation().isBlank()) ctx.append("Location: ").append(p.getLocation()).append("\n");
            if (p.getBio() != null && !p.getBio().isBlank()) ctx.append("Summary/Bio: ").append(truncate(p.getBio(), 250)).append("\n");
        });

        // 3. Locate the Active Resume (from frontendContext resumeId or primary / most recent)
        Resume activeResume = null;
        if (frontendContext != null && frontendContext.containsKey("resumeId")) {
            String resIdStr = frontendContext.get("resumeId");
            if (resIdStr != null && !resIdStr.isBlank()) {
                try {
                    activeResume = resumeRepository.findById(UUID.fromString(resIdStr)).orElse(null);
                } catch (Exception ignored) {}
            }
        }

        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (activeResume == null && !userResumes.isEmpty()) {
            activeResume = userResumes.stream().filter(Resume::isPrimary).findFirst().orElse(userResumes.get(0));
        }

        // 4. Extract rich details from Active Resume
        if (activeResume != null) {
            ctx.append("\n--- ACTIVE RESUME DETAILS ---\n");
            ctx.append("Resume File: ").append(activeResume.getFileName()).append(" (Status: ").append(activeResume.getStatus()).append(")\n");

            boolean extractedFromJson = false;
            if (activeResume.getResumeData() != null && !activeResume.getResumeData().isBlank()) {
                try {
                    com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(activeResume.getResumeData());
                    if (rootNode != null && rootNode.isObject()) {
                        extractedFromJson = true;

                        // Headline & Summary
                        String resHeadline = rootNode.path("headline").asText("");
                        if (resHeadline.isBlank()) resHeadline = rootNode.path("title").asText("");
                        if (!resHeadline.isBlank()) ctx.append("Headline: ").append(resHeadline).append("\n");

                        String resSummary = rootNode.path("summary").asText("");
                        if (!resSummary.isBlank()) ctx.append("Resume Summary: ").append(truncate(resSummary, 300)).append("\n");

                        // Skills
                        com.fasterxml.jackson.databind.JsonNode skillsNode = rootNode.path("skills");
                        if (skillsNode.isObject()) {
                            StringBuilder sbSkills = new StringBuilder();
                            appendIfPresent(sbSkills, "Programming Languages", skillsNode.path("programmingLanguages").asText(""));
                            appendIfPresent(sbSkills, "Frameworks & Libraries", skillsNode.path("frameworksLibraries").asText(""));
                            appendIfPresent(sbSkills, "Tools & Platforms", skillsNode.path("toolsPlatforms").asText(""));
                            appendIfPresent(sbSkills, "Databases", skillsNode.path("databases").asText(""));
                            appendIfPresent(sbSkills, "Soft Skills", skillsNode.path("softSkills").asText(""));
                            if (sbSkills.length() > 0) {
                                ctx.append("Technical & Domain Skills:\n").append(sbSkills);
                            }
                        }

                        // Work Experience
                        com.fasterxml.jackson.databind.JsonNode expArray = rootNode.path("experience");
                        if (expArray.isArray() && !expArray.isEmpty()) {
                            ctx.append("Work Experience:\n");
                            for (com.fasterxml.jackson.databind.JsonNode exp : expArray) {
                                String role = exp.path("role").asText(exp.path("jobTitle").asText(""));
                                String comp = exp.path("company").asText("");
                                String start = exp.path("startDate").asText("");
                                String end = exp.path("endDate").asText(exp.path("current").asBoolean() ? "Present" : "");
                                String desc = exp.path("description").asText("");
                                String tech = exp.path("technologies").asText("");

                                ctx.append("• ").append(role);
                                if (!comp.isBlank()) ctx.append(" at ").append(comp);
                                if (!start.isBlank() || !end.isBlank()) ctx.append(" (").append(start).append(" - ").append(end).append(")");
                                if (!desc.isBlank()) ctx.append(": ").append(truncate(desc.replace("\n", " "), 180));
                                if (!tech.isBlank()) ctx.append(" [Tech: ").append(truncate(tech, 100)).append("]");
                                ctx.append("\n");
                            }
                        }

                        // Projects
                        com.fasterxml.jackson.databind.JsonNode projArray = rootNode.path("projects");
                        if (projArray.isArray() && !projArray.isEmpty()) {
                            ctx.append("Key Projects:\n");
                            for (com.fasterxml.jackson.databind.JsonNode proj : projArray) {
                                String title = proj.path("title").asText(proj.path("name").asText(""));
                                String role = proj.path("role").asText("");
                                String desc = proj.path("description").asText("");
                                String tech = proj.path("technologies").asText("");

                                ctx.append("• ").append(title);
                                if (!role.isBlank()) ctx.append(" (").append(role).append(")");
                                if (!desc.isBlank()) ctx.append(": ").append(truncate(desc.replace("\n", " "), 180));
                                if (!tech.isBlank()) ctx.append(" [Technologies: ").append(truncate(tech, 100)).append("]");
                                ctx.append("\n");
                            }
                        }

                        // Education
                        com.fasterxml.jackson.databind.JsonNode eduArray = rootNode.path("education");
                        if (eduArray.isArray() && !eduArray.isEmpty()) {
                            ctx.append("Education:\n");
                            for (com.fasterxml.jackson.databind.JsonNode edu : eduArray) {
                                String deg = edu.path("degree").asText("");
                                String inst = edu.path("institution").asText("");
                                String field = edu.path("fieldOfStudy").asText("");
                                String cgpa = edu.path("cgpa").asText("");

                                ctx.append("• ").append(deg);
                                if (!field.isBlank()) ctx.append(" in ").append(field);
                                if (!inst.isBlank()) ctx.append(", ").append(inst);
                                if (!cgpa.isBlank()) ctx.append(" (CGPA: ").append(cgpa).append(")");
                                ctx.append("\n");
                            }
                        }

                        // Certifications
                        com.fasterxml.jackson.databind.JsonNode certArray = rootNode.path("certifications");
                        if (certArray.isArray() && !certArray.isEmpty()) {
                            ctx.append("Certifications: ");
                            List<String> certNames = new ArrayList<>();
                            for (com.fasterxml.jackson.databind.JsonNode cert : certArray) {
                                String ct = cert.path("title").asText("");
                                String ci = cert.path("issuer").asText("");
                                if (!ct.isBlank()) {
                                    certNames.add(!ci.isBlank() ? ct + " (" + ci + ")" : ct);
                                }
                            }
                            ctx.append(String.join(", ", certNames)).append("\n");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not parse resume JSON: {}", e.getMessage());
                }
            }

            // Fallback to extracted columns if JSON was incomplete
            if (!extractedFromJson || (activeResume.getExtractedExperience() != null && !ctx.toString().contains("Work Experience:"))) {
                if (activeResume.getExtractedSkills() != null && !activeResume.getExtractedSkills().isBlank()) {
                    ctx.append("Extracted Skills: ").append(truncate(activeResume.getExtractedSkills(), 250)).append("\n");
                }
                if (activeResume.getExtractedExperience() != null && !activeResume.getExtractedExperience().isBlank()) {
                    ctx.append("Extracted Experience: ").append(truncate(activeResume.getExtractedExperience().replace("||", "; "), 350)).append("\n");
                }
                if (activeResume.getExtractedProjects() != null && !activeResume.getExtractedProjects().isBlank()) {
                    ctx.append("Extracted Projects: ").append(truncate(activeResume.getExtractedProjects().replace("||", "; "), 350)).append("\n");
                }
                if (activeResume.getExtractedEducation() != null && !activeResume.getExtractedEducation().isBlank()) {
                    ctx.append("Extracted Education: ").append(truncate(activeResume.getExtractedEducation().replace("||", "; "), 250)).append("\n");
                }
                if (activeResume.getExtractedCertifications() != null && !activeResume.getExtractedCertifications().isBlank()) {
                    ctx.append("Extracted Certifications: ").append(truncate(activeResume.getExtractedCertifications().replace("||", ", "), 200)).append("\n");
                }
            }
        }

        // 5. Fallback/Augment with Candidate Profile Database Tables
        profileOpt.ifPresent(p -> {
            List<CandidateSkill> skills = candidateSkillRepository.findByCandidateProfileId(p.getId());
            if (!skills.isEmpty() && !ctx.toString().contains("Technical & Domain Skills:")) {
                String skillNames = skills.stream().map(CandidateSkill::getName).limit(15).collect(Collectors.joining(", "));
                ctx.append("Profile Skills: ").append(skillNames).append("\n");
            }

            List<Experience> dbExps = experienceRepository.findByCandidateProfileId(p.getId());
            if (!dbExps.isEmpty() && !ctx.toString().contains("Work Experience:")) {
                ctx.append("Profile Experience:\n");
                for (Experience e : dbExps) {
                    ctx.append("• ").append(e.getRole()).append(" at ").append(e.getCompany());
                    if (e.getDescription() != null) ctx.append(": ").append(truncate(e.getDescription(), 150));
                    ctx.append("\n");
                }
            }

            List<Project> dbProjs = projectRepository.findByCandidateProfileId(p.getId());
            if (!dbProjs.isEmpty() && !ctx.toString().contains("Key Projects:")) {
                ctx.append("Profile Projects:\n");
                for (Project pr : dbProjs) {
                    ctx.append("• ").append(pr.getTitle());
                    if (pr.getDescription() != null) ctx.append(": ").append(truncate(pr.getDescription(), 150));
                    ctx.append("\n");
                }
            }
        });

        // 6. Target Job Details (if job optimization or application context)
        if (frontendContext != null && frontendContext.containsKey("jobId")) {
            String jobIdStr = frontendContext.get("jobId");
            if (jobIdStr != null && !jobIdStr.isBlank()) {
                try {
                    UUID targetJobId = UUID.fromString(jobIdStr);
                    jobRepository.findById(targetJobId).ifPresent(targetJob -> {
                        ctx.append("\n--- TARGET JOB SPECIFICATION ---\n");
                        ctx.append("Target Role: ").append(targetJob.getTitle()).append("\n");
                        if (targetJob.getCompany() != null) ctx.append("Target Company: ").append(targetJob.getCompany().getName()).append("\n");
                        if (targetJob.getDepartment() != null) ctx.append("Department: ").append(targetJob.getDepartment()).append("\n");
                        if (targetJob.getExperienceLevel() != null) ctx.append("Experience Level: ").append(targetJob.getExperienceLevel()).append("\n");
                        if (targetJob.getSkills() != null && !targetJob.getSkills().isBlank()) {
                            ctx.append("Required Skills: ").append(targetJob.getSkills()).append("\n");
                        }
                        if (targetJob.getDescription() != null && !targetJob.getDescription().isBlank()) {
                            ctx.append("Job Description Excerpt: ").append(truncate(targetJob.getDescription().replace("\n", " "), 250)).append("\n");
                        }
                    });
                } catch (Exception ignored) {}
            }
        }

        // 7. Latest ATS Analysis
        Optional<ResumeAnalysis> latestAnalysis = (activeResume != null)
                ? resumeAnalysisRepository.findByResumeId(activeResume.getId())
                : resumeAnalysisRepository.findTopByResumeUserIdOrderByLastAnalyzedDesc(userId);

        latestAnalysis.ifPresent(a -> {
            ctx.append("\n--- ATS SCORE & ANALYSIS ---\n");
            ctx.append("Overall ATS Score: ").append(a.getOverallScore()).append("/100\n");
            ctx.append("Breakdown - Technical: ").append(a.getTechnicalScore())
               .append(", Keywords: ").append(a.getKeywordScore())
               .append(", Skills: ").append(a.getSkillsScore())
               .append(", Experience: ").append(a.getExperienceScore())
               .append(", Education: ").append(a.getEducationScore())
               .append(", Formatting: ").append(a.getFormattingScore()).append("\n");
            if (a.getMissingKeywords() != null && !a.getMissingKeywords().isBlank())
                ctx.append("Missing Keywords: ").append(truncate(a.getMissingKeywords(), 200)).append("\n");
            if (a.getMissingSkills() != null && !a.getMissingSkills().isBlank())
                ctx.append("Missing Skills: ").append(truncate(a.getMissingSkills(), 200)).append("\n");
            if (a.getStrengths() != null && !a.getStrengths().isBlank())
                ctx.append("Strengths: ").append(truncate(a.getStrengths(), 200)).append("\n");
            if (a.getWeaknesses() != null && !a.getWeaknesses().isBlank())
                ctx.append("Weaknesses: ").append(truncate(a.getWeaknesses(), 200)).append("\n");
            if (a.getRecommendations() != null && !a.getRecommendations().isBlank())
                ctx.append("Recommendations: ").append(truncate(a.getRecommendations(), 200)).append("\n");
        });

        // 8. Applications & Saved Jobs
        List<Application> apps = applicationRepository.findByCandidateIdOrderByAppliedDateDesc(userId);
        ctx.append("\n--- PLATFORM METRICS ---\n");
        ctx.append("Total Applications: ").append(apps.size()).append("\n");
        List<SavedJob> savedJobs = savedJobRepository.findByCandidateIdOrderBySavedAtDesc(userId);
        ctx.append("Saved Jobs: ").append(savedJobs.size()).append("\n");

        return ctx.toString();
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append("  - ").append(label).append(": ").append(value).append("\n");
        }
    }

    private String buildRecruiterContext(UUID recruiterId) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("=== RECRUITER DASHBOARD SNAPSHOT ===\n");

        // User basics
        userRepository.findById(recruiterId).ifPresent(u -> {
            ctx.append("Name: ").append(u.getFullName()).append("\n");
            if (u.getCompanyName() != null) ctx.append("Company: ").append(u.getCompanyName()).append("\n");
        });

        // Company
        companyRepository.findByRecruiterId(recruiterId).ifPresent(c -> {
            ctx.append("Company Name: ").append(c.getName()).append("\n");
            if (c.getIndustry() != null) ctx.append("Industry: ").append(c.getIndustry()).append("\n");
            if (c.getSize() != null) ctx.append("Company Size: ").append(c.getSize()).append("\n");
        });

        // Jobs
        List<Job> recruiterJobs = jobRepository.findByRecruiterId(recruiterId);
        long activeJobs = recruiterJobs.stream().filter(j -> j.getStatus() == JobStatus.ACTIVE).count();
        ctx.append("Total Jobs Posted: ").append(recruiterJobs.size()).append("\n");
        ctx.append("Active Jobs: ").append(activeJobs).append("\n");

        // Top 5 recent job titles
        if (!recruiterJobs.isEmpty()) {
            String recentTitles = recruiterJobs.stream()
                    .limit(5)
                    .map(Job::getTitle)
                    .collect(Collectors.joining(", "));
            ctx.append("Recent Jobs: ").append(recentTitles).append("\n");
        }

        // Applications to their jobs
        long totalApplicants = applicationRepository.countByJobRecruiterId(recruiterId);
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW);
        long hires = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED);
        ctx.append("Total Applicants: ").append(totalApplicants).append("\n");
        ctx.append("Shortlisted: ").append(shortlisted)
           .append(", Interviews: ").append(interviews)
           .append(", Hires: ").append(hires).append("\n");

        return ctx.toString();
    }

    private String buildAdminContext() {
        StringBuilder ctx = new StringBuilder();
        ctx.append("=== PLATFORM ADMIN SNAPSHOT ===\n");

        ctx.append("Total Users: ").append(userRepository.count()).append("\n");
        ctx.append("Candidates: ").append(userRepository.countByRole(Role.CANDIDATE)).append("\n");
        ctx.append("Recruiters: ").append(userRepository.countByRole(Role.RECRUITER)).append("\n");
        ctx.append("Total Jobs: ").append(jobRepository.count()).append("\n");
        ctx.append("Active Jobs: ").append(jobRepository.countByStatus(JobStatus.ACTIVE)).append("\n");
        ctx.append("Total Applications: ").append(applicationRepository.count()).append("\n");
        ctx.append("Pending Applications: ").append(applicationRepository.countByStatus(ApplicationStatus.APPLIED)).append("\n");
        ctx.append("Total Companies: ").append(companyRepository.count()).append("\n");

        return ctx.toString();
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) + "..." : text;
    }
}
