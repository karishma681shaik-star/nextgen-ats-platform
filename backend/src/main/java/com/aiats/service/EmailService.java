package com.aiats.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.from:${spring.mail.username:}}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetVerificationCode(String toEmail, String verificationCode) {
        String subject = "AI ATS Platform - Password Reset Verification Code";

        String content = "Hello,\n\n"
                + "Your AI ATS verification code is:\n\n"
                + verificationCode + "\n\n"
                + "This code expires in 10 minutes.\n\n"
                + "If you did not request this code, please ignore this email.\n\n"
                + "Regards,\n"
                + "AI ATS Platform Security Team";

        logger.info("Sending password reset verification code to: {}", toEmail);

        String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
        if (fromAddress == null || fromAddress.isBlank()) {
            throw new IllegalStateException("MAIL_USERNAME / MAIL_FROM is not configured.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);

            logger.info("Password reset verification code sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("FAILED TO SEND PASSWORD RESET EMAIL: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to send password reset email. Check SMTP configuration.", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String codeOrToken) {
        sendPasswordResetVerificationCode(toEmail, codeOrToken);
    }
}
