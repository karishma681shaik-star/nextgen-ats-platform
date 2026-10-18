package com.aiats.service;

import com.aiats.dto.admin.VerificationHistoryDTO;
import com.aiats.dto.recruiter.CompanyDTO;
import com.aiats.dto.recruiter.RecruiterAnalyticsDTO;
import com.aiats.dto.recruiter.RecruiterStatsDTO;
import com.aiats.dto.recruiter.RecruiterVerificationDetailDTO;
import com.aiats.dto.recruiter.VerificationResubmitRequest;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecruiterService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Autowired(required = false)
    private VerificationHistoryRepository verificationHistoryRepository;

    @Autowired(required = false)
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private ActivityLogService activityLogService;

    public RecruiterService(CompanyRepository companyRepository, UserRepository userRepository,
                            JobRepository jobRepository, ApplicationRepository applicationRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public RecruiterStatsDTO getStats(UUID recruiterId) {
        long activeJobs = jobRepository.countByRecruiterIdAndStatus(recruiterId, JobStatus.ACTIVE);
        long totalApplicants = applicationRepository.countByJobRecruiterId(recruiterId);
        long applied = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.APPLIED);
        long underReview = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.UNDER_REVIEW);
        long needsReview = applied + underReview;
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW);
        long hires = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED);

        RecruiterStatsDTO dto = new RecruiterStatsDTO();
        dto.setActiveJobs(activeJobs);
        dto.setTotalApplicants(totalApplicants);
        dto.setNeedsReview(needsReview);
        dto.setShortlisted(shortlisted);
        dto.setInterviewsScheduled(interviews);
        dto.setHiresThisMonth(hires);
        dto.setAverageTimeToHireDays(15);
        return dto;
    }

    @Transactional(readOnly = true)
    public RecruiterAnalyticsDTO getAnalytics(UUID recruiterId) {
        long totalJobs = jobRepository.countByRecruiterId(recruiterId);
        long activeJobs = jobRepository.countByRecruiterIdAndStatus(recruiterId, JobStatus.ACTIVE);
        long totalApplicants = applicationRepository.countByJobRecruiterId(recruiterId);
        long underReview = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.UNDER_REVIEW);
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW);
        long offers = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.OFFERED);
        long hires = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.REJECTED);
        long withdrawn = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.WITHDRAWN);

        long reviewed = underReview + shortlisted + interviews + offers + hires + rejected;

        RecruiterAnalyticsDTO dto = new RecruiterAnalyticsDTO();
        dto.setTotalJobs(totalJobs);
        dto.setActiveJobs(activeJobs);
        dto.setTotalApplicants(totalApplicants);
        dto.setReviewedApplicants(reviewed);
        dto.setShortlisted(shortlisted);
        dto.setInterviewsScheduled(interviews);
        dto.setOffersExtended(offers);
        dto.setHires(hires);
        dto.setRejected(rejected);
        dto.setWithdrawn(withdrawn);

        if (totalApplicants > 0) {
            dto.setReviewRate(Math.round(((double) reviewed / totalApplicants) * 1000.0) / 10.0);
            dto.setShortlistRate(Math.round(((double) shortlisted / totalApplicants) * 1000.0) / 10.0);
        }
        if (shortlisted > 0) {
            dto.setInterviewRate(Math.round(((double) interviews / shortlisted) * 1000.0) / 10.0);
        }
        if (interviews > 0) {
            dto.setHireRate(Math.round(((double) hires / interviews) * 1000.0) / 10.0);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyDTO getCompanyProfile(UUID recruiterId) {
        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseGet(() -> createDefaultCompany(recruiterId));
        return toDTO(company);
    }

    @Transactional
    public CompanyDTO updateCompanyProfile(UUID recruiterId, CompanyDTO request) {
        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseGet(() -> createDefaultCompany(recruiterId));

        if (request.getName() != null) company.setName(request.getName());
        if (request.getLogo() != null) company.setLogo(request.getLogo());
        if (request.getTagline() != null) company.setTagline(request.getTagline());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getLocation() != null) company.setLocation(request.getLocation());
        if (request.getSize() != null) company.setSize(request.getSize());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getFoundedYear() != null) company.setFoundedYear(request.getFoundedYear());
        if (request.getContactEmail() != null) company.setContactEmail(request.getContactEmail());
        if (request.getContactPhone() != null) company.setContactPhone(request.getContactPhone());
        if (request.getBenefits() != null)
            company.setBenefits(String.join(",", request.getBenefits()));

        return toDTO(companyRepository.save(company));
    }

    private Company createDefaultCompany(UUID recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));
        Company c = new Company();
        c.setRecruiter(recruiter);
        c.setName(recruiter.getCompanyName() != null ? recruiter.getCompanyName() : "My Company");
        c.setCreatedAt(Instant.now());
        return companyRepository.save(c);
    }

    public CompanyDTO toDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId().toString());
        if (company.getRecruiter() != null) dto.setRecruiterId(company.getRecruiter().getId().toString());
        dto.setName(company.getName());
        dto.setLogo(company.getLogo());
        dto.setTagline(company.getTagline());
        dto.setIndustry(company.getIndustry());
        dto.setWebsite(company.getWebsite());
        dto.setLocation(company.getLocation());
        dto.setSize(company.getSize());
        dto.setDescription(company.getDescription());
        dto.setFoundedYear(company.getFoundedYear());
        dto.setContactEmail(company.getContactEmail());
        dto.setContactPhone(company.getContactPhone());
        dto.setVerified(company.isVerified());
        dto.setBusinessRegistrationNumber(company.getBusinessRegistrationNumber());
        dto.setTaxId(company.getTaxId());
        dto.setOfficialEmailDomain(company.getOfficialEmailDomain());
        dto.setVerificationDocumentUrl(company.getVerificationDocumentUrl());
        dto.setVerificationEvidenceNotes(company.getVerificationEvidenceNotes());
        dto.setRegistrationCheckStatus(company.getRegistrationCheckStatus());
        dto.setWebsiteConsistencyStatus(company.getWebsiteConsistencyStatus());
        dto.setAssociationVerified(company.getAssociationVerified());
        dto.setAssociationCheckStatus(company.getAssociationCheckStatus());
        dto.setAuthorizationDocumentUrl(company.getAuthorizationDocumentUrl());
        dto.setAuthorizationNotes(company.getAuthorizationNotes());
        dto.setIndependentConfirmationNotes(company.getIndependentConfirmationNotes());
        dto.setReverificationRequired(company.getReverificationRequired());
        if (company.getBenefits() != null && !company.getBenefits().isBlank())
            dto.setBenefits(Arrays.asList(company.getBenefits().split(",")));
        return dto;
    }

    @Transactional(readOnly = true)
    public RecruiterVerificationDetailDTO getRecruiterVerificationDetail(UUID recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found"));

        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseGet(() -> createDefaultCompany(recruiterId));

        return toVerificationDetailDTO(recruiter, company);
    }

    @Transactional
    public RecruiterVerificationDetailDTO resubmitVerification(UUID recruiterId, VerificationResubmitRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter account not found"));

        if (recruiter.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new BadRequestException("This account is already verified.");
        }

        if (recruiter.getResubmissionAllowed() != null && !recruiter.getResubmissionAllowed()) {
            throw new BadRequestException("Resubmission is currently not permitted for this verification record. Please contact the administrator.");
        }

        if (request != null && request.getName() != null && request.getName().trim().isEmpty()) {
            throw new BadRequestException("Legal Company Name cannot be empty.");
        }

        Company company = companyRepository.findByRecruiterId(recruiterId)
                .orElseGet(() -> createDefaultCompany(recruiterId));

        if (request != null) {
            if (request.getName() != null && !request.getName().isBlank()) {
                company.setName(request.getName().trim());
                recruiter.setCompanyName(request.getName().trim());
            }
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                recruiter.setTitle(request.getTitle().trim());
            }
            if (request.getContactPhone() != null && !request.getContactPhone().isBlank()) {
                recruiter.setPhone(request.getContactPhone().trim());
            }
            if (request.getTagline() != null) company.setTagline(request.getTagline().trim());
            if (request.getIndustry() != null) company.setIndustry(request.getIndustry().trim());
            if (request.getWebsite() != null) company.setWebsite(request.getWebsite().trim());
            if (request.getLocation() != null) company.setLocation(request.getLocation().trim());
            if (request.getSize() != null) company.setSize(request.getSize().trim());
            if (request.getDescription() != null) company.setDescription(request.getDescription().trim());
            if (request.getFoundedYear() != null) company.setFoundedYear(request.getFoundedYear().trim());
            if (request.getContactEmail() != null) company.setContactEmail(request.getContactEmail().trim());
            if (request.getContactPhone() != null) company.setContactPhone(request.getContactPhone().trim());
            if (request.getBusinessRegistrationNumber() != null) company.setBusinessRegistrationNumber(request.getBusinessRegistrationNumber().trim());
            if (request.getTaxId() != null) company.setTaxId(request.getTaxId().trim());
            if (request.getOfficialEmailDomain() != null) company.setOfficialEmailDomain(request.getOfficialEmailDomain().trim());
            if (request.getVerificationDocumentUrl() != null) company.setVerificationDocumentUrl(request.getVerificationDocumentUrl().trim());
            if (request.getVerificationEvidenceNotes() != null) company.setVerificationEvidenceNotes(request.getVerificationEvidenceNotes().trim());
            if (request.getAuthorizationDocumentUrl() != null) company.setAuthorizationDocumentUrl(request.getAuthorizationDocumentUrl().trim());
            if (request.getAuthorizationNotes() != null) company.setAuthorizationNotes(request.getAuthorizationNotes().trim());
        }
        company.setVerified(false);
        company.setRegistrationCheckStatus("PENDING");
        company.setAssociationCheckStatus("PENDING");
        companyRepository.save(company);

        VerificationStatus prevStatus = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.REJECTED;
        recruiter.setVerificationStatus(VerificationStatus.RESUBMITTED);
        recruiter.setResubmittedAt(Instant.now());
        if (request != null && request.getRecruiterNotes() != null) {
            recruiter.setResubmissionNotes(request.getRecruiterNotes().trim());
        }
        userRepository.save(recruiter);

        if (verificationHistoryRepository != null) {
            VerificationHistory history = new VerificationHistory(
                    recruiter, prevStatus, VerificationStatus.RESUBMITTED,
                    recruiter.getId(), recruiter.getFullName(),
                    recruiter.getRejectionCategory(),
                    "Recruiter submitted updated company information and credentials for verification review.",
                    recruiter.getCorrectiveActions(), recruiter.getAiSuggestions(),
                    true, request != null ? request.getRecruiterNotes() : null
            );
            verificationHistoryRepository.save(history);
        }

        if (notificationRepository != null) {
            userRepository.findByRole(Role.ADMIN).stream().findFirst().ifPresent(adminUser -> {
                String notifTitle = "Recruiter Verification Resubmitted";
                String notifMessage = "Recruiter " + recruiter.getFullName() + " (" + company.getName()
                        + ") has submitted updated verification information and company profile corrections for administrative review.";
                Notification notif = new Notification(adminUser, notifTitle, notifMessage, "info", "/admin/recruiters");
                notificationRepository.save(notif);
            });
        }

        if (activityLogService != null) {
            activityLogService.logActivity(
                    recruiter.getId(), recruiter.getFullName(), Role.RECRUITER,
                    "Recruiter Verification Resubmitted",
                    "Resubmitted verification application for " + company.getName(),
                    null
            );
        }

        return toVerificationDetailDTO(recruiter, company);
    }

    private RecruiterVerificationDetailDTO toVerificationDetailDTO(User recruiter, Company company) {
        RecruiterVerificationDetailDTO dto = new RecruiterVerificationDetailDTO();
        dto.setRecruiterId(recruiter.getId().toString());
        dto.setRecruiterName(recruiter.getFullName());
        dto.setRecruiterEmail(recruiter.getEmail());
        dto.setRecruiterPhone(recruiter.getPhone());
        dto.setRecruiterTitle(recruiter.getTitle());
        dto.setTitle(recruiter.getTitle());
        dto.setCreatedAt(recruiter.getCreatedAt() != null ? recruiter.getCreatedAt().toString() : null);
        dto.setUpdatedAt(recruiter.getUpdatedAt() != null ? recruiter.getUpdatedAt().toString() : null);
        dto.setEmailVerified(recruiter.getEmailVerified());
        dto.setPhoneVerified(recruiter.getPhoneVerified());

        VerificationStatus vs = recruiter.getVerificationStatus() != null ? recruiter.getVerificationStatus() : VerificationStatus.PENDING;
        dto.setVerificationStatus(vs.toFrontendStatus());
        dto.setVerified(vs == VerificationStatus.VERIFIED);
        dto.setRejectionCategory(recruiter.getRejectionCategory());
        dto.setRejectionReason(recruiter.getRejectionReason());
        dto.setCorrectiveActions(recruiter.getCorrectiveActions());
        dto.setAiSuggestions(recruiter.getAiSuggestions());
        dto.setResubmissionAllowed(recruiter.getResubmissionAllowed());
        dto.setResubmissionNotes(recruiter.getResubmissionNotes());
        dto.setVerifiedAt(recruiter.getVerifiedAt() != null ? recruiter.getVerifiedAt().toString() : null);
        dto.setVerifiedBy(recruiter.getVerifiedBy());
        dto.setResubmittedAt(recruiter.getResubmittedAt() != null ? recruiter.getResubmittedAt().toString() : null);
        
        if (company != null) {
            dto.setCompanyName(company.getName());
            dto.setRegistrationCheckStatus(company.getRegistrationCheckStatus());
            dto.setAssociationCheckStatus(company.getAssociationCheckStatus());
            dto.setAssociationVerified(company.getAssociationVerified());
        } else {
            dto.setCompanyName(recruiter.getCompanyName());
            dto.setRegistrationCheckStatus("PENDING");
            dto.setAssociationCheckStatus("PENDING");
            dto.setAssociationVerified(false);
        }

        dto.setCompany(toDTO(company));

        if (verificationHistoryRepository != null) {
            List<VerificationHistoryDTO> history = verificationHistoryRepository
                    .findByRecruiterIdOrderByCreatedAtDesc(recruiter.getId())
                    .stream()
                    .map(VerificationHistoryDTO::new)
                    .collect(Collectors.toList());
            dto.setHistory(history);
        }
        return dto;
    }
}
