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

    public void sendVerificationApprovedEmail(String toEmail, String recipientName, String companyName) {
        String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
        if (fromAddress == null || fromAddress.isBlank()) {
            logger.debug("SMTP not configured; skipping verification approval email to {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("NextGen ATS Platform - Recruiter Account Verified Successfully");
            message.setText("Hello " + (recipientName != null ? recipientName : "Recruiter") + ",\n\n"
                    + "Congratulations! Your recruiter account" + (companyName != null ? " for " + companyName : "")
                    + " has been approved by the NextGen ATS Platform administrator.\n\n"
                    + "Your account is now eligible to create and publish job postings, subject to the platform's job-posting policies.\n\n"
                    + "You can proceed to your Recruiter Dashboard to create your first job listing and manage applications.\n\n"
                    + "Thank you for joining the NextGen ATS Platform.\n\n"
                    + "Regards,\nNextGen ATS Platform Administration");

            mailSender.send(message);
            logger.info("Verification approval email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.warn("Verification approval email could not be sent to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendVerificationRejectedEmail(String toEmail, String recipientName, String reason) {
        String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
        if (fromAddress == null || fromAddress.isBlank()) {
            logger.debug("SMTP not configured; skipping verification rejection email to {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("NextGen ATS Platform - Recruiter Verification Update");
            message.setText("Hello " + (recipientName != null ? recipientName : "Recruiter") + ",\n\n"
                    + "Your recruiter verification application has been reviewed by the NextGen ATS Platform administrator.\n\n"
                    + "At this time, your application has not been approved.\n\n"
                    + "Reason: " + (reason != null && !reason.isBlank() ? reason : "No additional reason was provided.") + "\n\n"
                    + "Please review the information provided and use the supported resubmission or contact process if further action is available.\n\n"
                    + "Thank you for your interest in the NextGen ATS Platform.\n\n"
                    + "Regards,\nNextGen ATS Platform Administration");

            mailSender.send(message);
            logger.info("Verification rejection email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.warn("Verification rejection email could not be sent to {}: {}", toEmail, e.getMessage());
        }
    }
}

