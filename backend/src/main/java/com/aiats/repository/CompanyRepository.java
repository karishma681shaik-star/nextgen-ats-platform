package com.aiats.repository;

import com.aiats.entity.Company;
import com.aiats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByRecruiter(User recruiter);
    Optional<Company> findByRecruiterId(UUID recruiterId);
}
