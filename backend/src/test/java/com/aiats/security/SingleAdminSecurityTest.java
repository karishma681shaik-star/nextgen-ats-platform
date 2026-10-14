package com.aiats.security;

import com.aiats.dto.auth.LoginRequest;
import com.aiats.dto.auth.RegisterRequest;
import com.aiats.entity.Role;
import com.aiats.entity.User;
import com.aiats.entity.UserStatus;
import com.aiats.exception.BadRequestException;
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
}
