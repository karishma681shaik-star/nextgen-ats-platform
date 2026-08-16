package com.aiats.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "AI ATS Platform — Password Reset Instructions";
        String content = "Hello,\n\n"
                + "You have requested to reset your password on the AI ATS Platform.\n\n"
                + "Please use the following secure link to set your new password (valid for 1 hour):\n"
                + resetUrl + "\n\n"
                + "Security Token: " + token + "\n\n"
                + "If you did not request this reset, you can safely ignore this email.\n\n"
                + "Best regards,\n"
                + "The AI ATS Platform Security Team";

        logger.info("========== DISPATCHING PASSWORD RESET EMAIL ==========");
        logger.info("To: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Reset Link: {}", resetUrl);
        logger.info("Token: {}", token);
        logger.info("=====================================================");

        if (mailSender != null && mailFrom != null && !mailFrom.isBlank() && !mailFrom.equals("test")) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(mailFrom);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                logger.info("Password reset email sent successfully via SMTP to {}", toEmail);
            } catch (Exception e) {
                logger.warn("SMTP delivery attempt failed (falling back to logged secure token): {}", e.getMessage());
            }
        }
    }
}
