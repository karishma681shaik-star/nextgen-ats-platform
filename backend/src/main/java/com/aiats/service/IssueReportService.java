package com.aiats.service;

import com.aiats.dto.issue.IssueReportResponseDTO;
import com.aiats.entity.IssueReport;
import com.aiats.exception.BadRequestException;
import com.aiats.repository.IssueReportRepository;
import com.aiats.security.UserPrincipal;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class IssueReportService {

    private static final Logger logger = LoggerFactory.getLogger(IssueReportService.class);

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final int MAX_FILE_COUNT = 3;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "pdf", "txt"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "sh", "jar", "bin", "php", "js", "vbs", "ps1", "py"
    );

    private static final Set<String> ALLOWED_ISSUE_TYPES = Set.of(
            "Login / Authentication",
            "Resume Builder",
            "Resume Analysis / ATS Score",
            "AI Assistant",
            "Job Search / Matching",
            "Recruiter Dashboard",
            "Candidate Management",
            "Application / Recruitment Pipeline",
            "Profile",
            "UI / Frontend",
            "Other"
    );

    private final IssueReportRepository issueReportRepository;
    private final JavaMailSender mailSender;

    @Value("${app.storage.issues-dir:./uploads/issues}")
    private String issuesUploadDir;

    @Value("${app.support.email:}")
    private String supportEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.from:${spring.mail.username:}}")
    private String mailFrom;

    public IssueReportService(IssueReportRepository issueReportRepository,
                              JavaMailSender mailSender) {
        this.issueReportRepository = issueReportRepository;
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(issuesUploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                logger.info("Created issues upload directory: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("Failed to create issues upload directory: {}", e.getMessage());
        }
    }

    @Transactional
    public IssueReportResponseDTO submitReport(UserPrincipal principal,
                                              String issueType,
                                              String description,
                                              List<MultipartFile> attachments) {
        if (principal == null) {
            throw new BadRequestException("Authentication context is required to submit an issue report.");
        }

        // 1. Validate issueType
        if (issueType == null || issueType.isBlank()) {
            throw new BadRequestException("Issue type is required.");
        }
        String cleanIssueType = issueType.trim();
        if (!ALLOWED_ISSUE_TYPES.contains(cleanIssueType)) {
            throw new BadRequestException("Invalid issue type: " + cleanIssueType);
        }

        // 2. Validate description
        if (description == null || description.isBlank()) {
            throw new BadRequestException("Description is required.");
        }
        String cleanDescription = description.trim();
        if (cleanDescription.length() < 5) {
            throw new BadRequestException("Description must be at least 5 characters long.");
        }
        if (cleanDescription.length() > 5000) {
            throw new BadRequestException("Description exceeds maximum allowed length of 5000 characters.");
        }

        // 3. Validate attachments
        List<String> savedFilenames = new ArrayList<>();
        List<MultipartFile> validAttachments = new ArrayList<>();

        if (attachments != null && !attachments.isEmpty()) {
            // Filter out empty files
            List<MultipartFile> nonEmptyFiles = attachments.stream()
                    .filter(f -> f != null && !f.isEmpty() && f.getSize() > 0)
                    .toList();

            if (nonEmptyFiles.size() > MAX_FILE_COUNT) {
                throw new BadRequestException("You can upload a maximum of " + MAX_FILE_COUNT + " attachments.");
            }

            for (MultipartFile file : nonEmptyFiles) {
                validateFile(file);
                validAttachments.add(file);
            }

            // Save files to disk
            for (MultipartFile file : validAttachments) {
                String savedName = saveAttachmentFile(file);
                savedFilenames.add(savedName);
            }
        }

        // 4. Create and persist Entity
        IssueReport report = new IssueReport();
        report.setUserId(principal.getId());
        report.setUserEmail(principal.getUsername());
        report.setUserFullName(principal.getFullName());
        report.setUserRole(principal.getRole());
        report.setIssueType(cleanIssueType);
        report.setDescription(cleanDescription);
        report.setStatus("OPEN");
        report.setAttachmentFilenames(String.join(",", savedFilenames));

        IssueReport savedReport = issueReportRepository.save(report);
        logger.info("Persisted issue report ID: {} for user: {}", savedReport.getId(), principal.getUsername());

        // 5. Send support email notification
        sendSupportNotificationEmail(savedReport, validAttachments);

        // 6. Return response DTO
        return new IssueReportResponseDTO(
                savedReport.getId(),
                savedReport.getUserEmail(),
                savedReport.getUserRole(),
                savedReport.getIssueType(),
                savedReport.getDescription(),
                savedReport.getStatus(),
                savedFilenames,
                savedReport.getCreatedAt(),
                "Issue report submitted successfully"
        );
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File '" + file.getOriginalFilename() + "' exceeds 5 MB maximum limit.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("File must have a valid name.");
        }

        String ext = getFileExtension(originalName).toLowerCase();
        if (BLOCKED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Executable and script files are not allowed.");
        }

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Unsupported file type '." + ext + "'. Allowed: JPG, PNG, WEBP, GIF, PDF, TXT.");
        }
    }

    private String saveAttachmentFile(MultipartFile file) {
        try {
            String originalName = file.getOriginalFilename();
            String ext = getFileExtension(originalName);
            String safeBaseName = (originalName != null)
                    ? originalName.replaceAll("[^a-zA-Z0-9.-]", "_")
                    : "attachment";

            String uniqueFilename = UUID.randomUUID() + "_" + safeBaseName;
            Path targetPath = Paths.get(issuesUploadDir).resolve(uniqueFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Saved issue attachment: {}", targetPath.toAbsolutePath());
            return uniqueFilename;
        } catch (IOException e) {
            logger.error("Failed to save attachment file: {}", e.getMessage(), e);
            throw new RuntimeException("Could not store file. Please try again.", e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex + 1) : "";
    }

    private void sendSupportNotificationEmail(IssueReport report, List<MultipartFile> attachments) {
        String recipient = (supportEmail != null && !supportEmail.isBlank())
                ? supportEmail
                : ((mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "support@aiats.com");

        String fromAddress = (mailFrom != null && !mailFrom.isBlank())
                ? mailFrom
                : ((mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "noreply@aiats.com");

        String subject = "[AI ATS] New Issue Report - " + report.getIssueType();

        StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder.append("====================================================\n");
        bodyBuilder.append("           AI ATS PLATFORM - ISSUE REPORT           \n");
        bodyBuilder.append("====================================================\n\n");
        bodyBuilder.append("Report ID:    ").append(report.getId()).append("\n");
        bodyBuilder.append("Submitted:    ").append(DateTimeFormatter.ISO_INSTANT.format(report.getCreatedAt())).append("\n");
        bodyBuilder.append("User Email:   ").append(report.getUserEmail()).append("\n");
        bodyBuilder.append("User Role:    ").append(report.getUserRole()).append("\n");
        if (report.getUserFullName() != null && !report.getUserFullName().isBlank()) {
            bodyBuilder.append("User Name:    ").append(report.getUserFullName()).append("\n");
        }
        bodyBuilder.append("Issue Type:   ").append(report.getIssueType()).append("\n");
        bodyBuilder.append("Status:       ").append(report.getStatus()).append("\n\n");
        bodyBuilder.append("----------------- DESCRIPTION ----------------------\n");
        bodyBuilder.append(report.getDescription()).append("\n\n");
        bodyBuilder.append("----------------- ATTACHMENTS ----------------------\n");
        if (report.getAttachmentFilenames() != null && !report.getAttachmentFilenames().isBlank()) {
            bodyBuilder.append(report.getAttachmentFilenames()).append("\n");
        } else {
            bodyBuilder.append("None\n");
        }
        bodyBuilder.append("\n====================================================\n");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            boolean hasAttachments = attachments != null && !attachments.isEmpty();
            MimeMessageHelper helper = new MimeMessageHelper(message, hasAttachments);

            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(bodyBuilder.toString(), false);

            if (hasAttachments) {
                for (MultipartFile file : attachments) {
                    if (file != null && !file.isEmpty()) {
                        String attachmentName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
                        helper.addAttachment(attachmentName, new ByteArrayResource(file.getBytes()));
                    }
                }
            }

            mailSender.send(message);
            logger.info("Dispatched issue report notification email for Report ID {} to {}", report.getId(), recipient);
        } catch (Exception e) {
            // Log clearly, do not prevent returning the report response if email server is temporarily offline
            logger.error("Could not send issue report email to {}: {}", recipient, e.getMessage());
        }
    }
}
