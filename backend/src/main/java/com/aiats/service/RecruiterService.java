package com.aiats.service;

import com.aiats.dto.recruiter.CompanyDTO;
import com.aiats.dto.recruiter.RecruiterStatsDTO;
import com.aiats.entity.*;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class RecruiterService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

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
        long shortlisted = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW);
        long hires = applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED);

        RecruiterStatsDTO dto = new RecruiterStatsDTO();
        dto.setActiveJobs(activeJobs);
        dto.setTotalApplicants(totalApplicants);
        dto.setShortlisted(shortlisted);
        dto.setInterviewsScheduled(interviews);
        dto.setHiresThisMonth(hires);
        dto.setAverageTimeToHireDays(15);
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
        if (company.getBenefits() != null && !company.getBenefits().isBlank())
            dto.setBenefits(Arrays.asList(company.getBenefits().split(",")));
        return dto;
    }
}
