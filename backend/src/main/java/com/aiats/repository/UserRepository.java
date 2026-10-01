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
    long countByRole(Role role);
    long countByStatus(UserStatus status);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(u.email) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%') " +
           "OR LOWER(u.companyName) LIKE CONCAT('%', LOWER(CAST(:search AS String)), '%'))")
    List<User> searchUsers(@Param("role") Role role, @Param("search") String search);
}
