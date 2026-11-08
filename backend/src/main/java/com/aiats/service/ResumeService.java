package com.aiats.service;

import com.aiats.dto.resume.ParsedDataDTO;
import com.aiats.dto.resume.ResumeAtsAnalysisDTO;
import com.aiats.dto.resume.ResumeDTO;
import com.aiats.dto.resume.ResumeReadinessDTO;
import com.aiats.dto.resume.ResumeRecommendationDTO;
import com.aiats.entity.Resume;
import com.aiats.entity.ResumeAnalysis;
import com.aiats.entity.User;
import com.aiats.exception.BadRequestException;
import com.aiats.exception.ResourceNotFoundException;
import com.aiats.repository.ResumeAnalysisRepository;
import com.aiats.repository.ResumeRepository;
import com.aiats.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.storage.upload-dir:./uploads/resumes}")
    private String uploadDir;

    public ResumeService(ResumeRepository resumeRepository,
                         UserRepository userRepository,
                         ResumeParserService resumeParserService,
                         ResumeAnalysisRepository resumeAnalysisRepository,
                         ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.objectMapper = objectMapper;
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

        ResumeAtsAnalysisDTO analysis = evaluateAndSyncAtsAnalysis(userId, resume, null);
        int score = analysis.getAtsScore();
        boolean ready = score >= 40;
        String tier = analysis.getReadinessLabel();
        String message = score >= 90 ? "Your resume is fully ATS-optimized and meets top recruiter benchmarks."
                : score >= 75 ? "Your resume is well-prepared for job optimization with good content."
                : score >= 60 ? "Your resume has solid foundational sections. Complete a few more recommendations for higher ranking."
                : score >= 40 ? "Your resume has developing content. Add additional skills and details before applying."
                : "Your resume is nearly empty. Add contact info, education, skills, and projects to improve your score.";

        JsonNode data = null;
        try {
            data = objectMapper.readTree(resume.getResumeData());
        } catch (Exception ignored) {}
        boolean hasName = !isPlaceholder(textVal(data, "firstName")) || !isPlaceholder(textVal(data, "name"));
        boolean hasSummary = !isPlaceholder(textVal(data, "summary"));
        boolean hasSkills = extractGenuineSkills(data, resume).size() >= 1;
        boolean hasExperience = countGenuineExperience(data) >= 1 || countGenuineProjects(data) >= 1;
        boolean hasEducation = countGenuineEducation(data) >= 1;

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
        Resume saved = resumeRepository.save(resume);

        // Dynamically re-evaluate ATS recommendations & sync score on save
        try {
            evaluateAndSyncAtsAnalysis(userId, saved, null);
        } catch (Exception ignored) {}

        return toDTO(saved);
    }

    @Transactional
    public ResumeAtsAnalysisDTO getAtsAnalysis(UUID userId, UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }
        return evaluateAndSyncAtsAnalysis(userId, resume, null);
    }

    @Transactional
    public ResumeAtsAnalysisDTO dismissRecommendation(UUID userId, UUID resumeId, String recommendationId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeId(resumeId)
                .orElseGet(() -> {
                    ResumeAnalysis a = new ResumeAnalysis();
                    a.setResume(resume);
                    return a;
                });

        Set<String> dismissedIds = loadDismissedIds(analysis);
        if (recommendationId != null && !recommendationId.isBlank()) {
            dismissedIds.add(recommendationId.trim());
        }

        return evaluateAndSyncAtsAnalysis(userId, resume, dismissedIds);
    }

    @Transactional
    public ResumeAtsAnalysisDTO restoreRecommendation(UUID userId, UUID resumeId, String recommendationId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
        if (!resume.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeId(resumeId)
                .orElseGet(() -> {
                    ResumeAnalysis a = new ResumeAnalysis();
                    a.setResume(resume);
                    return a;
                });

        Set<String> dismissedIds = loadDismissedIds(analysis);
        if (recommendationId != null) {
            dismissedIds.remove(recommendationId.trim());
        }

        return evaluateAndSyncAtsAnalysis(userId, resume, dismissedIds);
    }

    @Transactional
    public ResumeAtsAnalysisDTO evaluateAndSyncAtsAnalysis(UUID userId, Resume resume, Set<String> explicitDismissed) {
        UUID resumeId = resume.getId();
        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeId(resumeId)
                .orElseGet(() -> {
                    ResumeAnalysis a = new ResumeAnalysis();
                    a.setResume(resume);
                    return a;
                });

        Set<String> dismissedIds = explicitDismissed != null ? explicitDismissed : loadDismissedIds(analysis);

        // Parse resume JSON
        JsonNode data = null;
        String rawData = resume.getResumeData();
        if (rawData != null && !rawData.isBlank()) {
            try {
                data = objectMapper.readTree(rawData);
            } catch (Exception ignored) {}
        }

        // ── 1. Contact Details (10 pts) ──
        String firstName = textVal(data, "firstName");
        String lastName = textVal(data, "lastName");
        String name = textVal(data, "name");
        if (name.isBlank()) name = textVal(data, "fullName");
        boolean hasName = (!isPlaceholder(firstName) && !isPlaceholder(lastName))
                || (!isPlaceholder(name) && name.trim().split("\\s+").length >= 2);

        String phone = textVal(data, "phone");
        boolean hasPhone = !isPlaceholder(phone) && phone.replaceAll("[^0-9]", "").length() >= 7;

        String email = textVal(data, "email");
        boolean hasEmail = !isPlaceholder(email) && email.contains("@") && email.contains(".");

        String city = textVal(data, "city");
        String location = textVal(data, "location");
        boolean hasLocation = (!isPlaceholder(city) && !city.isBlank()) || (!isPlaceholder(location) && !location.isBlank());

        boolean contactPassing = hasName && hasPhone && hasEmail && hasLocation;

        // ── 2 & 3. Skills Validation (20 pts: 5 pts section presence, 15 pts density >= 5) ──
        List<String> genuineSkills = extractGenuineSkills(data, resume);
        int skillCount = genuineSkills.size();
        boolean skillsSectionPassing = skillCount >= 1;
        boolean skillsCountPassing = skillCount >= 5;

        // ── 4 & 5. Experience & Projects (35 pts total) ──
        int genuineExpCount = countGenuineExperience(data);
        int genuineProjCount = countGenuineProjects(data);
        boolean hasComprehensiveExpDesc = hasComprehensiveDescriptions(data);

        // ── 6. Education Credentials (15 pts) ──
        int genuineEduCount = countGenuineEducation(data);
        boolean educationPassing = genuineEduCount >= 1;
        boolean hasRawEdu = data != null && data.has("education") && data.get("education").isArray() && data.get("education").size() > 0;

        // ── 7. Professional Summary (10 pts) ──
        String summary = textVal(data, "summary");
        if (summary.isBlank()) summary = textVal(data, "bio");
        boolean summaryPassing = !isPlaceholder(summary) && summary.trim().length() >= 40;

        // ── 8 & 9. Structure and Formatting (10 pts: 5 pts metrics, 5 pts action verbs) ──
        String allDescriptions = aggregateAllDescriptions(data);
        boolean metricsPassing = Pattern.compile("\\b\\d+(\\.\\d+)?%|\\$\\d+|\\b\\d+\\+?\\s*(users|clients|requests|ms|hours|days|x|fold)\\b", Pattern.CASE_INSENSITIVE)
                .matcher(allDescriptions).find();
        boolean actionVerbsPassing = Pattern.compile("\\b(Led|Developed|Designed|Engineered|Spearheaded|Architected|Implemented|Automated|Optimized|Constructed|Orchestrated|Transformed|Built|Created|Delivered)\\b", Pattern.CASE_INSENSITIVE)
                .matcher(allDescriptions).find();

        // Build recommendations list
        List<ResumeRecommendationDTO> all = new ArrayList<>();

        // 1. Contact Details (10.0 pts)
        all.add(createRecommendation(
                "contact-essential",
                "Contact Info",
                "error",
                "Essential Contact Details Missing",
                "Essential Contact Details Verified",
                "Add your full name, phone number, email address, and location.",
                "Verified: Full contact info (name, email, phone, location) is complete.",
                10.0,
                contactPassing,
                dismissedIds.contains("contact-essential"),
                "personal-info",
                "Incomplete or placeholder contact info prevents recruiters from reaching out for interview invitations.",
                "Candidates without clear location and direct contact information are skipped by recruiters.",
                "Use a professional email and include city/state for location-based search filtering."
        ));

        // 2. Professional Summary (10.0 pts)
        all.add(createRecommendation(
                "summary-genuine",
                "Summary",
                "warning",
                "Missing Professional Summary",
                "Professional Summary Provided",
                "Write a 2-3 sentence career summary highlighting your core expertise and value.",
                "Verified: Career summary is present and highlights core competencies.",
                10.0,
                summaryPassing,
                dismissedIds.contains("summary-genuine"),
                "summary",
                "The summary is indexed heavily for high-level keyword clusters and target job titles.",
                "Provides an immediate snapshot of career identity and alignment with the target role.",
                "Summarize your years of experience, primary domain, and top career achievements."
        ));

        // 3. Education (15.0 pts)
        all.add(createRecommendation(
                "section-education",
                "Education",
                "error",
                hasRawEdu ? "Education Entry Incomplete" : "Missing Education Section & Credentials",
                "Academic Education Added",
                hasRawEdu ? "Update your most recent education entry to include your Degree, Institute, Dates." : "Add your degree, institution name, and graduation timeline.",
                "Verified: Institution and degree credentials are confirmed.",
                15.0,
                educationPassing,
                dismissedIds.contains("section-education"),
                "education",
                "Enterprise organizations enforce strict minimum degree requirements in ATS screening.",
                "Recruiters verify degree completion and major relevance during preliminary screening.",
                "Include institution name, degree obtained, and graduation year."
        ));

        // 4. Skills Section Presence (5.0 pts)
        all.add(createRecommendation(
                "section-skills",
                "Skills",
                "error",
                "Missing Skills Section & Competencies",
                "Skills Section & Competencies Added",
                "Add a dedicated Skills section containing your core technical tools and capabilities.",
                "Verified: Core technical and industry skills are included in your resume (" + skillCount + " listed).",
                5.0,
                skillsSectionPassing,
                dismissedIds.contains("section-skills"),
                "skills",
                "A dedicated Skills section allows ATS keyword matchers to index your exact competencies.",
                "Allows recruiters to instantly confirm whether you satisfy required prerequisites and technical demands.",
                "Group skills by categories (Programming Languages, Frameworks, Tools) to improve readability."
        ));

        // 5. Skills Density & Count (15.0 pts)
        all.add(createRecommendation(
                "skills-count",
                "Skills",
                "warning",
                "Insufficient Skill Count",
                "Sufficient Core Skills Count (>= 5 skills)",
                "Add at least 5 relevant technical or industry skills to meet ATS keyword density (currently " + skillCount + "/5).",
                "Verified: Meets recommended keyword density with " + skillCount + " core skills.",
                15.0,
                skillsCountPassing,
                dismissedIds.contains("skills-count"),
                "skills",
                "ATS algorithms calculate keyword match density. Profiles with under 5 core skills rarely hit the 70% threshold.",
                "Recruiters use skill search filters to narrow applicant pools from hundreds to top contenders.",
                "Include both primary programming languages/frameworks and domain tools."
        ));

        // 6 & 7. Practical Experience & Projects (35.0 pts total) - Intelligent Fresher Fairness
        boolean isFresher = (genuineExpCount == 0);
        if (!isFresher) {
            all.add(createRecommendation(
                    "section-work-projects",
                    "Work Experience",
                    "error",
                    "Missing Work Experience",
                    "Work Experience Included",
                    "Add your employment history, job title, company, and timeline.",
                    "Verified: Professional work experience is documented.",
                    10.0,
                    genuineExpCount >= 1,
                    dismissedIds.contains("section-work-projects"),
                    "experience",
                    "ATS algorithms look for structured work experience to gauge hands-on technical background.",
                    "Recruiters spend 80% of their initial scan evaluating career progression.",
                    "Ensure entries are in reverse chronological order with measurable bullet points."
            ));

            all.add(createRecommendation(
                    "exp-descriptions-genuine",
                    "Work Experience",
                    "warning",
                    "Detailed Experience Bullet Points",
                    "Detailed Experience Bullet Points Included",
                    "Add comprehensive bullet points describing responsibilities and accomplishments.",
                    "Verified: Roles contain comprehensive accomplishment bullet points.",
                    10.0,
                    hasComprehensiveExpDesc,
                    dismissedIds.contains("exp-descriptions-genuine"),
                    "experience",
                    "Bullet descriptions provide contextual keywords ATS systems score against requirements.",
                    "Recruiters want to see specific contributions rather than generic job duties.",
                    "Frame bullet points with the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]."
            ));

            all.add(createRecommendation(
                    "section-projects",
                    "Projects",
                    "info",
                    "Missing Projects Section",
                    "Projects & Deliverables Documented",
                    "Add technical or academic projects to demonstrate hands-on applied capabilities.",
                    "Verified: Hands-on project portfolio documented (" + genuineProjCount + " listed).",
                    15.0,
                    genuineProjCount >= 1,
                    dismissedIds.contains("section-projects"),
                    "projects",
                    "Projects highlight practical application of skills beyond job responsibilities.",
                    "Helps recruiters gauge engineering initiative and technical depth.",
                    "Include technologies used, your direct contribution, and measurable deliverables."
            ));
        } else {
            // Fresher / Student candidate without corporate tenure
            boolean hasMultipleProjects = genuineProjCount >= 2;
            boolean hasSingleProject = genuineProjCount == 1;

            all.add(createRecommendation(
                    "section-projects",
                    "Projects",
                    "error",
                    "Missing Projects Section",
                    "Projects & Deliverables Documented",
                    "Add academic, capstone, or personal technical projects highlighting your hands-on coding ability.",
                    "Verified: Practical project deliverables documented (" + genuineProjCount + " listed).",
                    15.0,
                    genuineProjCount >= 1,
                    dismissedIds.contains("section-projects"),
                    "projects",
                    "For freshers and early-career candidates, projects serve as primary proof of technical competence.",
                    "Recruiters evaluate problem solving, architecture choices, and stack familiarity through project work.",
                    "Highlight technologies used, role, and provide links or measurable metrics."
            ));

            all.add(createRecommendation(
                    "section-work-projects",
                    "Practical Experience",
                    hasMultipleProjects ? "info" : "warning",
                    hasSingleProject
                            ? "Add Second Project or Internship"
                            : "Missing Work Experience or Projects",
                    hasMultipleProjects
                            ? "Hands-on Project Portfolio Verified (Fresher Credit)"
                            : "Practical Experience Documented",
                    hasSingleProject
                            ? "Early-career candidates should add at least 2 detailed projects or internships to demonstrate competence (currently 1)."
                            : "Add professional employment, internships, or academic projects.",
                    "Verified: Practical project portfolio demonstrates strong hands-on capabilities in lieu of corporate tenure.",
                    20.0,
                    hasMultipleProjects,
                    dismissedIds.contains("section-work-projects"),
                    "projects",
                    "Early-career ATS models weight robust academic projects equivalently to entry-level internships.",
                    "Demonstrates initiative, end-to-end delivery, and code craftsmanship.",
                    "Include 2 or more projects with architecture overview, stack details, and GitHub links."
            ));
        }

        // 8. Measurable Metrics (5.0 pts)
        all.add(createRecommendation(
                "quantifiable-metrics",
                "Content Quality",
                "info",
                "Quantifiable Metrics & Measurable Impact",
                "Quantifiable Metrics & Impact Demonstrated",
                "Include numbers, percentages, or growth metrics to prove tangible impact.",
                "Verified: Measurable metrics and percentages found in project or work descriptions.",
                5.0,
                metricsPassing,
                dismissedIds.contains("quantifiable-metrics"),
                "experience",
                "Resumes with measurable results score higher in AI-driven semantic ranking algorithms.",
                "Numbers give hiring managers confidence in your scale of impact and competency.",
                "Add stats such as 'Reduced load time by 35%' or 'Managed a team of 6 engineers'."
        ));

        // 9. Strong Action Verbs (5.0 pts)
        all.add(createRecommendation(
                "action-verbs",
                "Content Quality",
                "info",
                "Strong Action Verbs in Bullet Points",
                "Strong Action Verbs Applied",
                "Start bullet points with impactful verbs like Engineered, Spearheaded, or Optimized.",
                "Verified: Strong leadership and technical action verbs detected in descriptions.",
                5.0,
                actionVerbsPassing,
                dismissedIds.contains("action-verbs"),
                "experience",
                "Action verbs signal leadership, ownership, and initiative to natural language parsers.",
                "Creates an active, compelling narrative that holds recruiter interest.",
                "Avoid passive voice ('Responsible for...') and replace with decisive action verbs."
        ));

        // Calculate genuine ATS score (sum of passing recommendation weights, independent of dismissal)
        double earnedWeight = 0;
        for (ResumeRecommendationDTO r : all) {
            if (r.isPassing()) {
                earnedWeight += r.getWeight();
            }
        }
        int atsScore = (int) Math.round(earnedWeight);
        atsScore = Math.max(0, Math.min(100, atsScore));

        String readinessLabel = atsScore >= 90 ? "Excellent"
                : atsScore >= 75 ? "Good"
                : atsScore >= 60 ? "Fair"
                : atsScore >= 40 ? "Needs Improvement"
                : "Poor";

        // Partition into lists
        List<ResumeRecommendationDTO> pending = new ArrayList<>();
        List<ResumeRecommendationDTO> completed = new ArrayList<>();
        List<ResumeRecommendationDTO> deleted = new ArrayList<>();

        for (ResumeRecommendationDTO r : all) {
            if (r.isDismissed()) {
                r.setStatus("DELETED");
                deleted.add(r);
            } else if (r.isPassing()) {
                r.setStatus("COMPLETED");
                completed.add(r);
            } else {
                r.setStatus("PENDING");
                pending.add(r);
            }
        }

        // Sort pending by weight descending
        pending.sort((a, b) -> Double.compare(b.getWeight(), a.getWeight()));
        completed.sort((a, b) -> Double.compare(b.getWeight(), a.getWeight()));
        deleted.sort((a, b) -> Double.compare(b.getWeight(), a.getWeight()));

        // Persist to ResumeAnalysis in database
        try {
            ObjectNode meta = objectMapper.createObjectNode();
            ArrayNode arr = meta.putArray("dismissedIds");
            dismissedIds.forEach(arr::add);
            meta.put("overallScore", atsScore);
            meta.put("lastEvaluated", Instant.now().toString());

            analysis.setOverallScore(atsScore);
            analysis.setRecommendations(objectMapper.writeValueAsString(meta));
            analysis.setLastAnalyzed(Instant.now());
            resumeAnalysisRepository.save(analysis);
        } catch (Exception ignored) {}

        return new ResumeAtsAnalysisDTO(resumeId.toString(), atsScore, readinessLabel,
                pending, completed, deleted, all);
    }

    private ResumeRecommendationDTO createRecommendation(
            String id, String category, String severity,
            String pendingTitle, String completedTitle,
            String reason, String completedDescription,
            double weight, boolean passing, boolean dismissed,
            String navigateTo, String detailedReason,
            String recruiterImpact, String proTip) {
        String status = dismissed ? "DELETED" : (passing ? "COMPLETED" : "PENDING");
        return new ResumeRecommendationDTO(
                id, category, severity, status,
                pendingTitle, completedTitle,
                reason, completedDescription,
                weight, passing, dismissed,
                navigateTo, detailedReason,
                recruiterImpact, proTip
        );
    }

    private Set<String> loadDismissedIds(ResumeAnalysis analysis) {
        Set<String> set = new HashSet<>();
        if (analysis != null && analysis.getRecommendations() != null && !analysis.getRecommendations().isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(analysis.getRecommendations());
                if (root.has("dismissedIds") && root.get("dismissedIds").isArray()) {
                    root.get("dismissedIds").forEach(n -> set.add(n.asText().trim()));
                }
            } catch (Exception ignored) {}
        }
        return set;
    }

    private boolean isPlaceholder(String val) {
        if (val == null) return true;
        String trimmed = val.trim();
        if (trimmed.isEmpty()) return true;
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) return true;
        if (trimmed.startsWith("<") && trimmed.endsWith(">")) return true;
        String lower = trimmed.toLowerCase();
        return lower.equals("first name last name")
                || lower.equals("first name")
                || lower.equals("last name")
                || lower.equals("email@mit.edu")
                || lower.equals("skill here")
                || lower.equals("skill name")
                || lower.equals("insert skill")
                || lower.equals("institution name")
                || lower.equals("degree")
                || lower.equals("job title")
                || lower.equals("organization name")
                || lower.equals("project name")
                || lower.contains("summarize your career")
                || lower.contains("add description")
                || lower.contains("mention your")
                || lower.contains("mention project")
                || lower.contains("mention education")
                || lower.contains("add programming")
                || lower.contains("add frameworks")
                || lower.contains("add tools")
                || lower.contains("add databases")
                || lower.contains("add skills")
                || lower.contains("list 3-5");
    }

    private String textVal(JsonNode node, String fieldName) {
        if (node == null || !node.has(fieldName) || node.get(fieldName).isNull()) return "";
        return node.get(fieldName).asText("").trim();
    }

    private List<String> extractGenuineSkills(JsonNode data, Resume resume) {
        Set<String> set = new LinkedHashSet<>();
        if (data != null && data.has("skills")) {
            JsonNode skillsNode = data.get("skills");
            if (skillsNode.isObject()) {
                skillsNode.fields().forEachRemaining(entry -> {
                    JsonNode valNode = entry.getValue();
                    if (valNode.isArray()) {
                        valNode.forEach(item -> {
                            if (item.isObject() && item.has("skills")) {
                                String s = item.get("skills").asText("");
                                for (String part : s.split("[,\\n]+")) {
                                    if (!isPlaceholder(part)) set.add(part.trim());
                                }
                            } else {
                                String s = item.asText();
                                if (!isPlaceholder(s)) set.add(s.trim());
                            }
                        });
                    } else if (valNode.isTextual()) {
                        for (String part : valNode.asText().split("[,\\n]+")) {
                            if (!isPlaceholder(part)) set.add(part.trim());
                        }
                    }
                });
            } else if (skillsNode.isArray()) {
                skillsNode.forEach(item -> {
                    String s = item.asText();
                    if (!isPlaceholder(s)) set.add(s.trim());
                });
            } else if (skillsNode.isTextual()) {
                for (String part : skillsNode.asText().split("[,\\n]+")) {
                    if (!isPlaceholder(part)) set.add(part.trim());
                }
            }
        }
        if (set.isEmpty() && resume.getExtractedSkills() != null && !resume.getExtractedSkills().isBlank()) {
            for (String part : resume.getExtractedSkills().split("[,\\n]+")) {
                if (!isPlaceholder(part)) set.add(part.trim());
            }
        }
        return new ArrayList<>(set);
    }

    private int countGenuineExperience(JsonNode data) {
        if (data == null || !data.has("experience") || !data.get("experience").isArray()) return 0;
        int count = 0;
        for (JsonNode exp : data.get("experience")) {
            String role = textVal(exp, "role");
            String company = textVal(exp, "company");
            if (!isPlaceholder(role) && !isPlaceholder(company)) {
                count++;
            }
        }
        return count;
    }

    private int countGenuineProjects(JsonNode data) {
        if (data == null || !data.has("projects") || !data.get("projects").isArray()) return 0;
        int count = 0;
        for (JsonNode p : data.get("projects")) {
            String title = textVal(p, "title");
            String desc = textVal(p, "description");
            String techs = textVal(p, "technologies");
            if (!isPlaceholder(title) && (!isPlaceholder(desc) || !isPlaceholder(techs))) {
                count++;
            }
        }
        return count;
    }

    private int countGenuineEducation(JsonNode data) {
        if (data == null || !data.has("education") || !data.get("education").isArray()) return 0;
        int count = 0;
        for (JsonNode edu : data.get("education")) {
            String institution = textVal(edu, "institution");
            String degree = textVal(edu, "degree");
            if (!isPlaceholder(institution) && !isPlaceholder(degree)) {
                count++;
            }
        }
        return count;
    }

    private boolean hasComprehensiveDescriptions(JsonNode data) {
        if (data == null || !data.has("experience") || !data.get("experience").isArray()) return false;
        for (JsonNode exp : data.get("experience")) {
            String desc = textVal(exp, "description");
            if (!isPlaceholder(desc) && desc.trim().length() >= 40) {
                return true;
            }
        }
        return false;
    }

    private String aggregateAllDescriptions(JsonNode data) {
        StringBuilder sb = new StringBuilder();
        if (data != null) {
            if (data.has("experience") && data.get("experience").isArray()) {
                for (JsonNode exp : data.get("experience")) {
                    sb.append(textVal(exp, "description")).append(" ");
                }
            }
            if (data.has("projects") && data.get("projects").isArray()) {
                for (JsonNode p : data.get("projects")) {
                    sb.append(textVal(p, "description")).append(" ");
                }
            }
        }
        return sb.toString();
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
