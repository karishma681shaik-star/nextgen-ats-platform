package com.aiats.service;

import com.aiats.dto.auth.*;
import com.aiats.entity.*;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.DuplicateResourceException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.CandidateProfileRepository;
import com.aiats.repository.CompanyRepository;
import com.aiats.repository.PasswordResetTokenRepository;
import com.aiats.repository.UserRepository;
import com.aiats.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CompanyRepository companyRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.companyRepository = companyRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        Role role = Role.fromString(request.getRole());
        if (role == Role.ADMIN) {
            throw new BadRequestException("Administrator registration cannot be performed via public API");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullName(request.getName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setAvatarUrl(role == Role.RECRUITER
                ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");

        if (role == Role.RECRUITER && request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            user.setCompanyName(request.getCompanyName().trim());
        }

        User savedUser = userRepository.save(user);

        // Create default profile for candidate or company for recruiter
        if (role == Role.CANDIDATE) {
            CandidateProfile profile = new CandidateProfile(savedUser);
            profile.setTitle("Software Engineer");
            profile.setLocation("San Francisco, CA");
            profile.setProfileCompletion(40);
            candidateProfileRepository.save(profile);
        } else if (role == Role.RECRUITER) {
            Company company = new Company();
            company.setRecruiter(savedUser);
            company.setName(request.getCompanyName() != null && !request.getCompanyName().isBlank()
                    ? request.getCompanyName() : savedUser.getFullName() + "'s Organization");
            company.setContactEmail(savedUser.getEmail());
            company.setVerified(true);
            company.setLogo("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80");
            companyRepository.save(company);
        }

        String token = tokenProvider.generateTokenFromUser(
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name(), savedUser.getFullName()
        );

        return new AuthResponse(token, new UserDTO(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(token, new UserDTO(user));
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return new UserDTO(user);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            // Silently return to prevent user enumeration attacks
            return;
        }

        User user = userOpt.get();

        // Invalidate previous tokens
        passwordResetTokenRepository.findByUserAndUsedFalse(user).ifPresent(t -> {
            t.setUsed(true);
            passwordResetTokenRepository.save(t);
        });

        String resetToken = UUID.randomUUID().toString().replace("-", "");
        Instant expiryDate = Instant.now().plus(1, ChronoUnit.HOURS);

        PasswordResetToken tokenEntity = new PasswordResetToken(resetToken, user, expiryDate);
        passwordResetTokenRepository.save(tokenEntity);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or non-existent password reset token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
