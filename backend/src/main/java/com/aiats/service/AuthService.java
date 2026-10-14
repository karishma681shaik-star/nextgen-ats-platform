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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import com.aiats.security.LoginRateLimiter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final LoginRateLimiter loginRateLimiter;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final SecurityAlertService securityAlertService;

    public AuthService(UserRepository userRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CompanyRepository companyRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService) {
        this(userRepository, candidateProfileRepository, companyRepository,
             passwordResetTokenRepository, passwordEncoder, authenticationManager,
             tokenProvider, emailService, null, null, null, null);
    }

    public AuthService(UserRepository userRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CompanyRepository companyRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService,
                       LoginRateLimiter loginRateLimiter) {
        this(userRepository, candidateProfileRepository, companyRepository,
             passwordResetTokenRepository, passwordEncoder, authenticationManager,
             tokenProvider, emailService, loginRateLimiter, null, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CompanyRepository companyRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService,
                       LoginRateLimiter loginRateLimiter,
                       ActivityLogService activityLogService,
                       NotificationService notificationService,
                       SecurityAlertService securityAlertService) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.companyRepository = companyRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.loginRateLimiter = loginRateLimiter != null ? loginRateLimiter : new LoginRateLimiter();
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
        this.securityAlertService = securityAlertService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isBlank()) {
            throw new BadRequestException("Email address is required.");
        }
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Role requestedRole = Role.fromString(request.getRole());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        null,
                        normalizedEmail,
                        requestedRole != null ? requestedRole.name() : "UNKNOWN",
                        "DUPLICATE_REGISTRATION_ATTEMPT",
                        "MEDIUM",
                        "Repeated registration request detected for existing email address: " + normalizedEmail,
                        "Verify whether legitimate user forgot password or unauthorized user is probing registration."
                );
            }
            throw new DuplicateResourceException("An account with this email address already exists. Please sign in or use the supported account recovery process.");
        }

        // Single-Administrator Policy: Public registration of ADMIN accounts is strictly prohibited.
        if (requestedRole == Role.ADMIN) {
            logger.warn("SECURITY AUDIT: Attempted public registration as ADMIN rejected for email: {}", normalizedEmail);
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        null,
                        normalizedEmail,
                        "ANONYMOUS",
                        "ADMIN_IMPERSONATION_ATTEMPT",
                        "HIGH",
                        "Attempted public registration specifying role=ADMIN for email: " + normalizedEmail,
                        "Enforced single administrator policy. Operation blocked."
                );
            }
            throw new BadRequestException("Public registration of Administrator accounts is strictly prohibited. The platform operates under a single designated administrator policy.");
        }

        if (request.getName() != null && "Marcus Vance".equalsIgnoreCase(request.getName().trim())) {
            if (securityAlertService != null) {
                securityAlertService.createAlert(
                        null,
                        normalizedEmail,
                        "ANONYMOUS",
                        "ADMIN_NAME_RESERVATION_BREACH",
                        "MEDIUM",
                        "Attempted registration using reserved Lead Administrator name 'Marcus Vance'.",
                        "Operation blocked."
                );
            }
            throw new BadRequestException("The specified account name is reserved for platform governance.");
        }

        // Only CANDIDATE or RECRUITER can be created via public registration
        Role role = (requestedRole == Role.RECRUITER) ? Role.RECRUITER : Role.CANDIDATE;

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.getName() != null ? request.getName().trim() : "");
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);

        if (role == Role.RECRUITER) {
            user.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
            user.setVerificationStatus(VerificationStatus.PENDING); // CRITICAL: Newly registered recruiters default to PENDING
            if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
                user.setCompanyName(request.getCompanyName().trim());
            }
        } else {
            user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            user.setVerificationStatus(VerificationStatus.VERIFIED);
        }

        User savedUser = userRepository.save(user);

        // Create default profile for candidate or company for recruiter
        if (role == Role.CANDIDATE) {
            CandidateProfile profile = new CandidateProfile(savedUser);
            profile.setTitle("Software Engineer");
            profile.setLocation("San Francisco, CA");
            profile.setProfileCompletion(40);
            candidateProfileRepository.save(profile);

            if (activityLogService != null) {
                activityLogService.logActivity(savedUser.getId(), savedUser.getFullName(), Role.CANDIDATE,
                        "Candidate Registered", savedUser.getEmail(), null);
            }
        } else if (role == Role.RECRUITER) {
            Company company = new Company();
            company.setRecruiter(savedUser);
            company.setName(request.getCompanyName() != null && !request.getCompanyName().isBlank()
                    ? request.getCompanyName() : savedUser.getFullName() + "'s Organization");
            company.setContactEmail(savedUser.getEmail());
            company.setVerified(false); // CRITICAL: Must be verified by Admin before publishing jobs!
            company.setLogo("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80");
            companyRepository.save(company);

            // Notify Lead Administrator of new recruiter requiring verification review
            if (notificationService != null) {
                userRepository.findByEmailIgnoreCase("admin@ai-ats.internal").ifPresent(admin -> {
                    notificationService.createNotification(
                            admin,
                            "New Recruiter Verification Required",
                            "Recruiter " + savedUser.getFullName() + " (" + company.getName() + ") has registered and requires administrator verification before publishing jobs.",
                            "info",
                            "/admin/recruiters"
                    );
                });
            }

            if (activityLogService != null) {
                activityLogService.logActivity(savedUser.getId(), savedUser.getFullName(), Role.RECRUITER,
                        "Recruiter Registered", company.getName(), null);
            }
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

    /**
     * Dedicated secure single-administrator login bridge:
     * 1. Rate-limited to prevent brute-force attacks.
     * 2. Authenticates credentials against Spring Security.
     * 3. Strictly verifies that the authenticated user has the ADMIN role.
     * 4. Logs audit information and emits generic error on unauthorized attempts.
     */
    public AuthResponse adminLogin(LoginRequest request, String clientIp) {
        String rateLimitKey = (clientIp != null ? clientIp : "127.0.0.1") + ":" +
                (request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "");

        if (loginRateLimiter.isBlocked(rateLimitKey)) {
            logger.warn("SECURITY AUDIT: Throttled admin login attempt from IP [{}] for key [{}]", clientIp, rateLimitKey);
            if (activityLogService != null) {
                activityLogService.logDetailedActivity(
                        null, "Anonymous", Role.ADMIN,
                        "Admin Login Throttled", "SECURITY_LOCKOUT_TRIGGERED", "AUTHENTICATION_SECURITY",
                        "HIGH", "BLOCKED",
                        request.getEmail(), "SECURITY_EVENT", null,
                        null, "LOCKED", "Rate limit lockout triggered: 5 consecutive failures",
                        clientIp, null
                );
            }
            throw new BadRequestException("Too many failed authentication attempts. Temporary security lockout active. Please try again in 5 minutes.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim().toLowerCase(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new BadCredentialsException("Invalid administrator credentials or unauthorized access."));

            // Verify account status
            if (user.getStatus() != UserStatus.ACTIVE) {
                loginRateLimiter.recordFailedAttempt(rateLimitKey);
                throw new BadRequestException("Administrator account is currently " + user.getStatus().name().toLowerCase() + ". Access denied.");
            }

            // Strictly verify that account holds the authorized ADMIN role
            if (user.getRole() != Role.ADMIN) {
                loginRateLimiter.recordFailedAttempt(rateLimitKey);
                logger.warn("SECURITY ALERT: Non-admin account [{}] with role [{}] attempted access via Admin Login from IP [{}]",
                        user.getEmail(), user.getRole(), clientIp);
                if (activityLogService != null) {
                    activityLogService.logDetailedActivity(
                            user.getId(), user.getFullName(), user.getRole(),
                            "Unauthorized Admin Login Attempt", "UNAUTHORIZED_ADMIN_ACCESS", "AUTHENTICATION_SECURITY",
                            "HIGH", "BLOCKED",
                            user.getEmail(), "SECURITY_EVENT", user.getId().toString(),
                            null, null, "Non-admin account attempted administrator login",
                            clientIp, null
                    );
                }
                // Return generic error without revealing that the user exists
                throw new BadCredentialsException("Invalid administrator credentials or unauthorized access.");
            }

            loginRateLimiter.recordSuccess(rateLimitKey);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);

            logger.info("SECURITY AUDIT: Authorized administrator [{}] logged in successfully from IP [{}]",
                    user.getEmail(), clientIp);

            if (activityLogService != null) {
                activityLogService.logDetailedActivity(
                        user.getId(), user.getFullName(), Role.ADMIN,
                        "Administrator Authenticated", "ADMIN_LOGIN_SUCCESS", "AUTHENTICATION_SECURITY",
                        "INFO", "SUCCESS",
                        "Governance Console", "SYSTEM", user.getId().toString(),
                        null, "AUTHENTICATED", "Single-administrator session initialized",
                        clientIp, null
                );
            }

            return new AuthResponse(token, new UserDTO(user));
        } catch (AuthenticationException ex) {
            loginRateLimiter.recordFailedAttempt(rateLimitKey);
            if (activityLogService != null) {
                activityLogService.logDetailedActivity(
                        null, "Anonymous", Role.ADMIN,
                        "Failed Administrator Login", "ADMIN_LOGIN_FAILED", "AUTHENTICATION_SECURITY",
                        "WARNING", "FAILURE",
                        request.getEmail(), "SECURITY_EVENT", null,
                        null, null, "Invalid administrator credentials or unauthorized access",
                        clientIp, null
                );
            }
            throw new BadCredentialsException("Invalid administrator credentials or unauthorized access.");
        }
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
}
