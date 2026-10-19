package com.aiats.service;

import com.aiats.dto.candidate.*;
import com.aiats.entity.*;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository skillRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeService resumeService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;
    private final JobRepository jobRepository;
    private final JobService jobService;
    private final SavedJobRepository savedJobRepository;
    private final ProfileReadinessService profileReadinessService;

    public CandidateService(CandidateProfileRepository profileRepository,
                            CandidateSkillRepository skillRepository,
                            EducationRepository educationRepository,
                            ExperienceRepository experienceRepository,
                            ProjectRepository projectRepository,
                            CertificationRepository certificationRepository,
                            UserRepository userRepository,
                            ResumeRepository resumeRepository,
                            ResumeAnalysisRepository resumeAnalysisRepository,
                            ResumeService resumeService,
                            ApplicationRepository applicationRepository,
                            ApplicationService applicationService,
                            JobRepository jobRepository,
                            JobService jobService,
                            SavedJobRepository savedJobRepository,
                            ProfileReadinessService profileReadinessService) {
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.resumeService = resumeService;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
        this.jobRepository = jobRepository;
        this.jobService = jobService;
        this.savedJobRepository = savedJobRepository;
        this.profileReadinessService = profileReadinessService;
    }

    @Transactional(readOnly = true)
    public CandidateProfileDTO getProfile(UUID userId) {
        CandidateProfile profile = getOrCreate(userId);
        return toDTO(profile);
    }

    @Transactional
    public CandidateProfileDTO updateProfile(UUID userId, CandidateProfileRequest request) {
        CandidateProfile profile = getOrCreate(userId);
        User user = profile.getUser();

        // Update user-level fields
        if (request.getName() != null) user.setFullName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        // Update profile fields
        if (request.getTitle() != null) profile.setTitle(request.getTitle());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getWebsiteUrl() != null) profile.setWebsiteUrl(request.getWebsiteUrl());

        // Sync skills
        if (request.getSkills() != null) {
            skillRepository.deleteByCandidateProfileId(profile.getId());
            List<CandidateSkill> skills = new ArrayList<>();
            addSkillsFromList(profile, request.getSkills().getTechnical(), SkillType.TECHNICAL, skills);
            addSkillsFromList(profile, request.getSkills().getSoft(), SkillType.SOFT, skills);
            addSkillsFromList(profile, request.getSkills().getTools(), SkillType.TOOLS, skills);
            addSkillsFromList(profile, request.getSkills().getLanguages(), SkillType.LANGUAGES, skills);
            skillRepository.saveAll(skills);
        }

        // Sync education
        if (request.getEducation() != null) {
            educationRepository.deleteByCandidateProfileId(profile.getId());
            List<Education> edus = request.getEducation().stream().map(dto -> {
                Education e = new Education();
                e.setCandidateProfile(profile);
                e.setDegree(dto.getDegree());
                e.setInstitution(dto.getInstitution());
                e.setFieldOfStudy(dto.getFieldOfStudy());
                e.setStartYear(dto.getStartYear());
                e.setEndYear(dto.getEndYear());
                e.setGrade(dto.getGrade());
                return e;
            }).collect(Collectors.toList());
            educationRepository.saveAll(edus);
        }

        // Sync experience
        if (request.getExperience() != null) {
            experienceRepository.deleteByCandidateProfileId(profile.getId());
            List<Experience> exps = request.getExperience().stream().map(dto -> {
                Experience ex = new Experience();
                ex.setCandidateProfile(profile);
                ex.setCompany(dto.getCompany());
                ex.setRole(dto.getRole());
                ex.setLocation(dto.getLocation());
                ex.setStartDate(dto.getStartDate());
                ex.setEndDate(dto.getEndDate());
                ex.setCurrent(dto.isCurrent());
                ex.setDescription(dto.getDescription());
                ex.setTechnologies(dto.getTechnologies() != null ? String.join(",", dto.getTechnologies()) : null);
                return ex;
            }).collect(Collectors.toList());
            experienceRepository.saveAll(exps);
        }

        // Sync projects
        if (request.getProjects() != null) {
            projectRepository.deleteByCandidateProfileId(profile.getId());
            List<Project> projs = request.getProjects().stream().map(dto -> {
                Project p = new Project();
                p.setCandidateProfile(profile);
                p.setTitle(dto.getTitle());
                p.setDescription(dto.getDescription());
                p.setTechnologies(dto.getTechnologies() != null ? String.join(",", dto.getTechnologies()) : null);
                p.setLink(dto.getLink());
                p.setGithubUrl(dto.getGithubUrl());
                return p;
            }).collect(Collectors.toList());
            projectRepository.saveAll(projs);
        }

        // Sync certifications
        if (request.getCertifications() != null) {
            certificationRepository.deleteByCandidateProfileId(profile.getId());
            List<Certification> certs = request.getCertifications().stream().map(dto -> {
                Certification c = new Certification();
                c.setCandidateProfile(profile);
                c.setTitle(dto.getTitle());
                c.setIssuer(dto.getIssuer());
                c.setIssueDate(dto.getIssueDate());
                c.setCredentialUrl(dto.getCredentialUrl());
                c.setCredentialId(dto.getCredentialId());
                return c;
            }).collect(Collectors.toList());
            certificationRepository.saveAll(certs);
        }

        ProfileReadinessDTO readiness = profileReadinessService.calculateReadiness(user, profile);
        profile.setProfileCompletion(readiness.getCompletionPercentage());
        CandidateProfile saved = profileRepository.save(profile);
        return toDTO(saved);
    }

    private void addSkillsFromList(CandidateProfile profile, List<String> names, SkillType type, List<CandidateSkill> target) {
        if (names == null) return;
        names.forEach(name -> {
            if (name != null && !name.isBlank()) {
                target.add(new CandidateSkill(profile, name.trim(), type));
            }
        });
    }

    private CandidateProfile getOrCreate(UUID userId) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            CandidateProfile p = new CandidateProfile(user);
            return profileRepository.save(p);
        });
    }

    public CandidateProfileDTO toDTO(CandidateProfile profile) {
        User u = profile.getUser();
        CandidateProfileDTO dto = new CandidateProfileDTO();
        dto.setId(profile.getId().toString());
        dto.setUserId(u.getId().toString());
        dto.setName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setLocation(profile.getLocation());
        dto.setTitle(profile.getTitle());
        dto.setBio(profile.getBio());
        dto.setAvatar(u.getAvatarUrl());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setWebsiteUrl(profile.getWebsiteUrl());
        dto.setProfileCompletion(profile.getProfileCompletion());

        // Skills grouped by type
        List<CandidateSkill> allSkills = skillRepository.findByCandidateProfileId(profile.getId());
        SkillCategoryDTO skillCat = new SkillCategoryDTO();
        skillCat.setTechnical(filterSkills(allSkills, SkillType.TECHNICAL));
        skillCat.setSoft(filterSkills(allSkills, SkillType.SOFT));
        skillCat.setTools(filterSkills(allSkills, SkillType.TOOLS));
        skillCat.setLanguages(filterSkills(allSkills, SkillType.LANGUAGES));
        dto.setSkills(skillCat);

        // Education
        dto.setEducation(educationRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(this::toEducationDTO).collect(Collectors.toList()));

        // Experience
        dto.setExperience(experienceRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(this::toExperienceDTO).collect(Collectors.toList()));

        // Projects
        dto.setProjects(projectRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(this::toProjectDTO).collect(Collectors.toList()));

        // Certifications
        dto.setCertifications(certificationRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(this::toCertDTO).collect(Collectors.toList()));

        return dto;
    }

    private List<String> filterSkills(List<CandidateSkill> all, SkillType type) {
        return all.stream().filter(s -> s.getSkillType() == type).map(CandidateSkill::getName).collect(Collectors.toList());
    }

    private EducationDTO toEducationDTO(Education e) {
        EducationDTO dto = new EducationDTO();
        dto.setId(e.getId().toString());
        dto.setDegree(e.getDegree());
        dto.setInstitution(e.getInstitution());
        dto.setFieldOfStudy(e.getFieldOfStudy());
        dto.setStartYear(e.getStartYear());
        dto.setEndYear(e.getEndYear());
        dto.setGrade(e.getGrade());
        return dto;
    }

    private ExperienceDTO toExperienceDTO(Experience ex) {
        ExperienceDTO dto = new ExperienceDTO();
        dto.setId(ex.getId().toString());
        dto.setCompany(ex.getCompany());
        dto.setRole(ex.getRole());
        dto.setLocation(ex.getLocation());
        dto.setStartDate(ex.getStartDate());
        dto.setEndDate(ex.getEndDate());
        dto.setCurrent(ex.isCurrent());
        dto.setDescription(ex.getDescription());
        dto.setTechnologies(ex.getTechnologies() != null
                ? Arrays.asList(ex.getTechnologies().split(","))
                : new ArrayList<>());
        return dto;
    }

    private ProjectDTO toProjectDTO(Project p) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId().toString());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setTechnologies(p.getTechnologies() != null
                ? Arrays.asList(p.getTechnologies().split(","))
                : new ArrayList<>());
        dto.setLink(p.getLink());
        dto.setGithubUrl(p.getGithubUrl());
        return dto;
    }

    private CertificationDTO toCertDTO(Certification c) {
        CertificationDTO dto = new CertificationDTO();
        dto.setId(c.getId().toString());
        dto.setTitle(c.getTitle());
        dto.setIssuer(c.getIssuer());
        dto.setIssueDate(c.getIssueDate());
        dto.setCredentialUrl(c.getCredentialUrl());
        dto.setCredentialId(c.getCredentialId());
        return dto;
    }

    @Transactional
    public CandidateDashboardDTO getCandidateDashboard(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        CandidateProfile profile = getOrCreate(userId);

        CandidateDashboardDTO dto = new CandidateDashboardDTO();
        dto.setCandidateName(user.getFullName());
        dto.setCandidateEmail(user.getEmail());
        dto.setCandidateTitle(profile.getTitle() != null && !profile.getTitle().isBlank() ? profile.getTitle() : "Candidate");
        dto.setAvatar(user.getAvatarUrl());

        // 1. Dynamic, truthful weighted profile readiness calculation
        ProfileReadinessDTO readiness = profileReadinessService.calculateReadiness(user, profile);
        dto.setProfileReadiness(readiness);
        dto.setProfileCompletion(readiness.getCompletionPercentage());

        // Content Checklist derived from real criteria status
        Map<String, Boolean> checklist = new LinkedHashMap<>();
        for (ProfileReadinessCriterionDTO crit : readiness.getCriteria()) {
            checklist.put(crit.getLabel(), crit.isCompleted());
        }
        dto.setChecklist(checklist);

        // 2. Primary resume & Exact ATS score
        Optional<Resume> primaryResumeOpt = resumeRepository.findByUserIdAndPrimaryTrue(userId);
        if (primaryResumeOpt.isEmpty()) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!userResumes.isEmpty()) {
                primaryResumeOpt = Optional.of(userResumes.get(0));
            }
        }

        boolean hasResume = primaryResumeOpt.isPresent();
        dto.setHasPrimaryResume(hasResume);

        if (!hasResume) {
            // NO_RESUME state: strictly never display a score, gauge, tier, or keyword assessment
            dto.setAtsStatus("NO_RESUME");
            dto.setAtsScore(null);
            dto.setAtsTier(null);
            dto.setAtsSummary(null);
            dto.setLastAnalyzedDate(null);
        } else {
            Resume primary = primaryResumeOpt.get();
            dto.setPrimaryResumeId(primary.getId().toString());
            dto.setPrimaryResumeFileName(primary.getFileName());

            String status = primary.getStatus() != null ? primary.getStatus().toLowerCase() : "ready";
            if ("processing".equals(status) || "uploading".equals(status)) {
                dto.setAtsStatus("PROCESSING");
                dto.setAtsScore(null);
                dto.setAtsTier(null);
                dto.setAtsSummary("Analyzing your resume...");
                dto.setLastAnalyzedDate(null);
            } else if ("failed".equals(status) || "error".equals(status)) {
                dto.setAtsStatus("ANALYSIS_FAILED");
                dto.setAtsScore(null);
                dto.setAtsTier(null);
                dto.setAtsSummary("We couldn't analyze your resume.");
                dto.setLastAnalyzedDate(null);
            } else {
                // Resume is uploaded and ready/parsed: check for ATS analysis or evaluate readiness
                Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findByResume(primary);
                if (analysisOpt.isPresent() && analysisOpt.get().getOverallScore() > 0) {
                    ResumeAnalysis analysis = analysisOpt.get();
                    int genuineScore = analysis.getOverallScore();
                    dto.setAtsStatus("ATS_SCORE_AVAILABLE");
                    dto.setAtsScore(genuineScore);
                    dto.setAtsTier(genuineScore >= 80 ? "Excellent" : genuineScore >= 60 ? "Good" : genuineScore >= 40 ? "Fair" : "Needs Optimization");
                    dto.setAtsSummary("Resume ATS score evaluated from parsed skills, experience, and structural ATS criteria.");
                    dto.setLastAnalyzedDate(analysis.getLastAnalyzed() != null ? analysis.getLastAnalyzed().toString() : null);
                } else {
                    // Check readiness from actual resume content
                    try {
                        com.aiats.dto.resume.ResumeReadinessDTO resumeReadiness = resumeService.checkReadiness(userId, primary.getId());
                        if (resumeReadiness != null && resumeReadiness.getReadinessScore() > 0) {
                            dto.setAtsStatus("ATS_SCORE_AVAILABLE");
                            dto.setAtsScore(resumeReadiness.getReadinessScore());
                            dto.setAtsTier(resumeReadiness.getTier());
                            dto.setAtsSummary(resumeReadiness.getMessage());
                            dto.setLastAnalyzedDate(primary.getUpdatedAt() != null ? primary.getUpdatedAt().toString() : (primary.getCreatedAt() != null ? primary.getCreatedAt().toString() : null));
                        } else {
                            dto.setAtsStatus("PARSED_PENDING_ANALYSIS");
                            dto.setAtsScore(null);
                            dto.setAtsTier(null);
                            dto.setAtsSummary("Resume ready — ATS analysis pending");
                            dto.setLastAnalyzedDate(null);
                        }
                    } catch (Exception e) {
                        dto.setAtsStatus("PARSED_PENDING_ANALYSIS");
                        dto.setAtsScore(null);
                        dto.setAtsTier(null);
                        dto.setAtsSummary("Resume ready — ATS analysis pending");
                        dto.setLastAnalyzedDate(null);
                    }
                }
            }
        }

        // 3. Real Application status counts
        long totalApps = applicationRepository.countByCandidateId(userId);
        long applied = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.APPLIED);
        long underReview = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.UNDER_REVIEW);
        long shortlisted = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.SHORTLISTED);
        long interview = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        long selected = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByCandidateIdAndStatus(userId, ApplicationStatus.REJECTED);
        long savedCount = savedJobRepository.countByCandidateId(userId);

        dto.setTotalApplicationsCount(totalApps);
        dto.setActiveApplicationsCount(applied + underReview);
        dto.setShortlistedCount(shortlisted);
        dto.setInterviewsCount(interview);
        dto.setSelectedCount(selected);
        dto.setRejectedCount(rejected);
        dto.setSavedJobsCount(savedCount);

        // 4. Recent Real Applications
        List<com.aiats.dto.application.ApplicationDTO> recentApps = applicationRepository.findByCandidateIdOrderByAppliedDateDesc(userId)
                .stream()
                .limit(5)
                .map(applicationService::toDTO)
                .collect(Collectors.toList());
        dto.setRecentApplications(recentApps);

        // 5. Real Recruiter-Posted Recommended Jobs (Exclude dummy jobs and exclude jobs already applied to)
        Set<UUID> appliedJobIds = applicationRepository.findByCandidateIdOrderByAppliedDateDesc(userId)
                .stream()
                .filter(a -> a.getJob() != null)
                .map(a -> a.getJob().getId())
                .collect(Collectors.toSet());

        List<com.aiats.dto.job.JobDTO> recommended = jobRepository.findByStatus(JobStatus.ACTIVE).stream()
                .filter(j -> !appliedJobIds.contains(j.getId()))
                .filter(j -> {
                    String title = (j.getTitle() != null ? j.getTitle() : "").trim();
                    String company = (j.getCompany() != null ? j.getCompany().getName() : "").trim();
                    return !title.equalsIgnoreCase("Engineer 1") && !company.equalsIgnoreCase("American Express");
                })
                .limit(4)
                .map(j -> jobService.toDTO(j, userId))
                .collect(Collectors.toList());
        dto.setRecommendedJobs(recommended);

        return dto;
    }

    @Transactional(readOnly = true)
    public CandidateAnalyticsDTO getAnalytics(UUID candidateId) {
        CandidateAnalyticsDTO dto = new CandidateAnalyticsDTO();
        dto.setTotalApplications(applicationRepository.countByCandidateId(candidateId));
        dto.setUnderReview(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.UNDER_REVIEW));
        dto.setShortlisted(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SHORTLISTED));
        dto.setInterviewsScheduled(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.INTERVIEW));
        dto.setOffersReceived(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.OFFERED));
        dto.setSelected(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SELECTED));
        dto.setRejected(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.REJECTED));
        dto.setWithdrawn(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.WITHDRAWN));
        return dto;
    }

    @Transactional(readOnly = true)
    public ProfileReadinessDTO getProfileReadiness(UUID userId) {
        return profileReadinessService.calculateReadiness(userId);
    }
}
