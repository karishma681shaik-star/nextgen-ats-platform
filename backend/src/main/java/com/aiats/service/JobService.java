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

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository,
                      UserRepository userRepository, SavedJobRepository savedJobRepository,
                      ApplicationRepository applicationRepository,
                      CandidateProfileRepository candidateProfileRepository,
                      CandidateSkillRepository candidateSkillRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.savedJobRepository = savedJobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
    }

    @Transactional(readOnly = true)
    public List<JobDTO> getPublicJobs(String search, String location, String type, String level, UUID viewerUserId) {
        List<Job> jobs = jobRepository.filterJobs(JobStatus.ACTIVE, null, location, type, level, search);
        return jobs.stream().map(j -> toDTO(j, viewerUserId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDTO getJobById(UUID jobId, UUID viewerUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        return toDTO(job, viewerUserId);
    }

    @Transactional(readOnly = true)
    public List<JobDTO> getRecruiterJobs(UUID recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId).stream()
                .map(j -> toDTO(j, null)).collect(Collectors.toList());
    }

    @Transactional
    public JobDTO createJob(UUID recruiterId, JobRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

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

        Job saved = jobRepository.save(job);
        return toDTO(saved, null);
    }

    @Transactional
    public JobDTO updateJob(UUID recruiterId, UUID jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("You are not authorized to edit this job");
        }
        mapRequestToJob(request, job);
        return toDTO(jobRepository.save(job), null);
    }

    @Transactional
    public void deleteJob(UUID recruiterId, UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        jobRepository.delete(job);
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

    private void mapRequestToJob(JobRequest req, Job job) {
        if (req.getTitle() != null) job.setTitle(req.getTitle());
        if (req.getDepartment() != null) job.setDepartment(req.getDepartment());
        if (req.getLocation() != null) job.setLocation(req.getLocation());
        if (req.getType() != null) job.setEmploymentType(req.getType());
        if (req.getExperienceLevel() != null) job.setExperienceLevel(req.getExperienceLevel());
        if (req.getDescription() != null) job.setDescription(req.getDescription());
        if (req.getEducationRequired() != null) job.setEducationRequired(req.getEducationRequired());
        if (req.getDeadline() != null) job.setDeadline(req.getDeadline());
        if (req.getSalaryMin() != null) {
            try { job.setSalaryMin(new BigDecimal(req.getSalaryMin())); } catch (Exception ignored) {}
        }
        if (req.getSalaryMax() != null) {
            try { job.setSalaryMax(new BigDecimal(req.getSalaryMax())); } catch (Exception ignored) {}
        }
        if (req.getCurrency() != null) job.setSalaryCurrency(req.getCurrency());
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
        dto.setCurrency(job.getSalaryCurrency());

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
            dto.setRecruiterName(job.getRecruiter().getFullName());
        }

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
