package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.job.JobDTO;
import com.aiats.dto.publiccareer.PublicCompanyDTO;
import com.aiats.entity.Company;
import com.aiats.entity.Job;
import com.aiats.entity.User;
import com.aiats.entity.VerificationStatus;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.CompanyRepository;
import com.aiats.repository.JobRepository;
import com.aiats.repository.UserRepository;
import com.aiats.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class PublicCareerController {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    public PublicCareerController(CompanyRepository companyRepository,
                                  UserRepository userRepository,
                                  JobRepository jobRepository,
                                  JobService jobService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.jobService = jobService;
    }

    @GetMapping("/companies/{identifier}")
    public ResponseEntity<ApiResponse<PublicCompanyDTO>> getPublicCompanyProfile(@PathVariable String identifier) {
        Company company = resolveCompany(identifier);
        long activeJobsCount = jobRepository.findPublicActiveJobsByCompanyId(company.getId()).size();
        PublicCompanyDTO dto = toPublicDTO(company, activeJobsCount);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/companies/{identifier}/jobs")
    public ResponseEntity<ApiResponse<List<JobDTO>>> getPublicCompanyJobs(@PathVariable String identifier) {
        Company company = resolveCompany(identifier);
        List<Job> activeJobs = jobRepository.findPublicActiveJobsByCompanyId(company.getId());
        List<JobDTO> dtos = activeJobs.stream()
                .map(j -> jobService.toDTO(j, null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    private Company resolveCompany(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ResourceNotFoundException("Company identifier cannot be empty");
        }

        String cleaned = identifier.trim();

        // 1. Try UUID lookup: by Company ID, by Recruiter User ID
        try {
            UUID uuid = UUID.fromString(cleaned);
            Optional<Company> byCompId = companyRepository.findById(uuid);
            if (byCompId.isPresent()) {
                return byCompId.get();
            }

            Optional<Company> byRecruiter = companyRepository.findByRecruiterId(uuid);
            if (byRecruiter.isPresent()) {
                return byRecruiter.get();
            }
        } catch (IllegalArgumentException ignored) {
            // Not a UUID, proceed to name/slug lookup
        }

        // 2. Try lookup by company name case-insensitively
        Optional<Company> byName = companyRepository.findByNameIgnoreCase(cleaned);
        if (byName.isPresent()) {
            return byName.get();
        }

        // 3. Try slug matching (e.g. "cloudscale-technologies" -> "CloudScale Technologies")
        String slugCleaned = cleaned.replace("-", " ").toLowerCase();
        for (Company c : companyRepository.findAll()) {
            if (c.getName() != null && c.getName().toLowerCase().replace("-", " ").equals(slugCleaned)) {
                return c;
            }
        }

        // 4. Try recruiter email match
        Optional<User> recruiterOpt = userRepository.findByEmailIgnoreCase(cleaned);
        if (recruiterOpt.isPresent()) {
            Optional<Company> byRecruiter = companyRepository.findByRecruiterId(recruiterOpt.get().getId());
            if (byRecruiter.isPresent()) {
                return byRecruiter.get();
            }
        }

        throw new ResourceNotFoundException("Company career portal not found for: " + identifier);
    }

    private PublicCompanyDTO toPublicDTO(Company c, long activeJobsCount) {
        PublicCompanyDTO dto = new PublicCompanyDTO();
        dto.setId(c.getId().toString());
        dto.setName(c.getName());
        dto.setLogo(c.getLogo());
        dto.setTagline(c.getTagline());
        dto.setIndustry(c.getIndustry());
        dto.setWebsite(c.getWebsite());
        dto.setLocation(c.getLocation());
        dto.setSize(c.getSize());
        dto.setDescription(c.getDescription());
        dto.setFoundedYear(c.getFoundedYear());
        dto.setContactEmail(c.getContactEmail());
        dto.setVerified(c.isVerified());
        dto.setActiveJobsCount(activeJobsCount);

        if (c.getRecruiter() != null) {
            dto.setRecruiterName(c.getRecruiter().getFullName());
            dto.setRecruiterVerified(c.getRecruiter().getVerificationStatus() == VerificationStatus.VERIFIED);
        }

        if (c.getBenefits() != null && !c.getBenefits().isBlank()) {
            dto.setBenefits(Arrays.asList(c.getBenefits().split(",")));
        } else {
            dto.setBenefits(Collections.emptyList());
        }

        return dto;
    }
}
