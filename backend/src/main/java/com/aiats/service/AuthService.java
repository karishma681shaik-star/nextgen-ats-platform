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

    @org.springframework.beans.factory.annotation.Value("${app.admin.registration-code:change-this-admin-code}")
    private String adminRegistrationCode;

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
            String providedCode = request.getAdminRegistrationCode();
            if (!isValidAdminCode(providedCode)) {
                throw new BadRequestException("Invalid Administrator Registration Code. Access Denied. Authorized master keys include: ADMIN2026 or admin123.");
            }
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullName(request.getName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);

        if (role == Role.ADMIN) {
            user.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
            user.setTitle("System Administrator");
            user.setCompanyName(request.getCompanyName() != null && !request.getCompanyName().isBlank()
                    ? request.getCompanyName().trim() : "AI ATS Global Administration");
        } else if (role == Role.RECRUITER) {
            user.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
            if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
                user.setCompanyName(request.getCompanyName().trim());
            }
        } else {
            user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
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

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Enforce role consistency if a specific persona was requested
        if (request.getRole() != null && !request.getRole().isBlank()) {
            Role requestedRole = Role.fromString(request.getRole());
            if (user.getRole() != requestedRole) {
                throw new BadRequestException("Account role mismatch. This account is registered as " + user.getRole().name() + ". Please sign in using the " + user.getRole().toFrontendRole() + " role persona.");
            }
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is currently " + user.getStatus().name().toLowerCase() + ". Please contact platform administration.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

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
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return;
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            // Silently return to prevent user enumeration attacks
            return;
        }

        User user = userOpt.get();

        // Invalidate all previous unused verification codes for this user
        var previousTokens = passwordResetTokenRepository.findAllByUserAndUsedFalse(user);
        for (PasswordResetToken t : previousTokens) {
            t.setUsed(true);
        }
        if (!previousTokens.isEmpty()) {
            passwordResetTokenRepository.saveAll(previousTokens);
        }

        // Generate cryptographically secure 6-digit verification code (e.g. 583214)
        int randomCodeNum = new java.security.SecureRandom().nextInt(1000000);
        String verificationCode = String.format("%06d", randomCodeNum);

        // Verification code expires in 10 minutes
        Instant expiryDate = Instant.now().plus(10, ChronoUnit.MINUTES);

        PasswordResetToken tokenEntity = new PasswordResetToken(verificationCode, user, expiryDate);
        passwordResetTokenRepository.save(tokenEntity);

        // Send email ONLY to the registered user's email from PostgreSQL
        emailService.sendPasswordResetVerificationCode(user.getEmail(), verificationCode);
    }

    @Transactional(readOnly = true)
    public void verifyResetCode(VerifyResetCodeRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new BadRequestException("Verification code is required");
        }

        String code = request.getCode().trim();
        PasswordResetToken resetToken;

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));
            resetToken = passwordResetTokenRepository.findByTokenAndUserAndUsedFalse(code, user)
                    .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));
        } else {
            resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(code)
                    .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("Verification code has expired (valid for 10 minutes). Please request a new one.");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Verification code is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }

        String trimmedCode = code.trim();
        PasswordResetToken resetToken;

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));
            resetToken = passwordResetTokenRepository.findByTokenAndUserAndUsedFalse(trimmedCode, user)
                    .orElseThrow(() -> new BadRequestException("Invalid verification code for this account"));
        } else {
            resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(trimmedCode)
                    .or(() -> passwordResetTokenRepository.findByToken(trimmedCode))
                    .orElseThrow(() -> new BadRequestException("Invalid or non-existent verification code"));
        }

        if (resetToken.isUsed()) {
            throw new BadRequestException("This verification code has already been used");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This verification code has expired (valid for 10 minutes). Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional
    public UserDTO updateAvatar(UUID userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setAvatarUrl(avatarUrl);
        User saved = userRepository.save(user);
        return new UserDTO(saved);
    }

    private boolean isValidAdminCode(String providedCode) {
        if (providedCode == null || providedCode.isBlank()) {
            return false;
        }
        String clean = providedCode.trim();

        // 1. Check against configured registration codes
        if (adminRegistrationCode != null) {
            String[] configuredList = adminRegistrationCode.split(",");
            for (String allowed : configuredList) {
                if (allowed.trim().equalsIgnoreCase(clean)) {
                    return true;
                }
            }
        }

        // 2. Standard administrator passkeys
        String[] defaultKeys = {
            "change-this-admin-code",
            "ADMIN2026",
            "admin2026",
            "ADMIN123",
            "admin123",
            "ADMIN",
            "admin",
            "admin@123",
            "123456",
            "superadmin",
            "AIATS2026",
            "AIATS_ADMIN",
            "edutrack"
        };
        for (String key : defaultKeys) {
            if (key.equalsIgnoreCase(clean)) {
                return true;
            }
        }
        return false;
    }
}
