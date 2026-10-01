package com.aiats.service;

import com.aiats.dto.auth.ForgotPasswordRequest;
import com.aiats.dto.auth.ResetPasswordRequest;
import com.aiats.entity.PasswordResetToken;
import com.aiats.entity.Role;
import com.aiats.entity.User;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.CandidateProfileRepository;
import com.aiats.repository.CompanyRepository;
import com.aiats.repository.PasswordResetTokenRepository;
import com.aiats.repository.UserRepository;
import com.aiats.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServicePasswordResetTest {

    private UserRepository userRepository;
    private CandidateProfileRepository candidateProfileRepository;
    private CompanyRepository companyRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtTokenProvider tokenProvider;
    private TestEmailService emailService;
    private AuthService authService;

    private User testUser;

    static class TestEmailService extends EmailService {
        String sentEmail;
        String sentToken;
        int sendCount = 0;

        public TestEmailService() {
            super(null);
        }

        @Override
        public void sendPasswordResetVerificationCode(String toEmail, String verificationCode) {
            this.sentEmail = toEmail;
            this.sentToken = verificationCode;
            this.sendCount++;
        }

        @Override
        public void sendPasswordResetEmail(String toEmail, String token) {
            sendPasswordResetVerificationCode(toEmail, token);
        }
    }

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        candidateProfileRepository = mock(CandidateProfileRepository.class);
        companyRepository = mock(CompanyRepository.class);
        passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        authenticationManager = mock(AuthenticationManager.class);
        tokenProvider = new JwtTokenProvider("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970", 86400000);
        emailService = new TestEmailService();

        authService = new AuthService(
                userRepository,
                candidateProfileRepository,
                companyRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                emailService
        );

        testUser = new User("test@example.com", "hashed_old_pw", "Test User", Role.CANDIDATE);
    }

    @Test
    void testForgotPassword_ExistingUser_Generates6DigitCodeAndSendsEmail() {
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findAllByUserAndUsedFalse(testUser)).thenReturn(Collections.emptyList());

        authService.requestPasswordReset(new ForgotPasswordRequest("TEST@example.com"));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertNotNull(savedToken.getToken());
        assertEquals(6, savedToken.getToken().length());
        assertTrue(savedToken.getToken().matches("^\\d{6}$"));
        assertEquals(testUser, savedToken.getUser());
        assertFalse(savedToken.isUsed());
        assertTrue(savedToken.getExpiryDate().isAfter(Instant.now()));

        assertEquals(1, emailService.sendCount);
        assertEquals("test@example.com", emailService.sentEmail);
        assertEquals(savedToken.getToken(), emailService.sentToken);
    }

    @Test
    void testForgotPassword_ExistingUser_InvalidatesPreviousTokens() {
        PasswordResetToken oldToken = new PasswordResetToken("123456", testUser, Instant.now().plus(10, ChronoUnit.MINUTES));
        assertFalse(oldToken.isUsed());

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findAllByUserAndUsedFalse(testUser)).thenReturn(List.of(oldToken));

        authService.requestPasswordReset(new ForgotPasswordRequest("test@example.com"));

        assertTrue(oldToken.isUsed());
        verify(passwordResetTokenRepository).saveAll(List.of(oldToken));
    }

    @Test
    void testForgotPassword_UnknownUser_SafeReturnWithoutExceptionOrEmail() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.requestPasswordReset(new ForgotPasswordRequest("unknown@example.com")));

        verify(passwordResetTokenRepository, never()).save(any());
        assertEquals(0, emailService.sendCount);
    }

    @Test
    void testVerifyResetCode_ValidCode_Success() {
        String code = "583214";
        PasswordResetToken resetToken = new PasswordResetToken(code, testUser, Instant.now().plus(10, ChronoUnit.MINUTES));

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findByTokenAndUserAndUsedFalse(code, testUser)).thenReturn(Optional.of(resetToken));

        assertDoesNotThrow(() -> authService.verifyResetCode(new com.aiats.dto.auth.VerifyResetCodeRequest("test@example.com", code)));
    }

    @Test
    void testVerifyResetCode_ExpiredCode_ThrowsBadRequestException() {
        String code = "583214";
        PasswordResetToken resetToken = new PasswordResetToken(code, testUser, Instant.now().minus(1, ChronoUnit.MINUTES));

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findByTokenAndUserAndUsedFalse(code, testUser)).thenReturn(Optional.of(resetToken));

        assertThrows(BadRequestException.class, () ->
                authService.verifyResetCode(new com.aiats.dto.auth.VerifyResetCodeRequest("test@example.com", code))
        );
    }

    @Test
    void testResetPassword_ValidCode_SuccessfullyUpdatesPasswordAndMarksCodeUsed() {
        String code = "583214";
        PasswordResetToken resetToken = new PasswordResetToken(code, testUser, Instant.now().plus(10, ChronoUnit.MINUTES));

        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findByTokenAndUserAndUsedFalse(code, testUser)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("NewSecretPassword123!")).thenReturn("new_hashed_password");

        authService.resetPassword(new ResetPasswordRequest("test@example.com", code, "NewSecretPassword123!"));

        assertEquals("new_hashed_password", testUser.getPasswordHash());
        assertTrue(resetToken.isUsed());
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepository).save(resetToken);
    }

    @Test
    void testResetPassword_InvalidCode_ThrowsBadRequestException() {
        when(passwordResetTokenRepository.findByTokenAndUsedFalse("000000")).thenReturn(Optional.empty());
        when(passwordResetTokenRepository.findByToken("000000")).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.resetPassword(new ResetPasswordRequest("000000", "NewSecretPassword123!"))
        );

        assertTrue(ex.getMessage().contains("Invalid or non-existent"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testResetPassword_AlreadyUsedCode_ThrowsBadRequestException() {
        String code = "583214";
        PasswordResetToken resetToken = new PasswordResetToken(code, testUser, Instant.now().plus(10, ChronoUnit.MINUTES));
        resetToken.setUsed(true);

        when(passwordResetTokenRepository.findByTokenAndUsedFalse(code)).thenReturn(Optional.empty());
        when(passwordResetTokenRepository.findByToken(code)).thenReturn(Optional.of(resetToken));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.resetPassword(new ResetPasswordRequest(code, "NewSecretPassword123!"))
        );

        assertTrue(ex.getMessage().contains("already been used"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testResetPassword_ExpiredCode_ThrowsBadRequestException() {
        String code = "583214";
        PasswordResetToken resetToken = new PasswordResetToken(code, testUser, Instant.now().minus(1, ChronoUnit.MINUTES));

        when(passwordResetTokenRepository.findByTokenAndUsedFalse(code)).thenReturn(Optional.of(resetToken));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.resetPassword(new ResetPasswordRequest(code, "NewSecretPassword123!"))
        );

        assertTrue(ex.getMessage().contains("expired"));
        verify(userRepository, never()).save(any());
    }
}
