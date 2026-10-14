package com.aiats.repository;

import com.aiats.entity.Role;
import com.aiats.entity.User;
import com.aiats.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
    long countByRole(Role role);
    long countByStatus(UserStatus status);
    long countByRoleAndStatus(Role role, UserStatus status);
    long countByRoleAndVerificationStatus(Role role, com.aiats.entity.VerificationStatus verificationStatus);
    long countByRoleAndRiskLevel(Role role, String riskLevel);
    long countByCreatedAtAfter(java.time.Instant date);
    long countByRoleAndCreatedAtAfter(Role role, java.time.Instant date);
    List<User> findByRoleAndCompanyNameIgnoreCase(Role role, String companyName);
    List<User> findByRoleAndVerificationStatusOrderByCreatedAtDesc(Role role, com.aiats.entity.VerificationStatus verificationStatus);
    List<User> findByVerificationStatusOrderByCreatedAtDesc(com.aiats.entity.VerificationStatus verificationStatus);

    @Query("SELECT u FROM User u WHERE u.role = :role AND (u.verificationStatus IS NULL OR u.verificationStatus != :excludedStatus) ORDER BY u.createdAt DESC")
    List<User> findByRoleAndVerificationStatusNotOrderByCreatedAtDesc(@Param("role") Role role, @Param("excludedStatus") com.aiats.entity.VerificationStatus excludedStatus);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:vStatus IS NULL OR u.verificationStatus = :vStatus) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(u.email) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(u.companyName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%')) " +
           "ORDER BY u.createdAt DESC")
    List<User> filterUsers(
            @Param("role") Role role,
            @Param("status") UserStatus status,
            @Param("vStatus") com.aiats.entity.VerificationStatus vStatus,
            @Param("search") String search);
}
