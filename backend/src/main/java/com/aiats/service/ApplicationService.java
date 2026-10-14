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
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final SecurityAlertService securityAlertService;

    @org.springframework.beans.factory.annotation.Autowired
    public ApplicationService(ApplicationRepository applicationRepository, JobRepository jobRepository,
                              UserRepository userRepository, ResumeRepository resumeRepository,
                              CandidateProfileRepository candidateProfileRepository,
                              ActivityLogService activityLogService,
                              NotificationService notificationService,
                              SecurityAlertService securityAlertService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
        this.securityAlertService = securityAlertService;
    }

    @Transactional
    public ApplicationDTO applyForJob(UUID candidateId, UUID jobId, UUID resumeId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Check duplicate active application
        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        candidateId,
                        candidate.getEmail(),
                        "CANDIDATE",
                        "DUPLICATE_APPLICATION_SUBMISSION",
                        "LOW",
                        "Candidate " + candidate.getFullName() + " attempted duplicate active submission for job: " + job.getTitle(),
                        "Informational notice. Verify whether candidate encountered connectivity timeout."
                );
            }
            throw new BadRequestException("You have already submitted an active application for this job.");
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
                "Application submitted via NextGen ATS Candidate Portal");
        app.getTimeline().add(event);

        Application saved = applicationRepository.save(app);

        // Increment job applicant count
        job.setApplicantCount(job.getApplicantCount() + 1);
        jobRepository.save(job);

        String companyName = (job.getCompany() != null && job.getCompany().getName() != null)
                ? job.getCompany().getName() : "Hiring Organization";

        // Persistent in-app notification to Candidate
        if (notificationService != null) {
            notificationService.createNotification(
                    candidate,
                    "Application Submitted Successfully",
                    "Your application for " + job.getTitle() + " at " + companyName + " has been recorded in the platform.",
                    "success",
                    "/candidate/applications"
            );

            // Persistent in-app notification to owning Recruiter
            if (job.getRecruiter() != null) {
                notificationService.createNotification(
                        job.getRecruiter(),
                        "New Job Application Received",
                        candidate.getFullName() + " has applied for " + job.getTitle() + " (ATS Score: " + score + "%).",
                        "info",
                        "/recruiter/applicants?jobId=" + job.getId()
                );
            }
        }

        if (activityLogService != null) {
            activityLogService.logActivity(candidateId, candidate.getFullName(), Role.CANDIDATE,
                    "Application Submitted", job.getTitle() + " (" + candidate.getFullName() + ")", null);
        }

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
            status = ApplicationStatus.fromString(statusStr);
        }
        UUID jobUuid = jobId;
        return applicationRepository.filterApplicants(recruiterId, jobUuid, status, minScore, search)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ApplicationDTO updateStatus(UUID recruiterId, UUID applicationId,
                                       String newStatusStr, String note) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        if (!app.getJob().getRecruiter().getId().equals(recruiterId)) {
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        recruiterId,
                        null,
                        "RECRUITER",
                        "UNAUTHORIZED_APPLICATION_ACCESS",
                        "HIGH",
                        "Recruiter attempted to update application " + applicationId + " belonging to another organization.",
                        "Enforce strict tenant data isolation. Denied access."
                );
            }
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to manage this application.");
        }

        ApplicationStatus newStatus = ApplicationStatus.fromString(newStatusStr);

        app.setStatus(newStatus);
        String timelineNote = (note != null && !note.isBlank())
                ? note
                : "Recruitment stage transitioned to " + newStatus.toFrontendStatus() + " by hiring team";
        ApplicationTimeline event = new ApplicationTimeline(app, newStatus, timelineNote);
        app.getTimeline().add(event);

        if (note != null && !note.isBlank()) {
            app.getNotes().add(new ApplicationNote(app, note));
        }

        Application saved = applicationRepository.save(app);

        // Notify Candidate of recruitment progression
        if (notificationService != null && app.getCandidate() != null) {
            String notifTitle;
            String notifMsg;
            String notifType = "info";

            String jobTitle = app.getJob().getTitle();
            String compName = app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "the hiring team";

            switch (newStatus) {
                case SHORTLISTED -> {
                    notifTitle = "You Have Been Shortlisted!";
                    notifMsg = "Great news! You have been shortlisted for " + jobTitle + " at " + compName + ".";
                    notifType = "success";
                }
                case INTERVIEW -> {
                    notifTitle = "Interview Scheduled";
                    notifMsg = "An interview stage has been scheduled for your application to " + jobTitle + " at " + compName + "." + (note != null ? " Note: " + note : "");
                    notifType = "info";
                }
                case OFFERED -> {
                    notifTitle = "Offer Extended";
                    notifMsg = "Congratulations! An employment offer has been extended for " + jobTitle + " at " + compName + ".";
                    notifType = "success";
                }
                case SELECTED -> {
                    notifTitle = "Selection Confirmed";
                    notifMsg = "You have been selected for the position of " + jobTitle + " at " + compName + ". Welcome aboard!";
                    notifType = "success";
                }
                case REJECTED -> {
                    notifTitle = "Application Update";
                    notifMsg = "Thank you for interviewing for " + jobTitle + ". The team has decided to proceed with other candidates at this time.";
                    notifType = "warning";
                }
                default -> {
                    notifTitle = "Application Progress Update";
                    notifMsg = "Your application for " + jobTitle + " is now in stage: " + newStatus.toFrontendStatus() + ".";
                }
            }

            notificationService.createNotification(app.getCandidate(), notifTitle, notifMsg, notifType, "/candidate/applications");
        }

        if (activityLogService != null) {
            activityLogService.logActivity(
                    recruiterId,
                    app.getJob().getRecruiter().getFullName(),
                    Role.RECRUITER,
                    "Application Stage Updated",
                    app.getCandidate().getFullName() + " -> " + newStatus.toFrontendStatus() + " (" + app.getJob().getTitle() + ")",
                    null
            );
        }

        return toDTO(saved);
    }

    @Transactional
    public ApplicationDTO withdrawApplication(UUID candidateId, UUID applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!app.getCandidate().getId().equals(candidateId)) {
            throw new org.springframework.security.access.AccessDeniedException("You can only withdraw your own applications.");
        }

        if (app.getStatus() == ApplicationStatus.SELECTED || app.getStatus() == ApplicationStatus.REJECTED || app.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Applications in status " + app.getStatus().toFrontendStatus() + " cannot be withdrawn.");
        }

        app.setStatus(ApplicationStatus.WITHDRAWN);
        ApplicationTimeline event = new ApplicationTimeline(app, ApplicationStatus.WITHDRAWN, "Application voluntarily withdrawn by candidate.");
        app.getTimeline().add(event);

        Application saved = applicationRepository.save(app);

        // Notify owning Recruiter
        if (notificationService != null && app.getJob() != null && app.getJob().getRecruiter() != null) {
            notificationService.createNotification(
                    app.getJob().getRecruiter(),
                    "Candidate Application Withdrawn",
                    app.getCandidate().getFullName() + " has withdrawn their application for " + app.getJob().getTitle() + ".",
                    "warning",
                    "/recruiter/applicants?jobId=" + app.getJob().getId()
            );

            // Confirm to Candidate
            notificationService.createNotification(
                    app.getCandidate(),
                    "Application Withdrawn",
                    "You have successfully withdrawn your application for " + app.getJob().getTitle() + ".",
                    "info",
                    "/candidate/applications"
            );
        }

        if (activityLogService != null) {
            activityLogService.logActivity(
                    candidateId,
                    app.getCandidate().getFullName(),
                    Role.CANDIDATE,
                    "Application Withdrawn",
                    app.getJob().getTitle(),
                    null
            );
        }

        return toDTO(saved);
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
