package com.aiats.service;

import com.aiats.dto.admin.AdminStatsDTO;
import com.aiats.dto.auth.UserDTO;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;

    public AdminService(UserRepository userRepository, JobRepository jobRepository,
                        ApplicationRepository applicationRepository, CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        AdminStatsDTO dto = new AdminStatsDTO();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalCandidates(userRepository.countByRole(Role.CANDIDATE));
        dto.setTotalRecruiters(userRepository.countByRole(Role.RECRUITER));
        dto.setTotalJobs(jobRepository.count());
        dto.setActiveJobs(jobRepository.countByStatus(JobStatus.ACTIVE));
        dto.setTotalApplications(applicationRepository.count());
        dto.setPendingApplications(applicationRepository.countByStatus(ApplicationStatus.APPLIED));
        dto.setTotalCompanies(companyRepository.count());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(String roleFilter) {
        List<User> users;
        if (roleFilter != null && !roleFilter.equalsIgnoreCase("all")) {
            try {
                Role role = Role.valueOf(roleFilter.toUpperCase());
                users = userRepository.findByRole(role);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll();
            }
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(this::toUserDTO).collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserStatus(UUID userId, String statusStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        try {
            UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());
            user.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }
        return toUserDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot delete admin accounts");
        }
        userRepository.delete(user);
    }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId().toString());
        dto.setName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().name().toLowerCase());
        dto.setAvatar(u.getAvatarUrl());
        dto.setStatus(u.getStatus().name().toLowerCase());
        dto.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        dto.setPhone(u.getPhone());
        dto.setCompanyName(u.getCompanyName());
        return dto;
    }
}
