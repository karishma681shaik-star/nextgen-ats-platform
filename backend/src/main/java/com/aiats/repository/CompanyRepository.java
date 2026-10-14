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

    long countByVerifiedTrue();
    long countByVerifiedFalse();
    long countByAssociationCheckStatus(String status);
    long countByRegistrationCheckStatus(String status);
    long countByReverificationRequiredTrue();
    long countByNameIgnoreCaseAndIdNot(String name, UUID id);
    long countByWebsiteIgnoreCaseAndIdNot(String website, UUID id);
    Optional<Company> findByNameIgnoreCase(String name);
}
