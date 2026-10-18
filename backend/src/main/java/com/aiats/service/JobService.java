package com.aiats.service;

import com.aiats.dto.job.JobDTO;
import com.aiats.dto.job.JobRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final SavedJobRepository savedJobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ActivityLogService activityLogService;
    private final SecurityAlertService securityAlertService;
    private final JobDeadlineService jobDeadlineService;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository,
                      UserRepository userRepository, SavedJobRepository savedJobRepository,
                      ApplicationRepository applicationRepository,
                      CandidateProfileRepository candidateProfileRepository,
                      CandidateSkillRepository candidateSkillRepository,
                      ActivityLogService activityLogService) {
        this(jobRepository, companyRepository, userRepository, savedJobRepository,
             applicationRepository, candidateProfileRepository, candidateSkillRepository,
             activityLogService, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public JobService(JobRepository jobRepository, CompanyRepository companyRepository,
                      UserRepository userRepository, SavedJobRepository savedJobRepository,
                      ApplicationRepository applicationRepository,
                      CandidateProfileRepository candidateProfileRepository,
                      CandidateSkillRepository candidateSkillRepository,
                      ActivityLogService activityLogService,
                      SecurityAlertService securityAlertService,
                      JobDeadlineService jobDeadlineService) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.savedJobRepository = savedJobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.activityLogService = activityLogService;
        this.securityAlertService = securityAlertService;
        this.jobDeadlineService = jobDeadlineService;
    }

    private void validateRecruiterVerification(User recruiter) {
        if (recruiter.getRole() != Role.RECRUITER) {
            throw new org.springframework.security.access.AccessDeniedException("Only recruiters can manage job requisitions.");
        }
        if (recruiter.getStatus() == UserStatus.SUSPENDED) {
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter account is currently suspended. You cannot publish jobs until reviewed by administration.");
        }
        VerificationStatus vStatus = recruiter.getVerificationStatus();
        if (vStatus == VerificationStatus.PENDING) {
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        recruiter.getId(),
                        recruiter.getEmail(),
                        "RECRUITER",
                        "UNAUTHORIZED_JOB_POSTING_ATTEMPT",
                        "MEDIUM",
                        "Unverified recruiter " + recruiter.getFullName() + " attempted to publish a job requisition before admin approval.",
                        "Recruiter is restricted to PENDING status until credential review completes."
                );
            }
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter account is awaiting administrator verification. You cannot publish jobs until your account is approved.");
        }
        if (vStatus == VerificationStatus.REJECTED) {
            String reason = (recruiter.getRejectionReason() != null && !recruiter.getRejectionReason().isBlank())
                    ? " (" + recruiter.getRejectionReason() + ")" : "";
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter verification was rejected" + reason + ". You cannot publish jobs.");
        }
        if (vStatus == VerificationStatus.RESUBMITTED) {
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter verification has been resubmitted and is awaiting administrator review. You cannot publish jobs until your account is approved.");
        }
        if (vStatus == VerificationStatus.SUSPENDED) {
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter account has been suspended by administration. Job creation is unavailable.");
        }
        if (vStatus != VerificationStatus.VERIFIED) {
            throw new org.springframework.security.access.AccessDeniedException("Your recruiter account is not verified. You cannot publish jobs until your organization is verified by the administrator.");
        }
    }

    @Transactional(readOnly = true)
    public List<JobDTO> getPublicJobs(String search, String location, String type, String level, UUID viewerUserId) {
        List<Job> jobs = jobRepository.filterPublicActiveJobs(null, location, type, level, search);
        return jobs.stream().map(j -> toDTO(j, viewerUserId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDTO getJobById(UUID jobId, UUID viewerUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        // Candidate / public visibility check:
        // Only active approved jobs from verified active recruiters are visible publicly
        if (viewerUserId != null) {
            User viewer = userRepository.findById(viewerUserId).orElse(null);
            boolean isAdmin = viewer != null && viewer.getRole() == Role.ADMIN;
            boolean isOwner = viewer != null && job.getRecruiter() != null && job.getRecruiter().getId().equals(viewerUserId);
            if (!isAdmin && !isOwner) {
                if (job.getStatus() != JobStatus.ACTIVE ||
                    job.getRecruiter() == null ||
                    job.getRecruiter().getVerificationStatus() != VerificationStatus.VERIFIED ||
                    job.getRecruiter().getStatus() != UserStatus.ACTIVE) {
                    throw new ResourceNotFoundException("Job is not available for public discovery: " + jobId);
                }
            }
        } else {
            if (job.getStatus() != JobStatus.ACTIVE ||
                job.getRecruiter() == null ||
                job.getRecruiter().getVerificationStatus() != VerificationStatus.VERIFIED ||
                job.getRecruiter().getStatus() != UserStatus.ACTIVE) {
                throw new ResourceNotFoundException("Job is not available for public discovery: " + jobId);
            }
        }

        return toDTO(job, viewerUserId);
    }

    @Transactional
    public List<JobDTO> getRecruiterJobs(UUID recruiterId) {
        List<Job> jobs = jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        if (jobDeadlineService != null) {
            boolean changed = false;
            Instant now = Instant.now();
            for (Job j : jobs) {
                if (j.getStatus() == JobStatus.ACTIVE && jobDeadlineService.isDeadlinePassed(j.getDeadline())) {
                    j.setStatus(JobStatus.CLOSED);
                    j.setClosedReason("DEADLINE_EXPIRED");
                    j.setClosedAt(now);
                    changed = true;
                }
            }
            if (changed) {
                jobRepository.saveAll(jobs);
            }
        }
        return jobs.stream().map(j -> toDTO(j, null)).collect(Collectors.toList());
    }

    @Transactional
    public JobDTO createJob(UUID recruiterId, JobRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        // ENFORCE CRITICAL BUSINESS RULE: Only verified recruiters can publish jobs
        validateRecruiterVerification(recruiter);
        validateSalary(request);

        // Get or create company linked to this recruiter
        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setName(recruiter.getCompanyName() != null ? recruiter.getCompanyName() : "My Company");
                    c.setRecruiter(recruiter);
                    c.setCreatedAt(Instant.now());
                    return companyRepository.save(c);
                });

        Job job = new Job();
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setPostedDate(Instant.now().toString());
        mapRequestToJob(request, job);

        // Security Governance: Recruiters cannot self-approve jobs.
        // New jobs enter PENDING_APPROVAL unless explicitly saved as DRAFT
        if (request.getStatus() != null && request.getStatus().equalsIgnoreCase("DRAFT")) {
            job.setStatus(JobStatus.DRAFT);
        } else {
            job.setStatus(JobStatus.PENDING_APPROVAL);
        }

        Job saved = jobRepository.save(job);

        if (activityLogService != null) {
            activityLogService.logActivity(recruiterId, recruiter.getFullName(), Role.RECRUITER,
                    "Job Created", saved.getTitle() + " at " + company.getName(), null);
        }

        return toDTO(saved, null);
    }

    @Transactional
    public JobDTO updateJob(UUID recruiterId, UUID jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to edit this job");
        }

        // ENFORCE CRITICAL BUSINESS RULE on updates
        validateRecruiterVerification(job.getRecruiter());
        validateSalary(request);

        mapRequestToJob(request, job);

        // If the job was CLOSED due to DEADLINE_EXPIRED and new deadline is in the future
        if (job.getStatus() == JobStatus.CLOSED && "DEADLINE_EXPIRED".equals(job.getClosedReason())) {
            if (jobDeadlineService != null && !jobDeadlineService.isDeadlinePassed(job.getDeadline())) {
                job.setClosedReason("READY_TO_REOPEN");
            }
        }

        Job saved = jobRepository.save(job);

        if (activityLogService != null) {
            activityLogService.logActivity(recruiterId, job.getRecruiter().getFullName(), Role.RECRUITER,
                    "Job Updated", saved.getTitle(), null);
        }

        return toDTO(saved, null);
    }

    @Transactional
    public JobDTO updateJobStatus(UUID recruiterId, UUID jobId, String newStatusStr, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You do not have permission to manage this job");
        }

        validateRecruiterVerification(job.getRecruiter());

        if (newStatusStr == null || newStatusStr.trim().isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        JobStatus targetStatus = JobStatus.fromString(newStatusStr);
        if (targetStatus != JobStatus.ACTIVE && targetStatus != JobStatus.CLOSED) {
            throw new BadRequestException("Only ACTIVE or CLOSED status transitions are permitted via manual toggle.");
        }

        JobStatus previousStatus = job.getStatus();

        if (targetStatus == JobStatus.CLOSED) {
            if (previousStatus == JobStatus.CLOSED) {
                return toDTO(job, null);
            }
            if (previousStatus == JobStatus.REJECTED) {
                throw new BadRequestException("This job was rejected during moderation and cannot be modified.");
            }
            job.setStatus(JobStatus.CLOSED);
            job.setClosedReason(reason != null && !reason.isBlank() ? reason.trim() : "MANUALLY_CLOSED");
            job.setClosedAt(Instant.now());

            if (activityLogService != null) {
                activityLogService.logDetailedActivity(
                        recruiterId,
                        job.getRecruiter().getFullName(),
                        Role.RECRUITER,
                        "JOB_STATUS_CHANGED",
                        "JOB_LIFECYCLE",
                        "RECRUITMENT",
                        "INFO",
                        "SUCCESS",
                        job.getTitle(),
                        "JOB",
                        job.getId().toString(),
                        previousStatus.name(),
                        "CLOSED",
                        "Job closed manually by recruiter",
                        "127.0.0.1",
                        null
                );
            }
        } else if (targetStatus == JobStatus.ACTIVE) {
            if (previousStatus == JobStatus.ACTIVE) {
                return toDTO(job, null);
            }
            if (previousStatus == JobStatus.PENDING_APPROVAL) {
                throw new BadRequestException("This job is awaiting administrator approval and cannot be activated manually.");
            }
            if (previousStatus == JobStatus.REJECTED) {
                throw new BadRequestException("This job has been rejected during moderation and cannot be activated.");
            }
            if (previousStatus == JobStatus.ARCHIVED) {
                throw new BadRequestException("Archived jobs cannot be reopened.");
            }
            if (previousStatus == JobStatus.DRAFT) {
                throw new BadRequestException("Draft jobs must be published through the job creation wizard.");
            }
            if (previousStatus == JobStatus.CLOSED) {
                // Check if deadline has passed
                if (jobDeadlineService != null && jobDeadlineService.isDeadlinePassed(job.getDeadline())) {
                    throw new BadRequestException("The application deadline has passed. Update the deadline before reopening this job.");
                }
                job.setStatus(JobStatus.ACTIVE);
                job.setClosedReason(null);
                job.setClosedAt(null);

                if (activityLogService != null) {
                    activityLogService.logDetailedActivity(
                            recruiterId,
                            job.getRecruiter().getFullName(),
                            Role.RECRUITER,
                            "JOB_STATUS_CHANGED",
                            "JOB_LIFECYCLE",
                            "RECRUITMENT",
                            "INFO",
                            "SUCCESS",
                            job.getTitle(),
                            "JOB",
                            job.getId().toString(),
                            "CLOSED",
                            "ACTIVE",
                            "Job reopened by recruiter",
                            "127.0.0.1",
                            null
                    );
                }
            }
        }

        Job saved = jobRepository.save(job);
        return toDTO(saved, null);
    }

    @Transactional
    public void deleteJob(UUID recruiterId, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        String jobTitle = job.getTitle();
        jobRepository.delete(job);

        if (activityLogService != null) {
            activityLogService.logActivity(recruiterId, job.getRecruiter().getFullName(), Role.RECRUITER,
                    "Job Deleted", jobTitle, null);
        }
    }

    @Transactional
    public boolean toggleSaveJob(UUID candidateUserId, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        Optional<SavedJob> existing = savedJobRepository.findByCandidateIdAndJobId(candidateUserId, jobId);
        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false; // unsaved
        } else {
            User user = userRepository.findById(candidateUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            SavedJob saved = new SavedJob(user, job);
            savedJobRepository.save(saved);
            return true; // saved
        }
    }

    @Transactional(readOnly = true)
    public List<JobDTO> getSavedJobs(UUID candidateUserId) {
        return savedJobRepository.findByCandidateIdOrderBySavedAtDesc(candidateUserId).stream()
                .map(sj -> toDTO(sj.getJob(), candidateUserId))
                .collect(Collectors.toList());
    }

    private void validateSalary(JobRequest req) {
        BigDecimal min = null;
        BigDecimal max = null;
        if (req.getSalaryMin() != null && !req.getSalaryMin().trim().isEmpty()) {
            try {
                min = new BigDecimal(req.getSalaryMin().trim());
                if (min.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Minimum salary cannot be negative.");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid minimum salary format.");
            }
        }
        if (req.getSalaryMax() != null && !req.getSalaryMax().trim().isEmpty()) {
            try {
                max = new BigDecimal(req.getSalaryMax().trim());
                if (max.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Maximum salary cannot be negative.");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid maximum salary format.");
            }
        }
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new BadRequestException("Minimum salary cannot exceed maximum salary.");
        }
    }

    private void mapRequestToJob(JobRequest req, Job job) {
        if (req.getTitle() != null) job.setTitle(req.getTitle());
        if (req.getDepartment() != null) job.setDepartment(req.getDepartment());
        if (req.getLocation() != null) job.setLocation(req.getLocation());
        if (req.getType() != null) job.setEmploymentType(req.getType());
        if (req.getExperienceLevel() != null) job.setExperienceLevel(req.getExperienceLevel());
        if (req.getDescription() != null) job.setDescription(req.getDescription());
        if (req.getEducationRequired() != null) job.setEducationRequired(req.getEducationRequired());
        if (req.getDeadline() != null) job.setDeadline(req.getDeadline());
        if (req.getSalaryMin() != null && !req.getSalaryMin().trim().isEmpty()) {
            try { job.setSalaryMin(new BigDecimal(req.getSalaryMin().trim())); } catch (Exception ignored) {}
        } else if (req.getSalaryMin() != null && req.getSalaryMin().trim().isEmpty()) {
            job.setSalaryMin(null);
        }
        if (req.getSalaryMax() != null && !req.getSalaryMax().trim().isEmpty()) {
            try { job.setSalaryMax(new BigDecimal(req.getSalaryMax().trim())); } catch (Exception ignored) {}
        } else if (req.getSalaryMax() != null && req.getSalaryMax().trim().isEmpty()) {
            job.setSalaryMax(null);
        }
        if (req.getCurrency() != null && !req.getCurrency().trim().isEmpty()) {
            job.setSalaryCurrency(req.getCurrency().trim().toUpperCase());
        } else if (job.getSalaryCurrency() == null) {
            job.setSalaryCurrency("INR");
        }
        if (req.getSalaryPeriod() != null && !req.getSalaryPeriod().trim().isEmpty()) {
            job.setSalaryPeriod(req.getSalaryPeriod().trim().toLowerCase());
        } else if (job.getSalaryPeriod() == null) {
            job.setSalaryPeriod("yearly");
        }
        if (req.getRequirements() != null)
            job.setRequirements(String.join("||", req.getRequirements()));
        if (req.getResponsibilities() != null)
            job.setResponsibilities(String.join("||", req.getResponsibilities()));
        if (req.getSkills() != null)
            job.setSkills(String.join(",", req.getSkills()));
        if (req.getStatus() != null) {
            try { job.setStatus(JobStatus.valueOf(req.getStatus().toUpperCase())); }
            catch (IllegalArgumentException e) { job.setStatus(JobStatus.ACTIVE); }
        }
    }

    public JobDTO toDTO(Job job, UUID viewerUserId) {
        JobDTO dto = new JobDTO();
        dto.setId(job.getId().toString());
        dto.setTitle(job.getTitle());
        dto.setDepartment(job.getDepartment());
        dto.setLocation(job.getLocation());
        dto.setType(job.getEmploymentType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setDescription(job.getDescription());
        dto.setEducationRequired(job.getEducationRequired());
        dto.setDeadline(job.getDeadline());
        dto.setPostedAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
        dto.setApplicantsCount(job.getApplicantCount());
        dto.setStatus(job.getStatus() != null ? job.getStatus().name().toLowerCase() : "active");

        if (job.getSalaryMin() != null) dto.setSalaryMin(job.getSalaryMin().toPlainString());
        if (job.getSalaryMax() != null) dto.setSalaryMax(job.getSalaryMax().toPlainString());
        dto.setCurrency(job.getSalaryCurrency() != null ? job.getSalaryCurrency() : "INR");
        dto.setSalaryPeriod(job.getSalaryPeriod() != null ? job.getSalaryPeriod() : "yearly");

        if (job.getRequirements() != null && !job.getRequirements().isBlank()) {
            dto.setRequirements(parseDelimitedList(job.getRequirements(), "\\|\\|"));
        }
        if (job.getResponsibilities() != null && !job.getResponsibilities().isBlank()) {
            dto.setResponsibilities(parseDelimitedList(job.getResponsibilities(), "\\|\\|"));
        }
        if (job.getSkills() != null && !job.getSkills().isBlank()) {
            dto.setSkills(parseSkillsList(job.getSkills()));
        }

        if (job.getCompany() != null) {
            dto.setCompany(job.getCompany().getName());
            dto.setCompanyId(job.getCompany().getId().toString());
            dto.setCompanyLogo(job.getCompany().getLogo());
            dto.setVerifiedRecruiter(job.getCompany().isVerified());
        }
        if (job.getRecruiter() != null) {
            dto.setRecruiterId(job.getRecruiter().getId().toString());
            dto.setRecruiterName(job.getRecruiter().getFullName());
            dto.setRecruiterEmail(job.getRecruiter().getEmail());
            dto.setRecruiterVerificationStatus(job.getRecruiter().getVerificationStatus() != null ? job.getRecruiter().getVerificationStatus().name() : "PENDING");
            dto.setVerifiedRecruiter(job.getRecruiter().getVerificationStatus() == VerificationStatus.VERIFIED);
        }

        dto.setRejectionReason(job.getRejectionReason());
        dto.setApprovedBy(job.getApprovedBy());
        dto.setApprovedAt(job.getApprovedAt() != null ? job.getApprovedAt().toString() : null);
        dto.setModeratedAt(job.getModeratedAt() != null ? job.getModeratedAt().toString() : null);
        dto.setClosedReason(job.getClosedReason());
        dto.setClosedAt(job.getClosedAt() != null ? job.getClosedAt().toString() : null);

        // Viewer-specific state
        if (viewerUserId != null) {
            dto.setSaved(savedJobRepository.existsByCandidateIdAndJobId(viewerUserId, job.getId()));
            dto.setApplied(applicationRepository.existsByCandidateIdAndJobId(viewerUserId, job.getId()));

            int match = computeJobMatchScore(viewerUserId, job);
            dto.setMatchScore(String.valueOf(match));
        }

        return dto;
    }

    public int computeJobMatchScore(UUID candidateId, Job job) {
        if (candidateId == null || job == null) return 0;
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId).orElse(null);
        if (profile == null) return 0;

        List<CandidateSkill> skills = candidateSkillRepository.findByCandidateProfileId(profile.getId());
        Set<String> candidateSkillNames = skills.stream()
                .map(s -> s.getName().toLowerCase().trim())
                .collect(Collectors.toSet());

        List<String> jobSkills = parseSkillsList(job.getSkills());
        if (jobSkills.isEmpty()) {
            return Math.min(100, Math.max(50, profile.getProfileCompletion()));
        }

        long matched = jobSkills.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .filter(js -> candidateSkillNames.stream().anyMatch(cs -> cs.contains(js) || js.contains(cs)))
                .count();

        float skillRatio = (float) matched / jobSkills.size();
        int matchScore = Math.round((skillRatio * 70f) + (profile.getProfileCompletion() * 0.3f));
        return Math.min(99, Math.max(35, matchScore));
    }

    private List<String> parseDelimitedList(String text, String primaryDelimiter) {
        if (text == null || text.isBlank()) return Collections.emptyList();
        if (text.contains("||")) {
            return Arrays.stream(text.split("\\|\\|"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        if (text.contains("\n")) {
            return Arrays.stream(text.split("\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        return List.of(text.trim());
    }

    private List<String> parseSkillsList(String rawSkills) {
        if (rawSkills == null || rawSkills.isBlank()) return Collections.emptyList();
        String trimmed = rawSkills.trim();
        if (trimmed.contains(",")) {
            return Arrays.stream(trimmed.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        if (trimmed.contains(";")) {
            return Arrays.stream(trimmed.split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        if (trimmed.contains("||")) {
            return Arrays.stream(trimmed.split("\\|\\|"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        // If space-separated string with multiple technologies
        List<String> result = new ArrayList<>();
        String[] tokens = trimmed.split("\\s+");
        StringBuilder current = new StringBuilder();
        for (String t : tokens) {
            if (t.equalsIgnoreCase("boot") && current.toString().equalsIgnoreCase("spring")) {
                current.append(" ").append(t);
                result.add(current.toString());
                current.setLength(0);
            } else if ((t.equalsIgnoreCase("api") || t.equalsIgnoreCase("apis")) && current.toString().equalsIgnoreCase("rest")) {
                current.append(" ").append(t);
                result.add(current.toString());
                current.setLength(0);
            } else if (t.equalsIgnoreCase("stack") && current.toString().equalsIgnoreCase("full")) {
                current.append(" ").append(t);
                result.add(current.toString());
                current.setLength(0);
            } else if (t.equalsIgnoreCase("structures") && current.toString().equalsIgnoreCase("data")) {
                current.append(" ").append(t);
                result.add(current.toString());
                current.setLength(0);
            } else {
                if (current.length() > 0) {
                    result.add(current.toString());
                    current.setLength(0);
                }
                if (t.equalsIgnoreCase("spring") || t.equalsIgnoreCase("rest") || t.equalsIgnoreCase("full") || t.equalsIgnoreCase("data")) {
                    current.append(t);
                } else {
                    result.add(t);
                }
            }
        }
        if (current.length() > 0) {
            result.add(current.toString());
        }
        return result.isEmpty() ? List.of(trimmed) : result;
    }
}
