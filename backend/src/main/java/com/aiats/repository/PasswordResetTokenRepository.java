package com.aiats.repository;

import com.aiats.entity.PasswordResetToken;
import com.aiats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    Optional<PasswordResetToken> findByTokenAndUserAndUsedFalse(String token, User user);
    List<PasswordResetToken> findAllByUserAndUsedFalse(User user);
    Optional<PasswordResetToken> findByUserAndUsedFalse(User user);
}
