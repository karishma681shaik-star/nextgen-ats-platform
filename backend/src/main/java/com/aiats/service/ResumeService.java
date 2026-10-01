package com.aiats.service;

import com.aiats.dto.resume.ParsedDataDTO;
import com.aiats.dto.resume.ResumeDTO;
import com.aiats.dto.resume.ResumeReadinessDTO;
import com.aiats.entity.Resume;
import com.aiats.entity.User;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.ResumeRepository;
import com.aiats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;

    @Value("${app.storage.upload-dir:./uploads/resumes}")
    private String uploadDir;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository, ResumeParserService resumeParserService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
    }

    @Transactional(readOnly = true)
    public List<ResumeDTO> getResumes(UUID userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ResumeDTO uploadResume(UUID userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String originalName = file.getOriginalFilename();
        if (originalName == null) throw new BadRequestException("Invalid file name");

        String extension = originalName.toLowerCase().endsWith(".docx") ? "docx" : "pdf";
        String storedName = userId + "_" + System.currentTimeMillis() + "." + extension;

        // Ensure directory exists
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Path filePath = dir.resolve(storedName);
        Files.write(filePath, file.getBytes());

        // Check if first resume — make primary
        List<Resume> existing = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName(originalName);
        resume.setFileSize(formatSize(file.getSize()));
        resume.setFileType(extension);
        resume.setFilePath(filePath.toString());
        resume.setPrimary(isFirst);
        resume.setStatus("parsed");

        // Automatically extract raw text upon upload
        String rawText = resumeParserService.extractRawText(filePath, extension);
        ResumeParserService.ParsedResumeResult parsedResult = resumeParserService.parseResume(rawText, originalName, filePath);
        resume.setResumeData(parsedResult.structuredJson);
        resume.setExtractedSkills(parsedResult.extractedSkills);
        resume.setExtractedEducation(parsedResult.extractedEducation);
        resume.setExtractedExperience(parsedResult.extractedExperience);
        resume.setExtractedProjects(parsedResult.extractedProjects);
        resume.setExtractedCertifications(parsedResult.extractedCertifications);

        return toDTO(resumeRepository.save(resume));
    }

    @Transactional
    public void deleteResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        // Try to delete the physical file
        if (resume.getFilePath() != null) {
            try { Files.deleteIfExists(Paths.get(resume.getFilePath())); } catch (IOException ignored) {}
        }
        resumeRepository.delete(resume);

        // If it was primary, make next one primary
        if (resume.isPrimary()) {
            List<Resume> remaining = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setPrimary(true);
                resumeRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public List<ResumeDTO> setPrimary(UUID userId, UUID resumeId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        resumes.forEach(r -> {
            r.setPrimary(r.getId().equals(resumeId));
            resumeRepository.save(r);
        });
        return resumes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ResumeDTO parseResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        resume.setStatus("parsed");
        Path filePath = resume.getFilePath() != null ? Paths.get(resume.getFilePath()) : null;
        String rawText = resumeParserService.extractRawText(filePath, resume.getFileType());
        ResumeParserService.ParsedResumeResult parsedResult = resumeParserService.parseResume(rawText, resume.getFileName(), filePath);

        resume.setExtractedSkills(parsedResult.extractedSkills);
        resume.setExtractedEducation(parsedResult.extractedEducation);
        resume.setExtractedExperience(parsedResult.extractedExperience);
        resume.setExtractedProjects(parsedResult.extractedProjects);
        resume.setExtractedCertifications(parsedResult.extractedCertifications);
        resume.setResumeData(parsedResult.structuredJson);

        return toDTO(resumeRepository.save(resume));
    }

    /**
     * Analyzes the stored resumeData JSON (and extracted fields) for a resume
     * and returns a readiness score (0–100) plus a ready flag.
     *
     * Scoring rubric (total 100 pts):
     *   - Has non-empty name/fullName     : 20 pts
     *   - Has summary/bio (>= 20 chars)   : 15 pts
     *   - Has skills (any skill text)      : 20 pts
     *   - Has experience (>= 1 entry)      : 25 pts
     *   - Has education (>= 1 entry)       : 10 pts
     *   - Has contact info (email/phone)   : 10 pts
     *
     * ready = true when score >= 40 (has at least name + one content section)
     */
    @Transactional(readOnly = true)
    public ResumeReadinessDTO checkReadiness(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        String rawData = resume.getResumeData();

        boolean hasName = false;
        boolean hasSummary = false;
        boolean hasSkills = false;
        boolean hasExperience = false;
        boolean hasEducation = false;
        boolean hasContact = false;

        // ── Parse key fields from resumeData JSON using lightweight string inspection ──
        if (rawData != null && !rawData.isBlank()) {
            // Name check: "name":"..." or "fullName":"..."
            hasName = extractJsonString(rawData, "name").length() >= 2
                    || extractJsonString(rawData, "fullName").length() >= 2;

            // Summary check: "summary":"..." or "bio":"..."
            String summary = extractJsonString(rawData, "summary");
            if (summary.isBlank()) summary = extractJsonString(rawData, "bio");
            hasSummary = summary.length() >= 20;

            // Skills check from structured JSON skills object
            String skillsBlock = extractJsonObject(rawData, "skills");
            if (!skillsBlock.isBlank()) {
                // Has skills if any non-empty string arrays inside skills block
                hasSkills = skillsBlock.replaceAll("[\\[\\]{}\"\\s]", "")
                        .replaceAll("(programmingLanguages|frameworksLibraries|toolsPlatforms|databases|softSkills|technical|soft|tools|languages|customCategories):", "")
                        .trim().length() > 2;
            }
            // Also check extracted_skills field
            if (!hasSkills && resume.getExtractedSkills() != null && !resume.getExtractedSkills().isBlank()) {
                hasSkills = resume.getExtractedSkills().trim().length() > 2;
            }

            // Experience check: "experience":[{...}]
            String expBlock = extractJsonArray(rawData, "experience");
            if (!expBlock.isBlank() && !expBlock.equals("[]")) {
                // Count entries by counting occurrences of "role" or "company" keys
                long expCount = countJsonArrayEntries(expBlock, "role");
                hasExperience = expCount >= 1;
            }
            if (!hasExperience && resume.getExtractedExperience() != null && !resume.getExtractedExperience().isBlank()) {
                hasExperience = true;
            }

            // Education check: "education":[{...}]
            String eduBlock = extractJsonArray(rawData, "education");
            if (!eduBlock.isBlank() && !eduBlock.equals("[]")) {
                long eduCount = countJsonArrayEntries(eduBlock, "degree");
                hasEducation = eduCount >= 1;
            }
            if (!hasEducation && resume.getExtractedEducation() != null && !resume.getExtractedEducation().isBlank()) {
                hasEducation = true;
            }

            // Contact check
            String email = extractJsonString(rawData, "email");
            String phone = extractJsonString(rawData, "phone");
            hasContact = email.contains("@") || phone.length() >= 7;
        }

        // ── Score calculation ──
        int score = 0;
        if (hasName)       score += 20;
        if (hasSummary)    score += 15;
        if (hasSkills)     score += 20;
        if (hasExperience) score += 25;
        if (hasEducation)  score += 10;
        if (hasContact)    score += 10;

        boolean ready = score >= 40;

        String tier;
        String message;
        if (score >= 80) {
            tier = "Excellent";
            message = "Your resume is well-prepared for job optimization.";
        } else if (score >= 60) {
            tier = "Good";
            message = "Your resume has good content. A few more details will improve your ATS score.";
        } else if (score >= 40) {
            tier = "Fair";
            message = "Your resume has minimal content. Add experience and skills for better results.";
        } else {
            tier = "Poor";
            message = "Your resume is nearly empty. Please add your name, skills, and at least one experience or education entry before optimizing.";
        }

        return new ResumeReadinessDTO(score, ready, tier, message,
                hasName, hasSummary, hasSkills, hasExperience, hasEducation);
    }

    // ── Private JSON parsing helpers (lightweight, no external library dependency) ──

    private String extractJsonString(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start < 0) return "";
        start += search.length();
        int end = json.indexOf("\"", start);
        if (end < 0) return "";
        return json.substring(start, end).trim();
    }

    private String extractJsonObject(String json, String key) {
        String search = "\"" + key + "\":{";
        int start = json.indexOf(search);
        if (start < 0) return "";
        start += search.length() - 1;
        int depth = 0;
        int i = start;
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '{') depth++;
            else if (c == '}') { depth--; if (depth == 0) return json.substring(start, i + 1); }
            i++;
        }
        return "";
    }

    private String extractJsonArray(String json, String key) {
        String search = "\"" + key + "\":[";
        int start = json.indexOf(search);
        if (start < 0) return "[]";
        start += search.length() - 1;
        int depth = 0;
        int i = start;
        while (i < json.length()) {
            char c = json.charAt(i);
            if (c == '[') depth++;
            else if (c == ']') { depth--; if (depth == 0) return json.substring(start, i + 1); }
            i++;
        }
        return "[]";
    }

    private long countJsonArrayEntries(String arrayJson, String markerKey) {
        String marker = "\"" + markerKey + "\":";
        long count = 0;
        int idx = 0;
        while ((idx = arrayJson.indexOf(marker, idx)) >= 0) {
            count++;
            idx += marker.length();
        }
        return count;
    }

    private String formatSize(long bytes) {

        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    public ResumeDTO toDTO(Resume r) {
        ResumeDTO dto = new ResumeDTO();
        dto.setId(r.getId().toString());
        dto.setUserId(r.getUser().getId().toString());
        dto.setFileName(r.getFileName());
        dto.setFileSize(r.getFileSize());
        dto.setFileType(r.getFileType());
        dto.setUploadDate(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        dto.setPrimary(r.isPrimary());
        dto.setStatus(r.getStatus());
        dto.setResumeData(r.getResumeData());

        // Parsed data - populate whenever extracted fields exist or status is parsed/ready
        boolean hasParsedData = (r.getExtractedSkills() != null && !r.getExtractedSkills().isBlank())
                || (r.getExtractedExperience() != null && !r.getExtractedExperience().isBlank())
                || (r.getExtractedProjects() != null && !r.getExtractedProjects().isBlank())
                || (r.getExtractedEducation() != null && !r.getExtractedEducation().isBlank())
                || (r.getExtractedCertifications() != null && !r.getExtractedCertifications().isBlank());

        if ("parsed".equalsIgnoreCase(r.getStatus()) || hasParsedData) {
            ParsedDataDTO pd = new ParsedDataDTO();
            pd.setExtractedSkills(splitText(r.getExtractedSkills(), ","));
            pd.setExtractedEducation(splitText(r.getExtractedEducation(), "\\|\\|"));
            pd.setExtractedExperience(splitText(r.getExtractedExperience(), "\\|\\|"));
            pd.setExtractedProjects(splitText(r.getExtractedProjects(), "\\|\\|"));
            pd.setExtractedCertifications(splitText(r.getExtractedCertifications(), "\\|\\|"));
            dto.setParsedData(pd);
        }
        return dto;
    }

    @Transactional
    public ResumeDTO getResume(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        // Auto-heal/parse if resumeData is missing but file exists on disk
        boolean hasData = resume.getResumeData() != null && !resume.getResumeData().isBlank() && !"{ }".equals(resume.getResumeData().trim()) && !"{}".equals(resume.getResumeData().trim());
        if (!hasData && resume.getFilePath() != null) {
            Path path = Paths.get(resume.getFilePath());
            if (Files.exists(path)) {
                try {
                    String rawText = resumeParserService.extractRawText(path, resume.getFileType());
                    ResumeParserService.ParsedResumeResult parsedResult = resumeParserService.parseResume(rawText, resume.getFileName(), path);
                    resume.setResumeData(parsedResult.structuredJson);
                    resume.setExtractedSkills(parsedResult.extractedSkills);
                    resume.setExtractedEducation(parsedResult.extractedEducation);
                    resume.setExtractedExperience(parsedResult.extractedExperience);
                    resume.setExtractedProjects(parsedResult.extractedProjects);
                    resume.setExtractedCertifications(parsedResult.extractedCertifications);
                    resume.setStatus("parsed");
                    resume = resumeRepository.save(resume);
                } catch (Exception ignored) {}
            }
        }

        return toDTO(resume);
    }

    @Transactional
    public ResumeDTO updateResume(UUID userId, UUID resumeId, ResumeDTO dto) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        if (dto.getFileName() != null) {
            resume.setFileName(dto.getFileName());
        }
        resume.setResumeData(dto.getResumeData());
        resume.setStatus(dto.getStatus() != null ? dto.getStatus() : resume.getStatus());
        return toDTO(resumeRepository.save(resume));
    }

    @Transactional
    public ResumeDTO createBlankResume(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName("Untitled - Resume");
        resume.setFileSize("0 KB");
        resume.setFileType("pdf");
        resume.setPrimary(false);
        resume.setStatus("parsed");
        
        // Initial empty JSON data
        String initialData = "{"
            + "\"name\":\"\","
            + "\"email\":\"\","
            + "\"phone\":\"\","
            + "\"location\":\"\","
            + "\"title\":\"\","
            + "\"bio\":\"\","
            + "\"skills\":{\"technical\":[],\"soft\":[],\"tools\":[],\"languages\":[]},"
            + "\"education\":[],"
            + "\"experience\":[],"
            + "\"projects\":[],"
            + "\"certifications\":[],"
            + "\"template\":\"medium\","
            + "\"spacing\":{\"fontSize\":\"14px\",\"padding\":\"24px\",\"sectionGap\":\"15px\",\"itemGap\":\"10px\"}"
            + "}";
        resume.setResumeData(initialData);

        return toDTO(resumeRepository.save(resume));
    }

    private List<String> splitText(String value, String regex) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.asList(value.split(regex));
    }
}
