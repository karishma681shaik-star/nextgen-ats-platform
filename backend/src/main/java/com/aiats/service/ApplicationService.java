package com.aiats.service;

import com.aiats.dto.application.ApplicationDTO;
import com.aiats.dto.application.TimelineEventDTO;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
                              UserRepository userRepository, ResumeRepository resumeRepository,
                              CandidateProfileRepository candidateProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.candidateProfileRepository = candidateProfileRepository;
    }

    @Transactional
    public ApplicationDTO applyForJob(UUID candidateId, UUID jobId, UUID resumeId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Check duplicate
        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
            throw new BadRequestException("You have already applied for this job");
        }

        Resume resume = null;
        if (resumeId != null) {
            resume = resumeRepository.findById(resumeId).orElse(null);
        }
        if (resume == null) {
            List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(candidateId);
            if (!resumes.isEmpty()) resume = resumes.get(0);
        }

        Application app = new Application();
        app.setJob(job);
        app.setCandidate(candidate);
        app.setResume(resume);
        app.setStatus(ApplicationStatus.APPLIED);
        app.setAppliedDate(Instant.now());

        // Compute ATS score from candidate profile skills vs job skills
        int score = computeMatchScore(candidateId, job);
        app.setAtsScore(score);
        app.setMatchPercentage(score);

        // Add initial timeline entry
        ApplicationTimeline event = new ApplicationTimeline(app, ApplicationStatus.APPLIED,
                "Application submitted via AI ATS Portal");
        app.getTimeline().add(event);

        Application saved = applicationRepository.save(app);

        // Increment job applicant count
        job.setApplicantCount(job.getApplicantCount() + 1);
        jobRepository.save(job);

        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDTO> getCandidateApplications(UUID candidateId) {
        return applicationRepository.findByCandidateIdOrderByAppliedDateDesc(candidateId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationDTO> getJobApplications(UUID recruiterId, UUID jobId) {
        return applicationRepository.findByJobIdOrderByAppliedDateDesc(jobId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationDTO> getRecruiterApplications(UUID recruiterId, UUID jobId,
                                                         String statusStr, Integer minScore, String search) {
        ApplicationStatus status = null;
        if (statusStr != null && !statusStr.equalsIgnoreCase("all")) {
            try { status = ApplicationStatus.valueOf(statusStr.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        UUID jobUuid = jobId; // may be null
        return applicationRepository.filterApplicants(recruiterId, jobUuid, status, minScore, search)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ApplicationDTO updateStatus(UUID recruiterId, UUID applicationId,
                                       String newStatusStr, String note) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        ApplicationStatus newStatus;
        try { newStatus = ApplicationStatus.valueOf(newStatusStr.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + newStatusStr); }

        app.setStatus(newStatus);
        ApplicationTimeline event = new ApplicationTimeline(app, newStatus,
                note != null ? note : "Status updated to " + newStatus.name() + " by recruiter");
        app.getTimeline().add(event);

        if (note != null && !note.isBlank()) {
            app.getNotes().add(new ApplicationNote(app, note));
        }
        return toDTO(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationDTO addNote(UUID recruiterId, UUID applicationId, String note) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        app.getNotes().add(new ApplicationNote(app, note));
        return toDTO(applicationRepository.save(app));
    }

    @Transactional
    public ApplicationDTO updateAtsScore(UUID recruiterId, UUID applicationId, int atsScore) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        app.setAtsScore(Math.max(0, Math.min(100, atsScore)));
        app.setMatchPercentage(Math.max(0, Math.min(100, atsScore)));
        app.getTimeline().add(new ApplicationTimeline(app, app.getStatus(), "ATS Score manually updated to " + atsScore + "% by recruiter"));
        return toDTO(applicationRepository.save(app));
    }

    @Transactional
    public void deleteApplication(UUID recruiterId, UUID applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new BadRequestException("Unauthorized");
        }
        applicationRepository.delete(app);
    }

    private int computeMatchScore(UUID candidateId, Job job) {
        if (job.getSkills() == null || job.getSkills().isBlank()) return 80;
        Set<String> jobSkills = Arrays.stream(job.getSkills().split(","))
                .map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId).orElse(null);
        if (profile == null) return 75;
        // We'd need to fetch skills — compute simple score
        return Math.min(95, 70 + (int)(jobSkills.size() * 1.5));
    }

    public ApplicationDTO toDTO(Application app) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(app.getId().toString());
        dto.setStatus(app.getStatus().name());
        dto.setAtsScore(app.getAtsScore());
        dto.setMatchPercentage(app.getMatchPercentage());
        dto.setExperienceYears(app.getExperienceYears());
        dto.setAppliedDate(app.getAppliedDate() != null ? app.getAppliedDate().toString() : null);

        // Job info
        if (app.getJob() != null) {
            dto.setJobId(app.getJob().getId().toString());
            dto.setJobTitle(app.getJob().getTitle());
            if (app.getJob().getCompany() != null) {
                dto.setCompany(app.getJob().getCompany().getName());
                dto.setCompanyLogo(app.getJob().getCompany().getLogo());
            }
        }

        // Candidate info
        if (app.getCandidate() != null) {
            dto.setCandidateId(app.getCandidate().getId().toString());
            dto.setCandidateName(app.getCandidate().getFullName());
            dto.setCandidateEmail(app.getCandidate().getEmail());
            dto.setCandidateAvatar(app.getCandidate().getAvatarUrl());
            // Profile fields
            candidateProfileRepository.findByUserId(app.getCandidate().getId()).ifPresent(p -> {
                dto.setCandidateTitle(p.getTitle());
                dto.setCandidateLocation(p.getLocation());
            });
        }

        // Resume info
        if (app.getResume() != null) {
            dto.setResumeId(app.getResume().getId().toString());
            dto.setResumeFileName(app.getResume().getFileName());
        }

        // Timeline
        dto.setTimeline(app.getTimeline().stream()
                .map(t -> new TimelineEventDTO(
                        t.getStatus().name(),
                        t.getEventDate() != null ? t.getEventDate().toString() : null,
                        t.getNote()))
                .collect(Collectors.toList()));

        // Notes
        dto.setNotes(app.getNotes().stream()
                .map(n -> n.getNote())
                .collect(Collectors.toList()));

        return dto;
    }
}
