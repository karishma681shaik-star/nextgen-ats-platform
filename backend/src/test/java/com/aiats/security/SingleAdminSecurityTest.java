package com.aiats.security;

import com.aiats.dto.auth.AdminBootstrapRequest;
import com.aiats.dto.auth.LoginRequest;
import com.aiats.dto.auth.RegisterRequest;
import com.aiats.entity.Role;
import com.aiats.entity.User;
import com.aiats.entity.UserStatus;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.DuplicateResourceException;
import com.aiats.repository.CandidateProfileRepository;
import com.aiats.repository.CompanyRepository;
import com.aiats.repository.PasswordResetTokenRepository;
import com.aiats.repository.UserRepository;
import com.aiats.service.AuthService;
import com.aiats.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SingleAdminSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    static class TestEmailService extends EmailService {
        public TestEmailService() {
            super(null);
        }
    }

    private EmailService emailService;
    private JwtTokenProvider tokenProvider;
    private LoginRateLimiter rateLimiter;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        emailService = new TestEmailService();
        tokenProvider = new JwtTokenProvider(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86400000
        );
        rateLimiter = new LoginRateLimiter();
        authService = new AuthService(
                userRepository,
                candidateProfileRepository,
                companyRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                emailService,
                rateLimiter
        );
    }

    @Test
    @DisplayName("TEST 7: Public registration with role=ADMIN must be strictly rejected")
    void testPublicRegistration_withAdminRole_isStrictlyRejected() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Attacker");
        request.setEmail("attacker@malicious.com");
        request.setPassword("Password123!");
        request.setRole("ADMIN");

        when(userRepository.existsByEmailIgnoreCase("attacker@malicious.com")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("Public registration of Administrator accounts is strictly prohibited"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST 7b: Public registration as CANDIDATE creates Candidate only")
    void testPublicRegistration_candidateSucceeds() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("Password123!");
        request.setRole("CANDIDATE");

        when(userRepository.existsByEmailIgnoreCase("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_pass");

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail("john@example.com");
        savedUser.setFullName("John Doe");
        savedUser.setRole(Role.CANDIDATE);
        savedUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        var response = authService.register(request);

        assertNotNull(response);
        assertEquals("candidate", response.getUser().getRole());
        assertNotNull(response.getToken());
    }

    @Test
    @DisplayName("TEST 9: Admin login with Candidate account is denied access")
    void testAdminLogin_withCandidateAccount_denied() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex.rivera@example.com");
        request.setPassword("Password123!");

        Authentication mockAuth = new UsernamePasswordAuthenticationToken("alex.rivera@example.com", "Password123!");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);

        User candidate = new User();
        candidate.setId(UUID.randomUUID());
        candidate.setEmail("alex.rivera@example.com");
        candidate.setFullName("Alex Rivera");
        candidate.setRole(Role.CANDIDATE);
        candidate.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmailIgnoreCase("alex.rivera@example.com"))
                .thenReturn(Optional.of(candidate));

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> {
            authService.adminLogin(request, "127.0.0.1");
        });

        assertEquals("Invalid administrator credentials or unauthorized access.", ex.getMessage());
    }

    @Test
    @DisplayName("TEST 6: Authorized Administrator logs in successfully through Admin Login bridge")
    void testAdminLogin_withAuthorizedAdmin_succeeds() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@ai-ats.internal");
        request.setPassword("Password123!");

        User admin = new User();
        admin.setId(UUID.randomUUID());
        admin.setEmail("admin@ai-ats.internal");
        admin.setFullName("Marcus Vance");
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);

        UserPrincipal principal = new UserPrincipal(admin);
        Authentication mockAuth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);

        when(userRepository.findByEmailIgnoreCase("admin@ai-ats.internal"))
                .thenReturn(Optional.of(admin));

        var response = authService.adminLogin(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("admin", response.getUser().getRole());
        assertNotNull(response.getToken());
        assertTrue(tokenProvider.validateToken(response.getToken()));
        assertEquals(admin.getId(), tokenProvider.getUserIdFromJWT(response.getToken()));
    }

    @Test
    @DisplayName("TEST 8: Brute-force rate limiting locks out excessive failed attempts")
    void testLoginRateLimiting_blocksExcessiveFailures() {
        String key = "192.168.1.100:admin@test.com";

        assertFalse(rateLimiter.isBlocked(key));

        for (int i = 0; i < 4; i++) {
            rateLimiter.recordFailedAttempt(key);
            assertFalse(rateLimiter.isBlocked(key));
        }

        // 5th failed attempt triggers lockout
        rateLimiter.recordFailedAttempt(key);
        assertTrue(rateLimiter.isBlocked(key));

        LoginRequest req = new LoginRequest();
        req.setEmail("admin@test.com");
        req.setPassword("WrongPassword");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.adminLogin(req, "192.168.1.100");
        });

        assertTrue(ex.getMessage().contains("Too many failed authentication attempts"));
    }

    @Test
    @DisplayName("TEST 11: Invalid or tampered JWT token is rejected")
    void testTamperedJwt_isRejected() {
        assertFalse(tokenProvider.validateToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }

    @Test
    @DisplayName("TEST 9: Initial admin bootstrap provisions sole administrator")
    void testBootstrapAdmin_success() {
        authService.setConfiguredBootstrapToken("secure-test-token-12345");

        when(userRepository.countByRole(Role.ADMIN)).thenReturn(0L);
        when(userRepository.existsByEmailIgnoreCase("newadmin@company.internal")).thenReturn(false);
        when(passwordEncoder.encode("StrongPassword123!")).thenReturn("hashed_strong_pass");

        User savedAdmin = new User();
        savedAdmin.setId(UUID.randomUUID());
        savedAdmin.setEmail("newadmin@company.internal");
        savedAdmin.setFullName("Platform Chief Admin");
        savedAdmin.setRole(Role.ADMIN);
        savedAdmin.setStatus(UserStatus.ACTIVE);

        when(userRepository.save(any(User.class))).thenReturn(savedAdmin);

        AdminBootstrapRequest request = new AdminBootstrapRequest(
                "Platform Chief Admin",
                "newadmin@company.internal",
                "StrongPassword123!",
                "secure-test-token-12345"
        );

        var response = authService.bootstrapAdmin(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals("admin", response.getUser().getRole());
        assertEquals("newadmin@company.internal", response.getUser().getEmail());
        assertNotNull(response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("TEST 10: Repeated admin bootstrap is rejected with 409 Conflict / DuplicateResourceException")
    void testBootstrapAdmin_repeatedBootstrap_rejected() {
        authService.setConfiguredBootstrapToken("secure-test-token-12345");

        // Admin already exists in DB
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        AdminBootstrapRequest request = new AdminBootstrapRequest(
                "Second Admin",
                "attacker@company.internal",
                "StrongPassword123!",
                "secure-test-token-12345"
        );

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> {
            authService.bootstrapAdmin(request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("Administrator account has already been provisioned"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST 10b: Admin bootstrap with invalid token is rejected with BadRequestException")
    void testBootstrapAdmin_invalidToken_rejected() {
        authService.setConfiguredBootstrapToken("correct-token-999");

        when(userRepository.countByRole(Role.ADMIN)).thenReturn(0L);

        AdminBootstrapRequest request = new AdminBootstrapRequest(
                "Attacker Admin",
                "attacker@company.internal",
                "StrongPassword123!",
                "wrong-token"
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.bootstrapAdmin(request, "127.0.0.1");
        });

        assertTrue(ex.getMessage().contains("Invalid bootstrap token"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("TEST 12: Profile update cannot change user role to ADMIN")
    void testUpdateProfile_cannotChangeUserRole() {
        UUID userId = UUID.randomUUID();
        User candidate = new User();
        candidate.setId(userId);
        candidate.setEmail("candidate@test.com");
        candidate.setFullName("Normal Candidate");
        candidate.setRole(Role.CANDIDATE);
        candidate.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(userId)).thenReturn(Optional.of(candidate));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var updated = authService.updateProfile(userId, "Updated Candidate Name", "https://avatar.url/pic.png", "127.0.0.1");

        assertNotNull(updated);
        assertEquals("candidate", updated.getRole());
        assertEquals("Updated Candidate Name", updated.getName());
        assertEquals(Role.CANDIDATE, candidate.getRole());
    }
}
