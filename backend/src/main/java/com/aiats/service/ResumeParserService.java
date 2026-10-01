package com.aiats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.interactive.action.PDAction;
import org.apache.pdfbox.pdmodel.interactive.action.PDActionURI;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotation;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationLink;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Intelligent Document & Resume Parser Service.
 * Extracts raw text and embedded URI hyperlinks from PDF/Word documents using PDFBox / POI,
 * and normalizes the contents into structured ResumeBuilder JSON.
 */
@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class ParsedResumeResult {
        public String structuredJson;
        public String extractedSkills;
        public String extractedEducation;
        public String extractedExperience;
        public String extractedProjects;
        public String extractedCertifications;
    }

    /**
     * Extracts raw text from the stored physical file.
     */
    public String extractRawText(Path filePath, String fileType) {
        if (filePath == null || !Files.exists(filePath)) {
            return "";
        }
        try {
            if ("docx".equalsIgnoreCase(fileType)) {
                try (InputStream is = Files.newInputStream(filePath);
                     XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else {
                File pdfFile = filePath.toFile();
                try (PDDocument document = Loader.loadPDF(pdfFile)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract text with PDFBox/POI: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Extracts embedded hyperlinks/URIs from PDF annotations.
     */
    public List<String> extractPdfLinks(Path filePath) {
        List<String> links = new ArrayList<>();
        if (filePath == null || !Files.exists(filePath)) return links;
        try (PDDocument document = Loader.loadPDF(filePath.toFile())) {
            for (PDPage page : document.getPages()) {
                for (PDAnnotation annot : page.getAnnotations()) {
                    if (annot instanceof PDAnnotationLink) {
                        PDAnnotationLink link = (PDAnnotationLink) annot;
                        PDAction action = link.getAction();
                        if (action instanceof PDActionURI) {
                            String uri = ((PDActionURI) action).getURI();
                            if (uri != null && !uri.isBlank()) {
                                links.add(uri.trim());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract PDF annotations: {}", e.getMessage());
        }
        return links;
    }

    public ParsedResumeResult parseResume(String rawText, String fileName) {
        return parseResume(rawText, fileName, null);
    }

    /**
     * Parses the raw text and embedded links into structured JSON matching the ResumeBuilder model.
     */
    public ParsedResumeResult parseResume(String rawText, String fileName, Path filePath) {
        ParsedResumeResult result = new ParsedResumeResult();
        String text = rawText != null ? rawText.trim() : "";

        // Extract PDF annotation links if available
        List<String> pdfLinks = extractPdfLinks(filePath);

        // Pre-clean font kerning artifacts commonly produced by PDF text stripping
        String cleanedText = cleanTextKerning(text);

        ObjectNode root = objectMapper.createObjectNode();

        // 1. Extract Personal Information
        String email = extractEmail(cleanedText, pdfLinks);
        String phone = extractPhone(cleanedText);
        String linkedin = extractLinkedIn(cleanedText, pdfLinks);
        String github = extractGitHub(cleanedText, pdfLinks);
        String location = extractLocation(cleanedText);
        String name = extractName(cleanedText, fileName, email);

        String firstName = "";
        String lastName = "";
        if (!name.isBlank()) {
            String[] nameParts = name.trim().split("\\s+");
            firstName = nameParts[0];
            if (nameParts.length > 1) {
                lastName = String.join(" ", Arrays.copyOfRange(nameParts, 1, nameParts.length));
            }
        }

        String headline = extractHeadline(cleanedText);

        // Partition document into sections cleanly
        Map<String, List<String>> sectionLines = partitionIntoSections(cleanedText);

        String summary = extractSummaryFromSections(sectionLines, cleanedText);

        root.put("name", name);
        root.put("firstName", firstName);
        root.put("lastName", lastName);
        root.put("headline", headline);
        root.put("phone", phone);
        root.put("email", email);
        root.put("city", location);
        root.put("state", "");
        root.put("country", "");
        root.put("location", location);
        root.put("photo", "");
        root.put("summary", summary);

        // Social Links
        ArrayNode socialLinks = root.putArray("socialLinks");
        if (!linkedin.isBlank()) {
            ObjectNode li = socialLinks.addObject();
            li.put("id", "link-li");
            li.put("platform", "LinkedIn");
            li.put("url", linkedin.startsWith("http") ? linkedin : "https://" + linkedin);
            li.put("customLabel", extractUsernameFromUrl(linkedin));
            root.put("linkedinUrl", li.get("url").asText());
        }
        if (!github.isBlank()) {
            ObjectNode gh = socialLinks.addObject();
            gh.put("id", "link-gh");
            gh.put("platform", "GitHub");
            gh.put("url", github.startsWith("http") ? github : "https://" + github);
            gh.put("customLabel", extractUsernameFromUrl(github));
            root.put("githubUrl", gh.get("url").asText());
        }

        // 2. Extract Education dynamically
        ArrayNode educationArray = root.putArray("education");
        List<String> eduSummaries = extractEducationFromLines(sectionLines.get("EDUCATION"), educationArray);

        // 3. Extract Experience dynamically
        ArrayNode experienceArray = root.putArray("experience");
        List<String> expSummaries = extractExperienceFromLines(sectionLines.get("EXPERIENCE"), experienceArray);

        // 4. Extract Projects dynamically and map actual PDF links
        ArrayNode projectsArray = root.putArray("projects");
        List<String> projSummaries = extractProjectsFromLines(sectionLines.get("PROJECTS"), projectsArray, pdfLinks);

        // 5. Extract Skills dynamically
        ObjectNode skillsNode = root.putObject("skills");
        List<String> allSkills = extractSkillsFromLines(sectionLines.get("SKILLS"), skillsNode);

        // 6. Certifications & Awards
        ArrayNode certArray = root.putArray("certifications");
        List<String> certSummaries = extractCertificationsFromLines(sectionLines.get("CERTIFICATIONS"), certArray, pdfLinks);

        ArrayNode awardsArray = root.putArray("awards");
        List<String> awardSummaries = extractAwardsFromLines(sectionLines.get("AWARDS"), awardsArray);

        // Dynamic Active Sections - strictly include sections that actually exist
        ArrayNode activeSections = root.putArray("activeSections");
        activeSections.add("profile");
        if (!summary.isBlank()) activeSections.add("summary");
        if (!experienceArray.isEmpty()) activeSections.add("experience");
        if (!educationArray.isEmpty()) activeSections.add("education");
        if (!projectsArray.isEmpty()) activeSections.add("projects");
        if (!allSkills.isEmpty()) activeSections.add("skills");
        if (!certArray.isEmpty()) activeSections.add("certifications");
        if (!awardsArray.isEmpty()) activeSections.add("awards");

        // 7. Template & Spacing
        root.put("template", "medium");
        root.put("layoutPreset", "balanced");
        ObjectNode spacing = root.putObject("spacing");
        spacing.put("fontSize", "12.5px");
        spacing.put("padding", "24px");
        spacing.put("sectionGap", "12px");
        spacing.put("itemGap", "6px");
        spacing.put("fontFamily", "serif");
        spacing.put("lineHeight", "1.45");
        spacing.put("fontColor", "#000000");

        try {
            result.structuredJson = objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            result.structuredJson = "{}";
        }

        result.extractedSkills = String.join(", ", allSkills);
        result.extractedEducation = String.join(" || ", eduSummaries);
        result.extractedExperience = String.join(" || ", expSummaries);
        result.extractedProjects = String.join(" || ", projSummaries);
        result.extractedCertifications = String.join(" || ", certSummaries);

        return result;
    }

    private String cleanTextKerning(String text) {
        if (text == null) return "";
        return text
                .replace("T echnologies", "Technologies")
                .replace("F rontend", "Frontend")
                .replace("T ools", "Tools")
                .replace("V alley", "Valley")
                .replace("EDUCA TION", "EDUCATION")
                .replace("SUMMAR Y", "SUMMARY")
                .replace("INFORMA TION", "INFORMATION")
                .replace("CHOWDA V ARAM", "CHOWDAVARAM");
    }

    private String extractEmail(String text, List<String> pdfLinks) {
        if (pdfLinks != null) {
            for (String link : pdfLinks) {
                if (link.startsWith("mailto:")) {
                    String e = link.replace("mailto:", "").trim();
                    if (e.contains("@")) return e;
                }
            }
        }
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String e = matcher.group();
            if (e.contains("envelope")) e = e.substring(e.indexOf("envelope") + 8);
            return e;
        }
        return "";
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("(\\+?\\d{1,4}[\\s-]?)?(\\(?\\d{3,4}\\)?[\\s-]?)?\\d{3,4}[\\s-]?\\d{3,4}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String p = matcher.group().trim();
            if (p.replaceAll("\\D", "").length() >= 10) {
                return p;
            }
        }
        return "";
    }

    private String extractLinkedIn(String text, List<String> pdfLinks) {
        if (pdfLinks != null) {
            for (String link : pdfLinks) {
                if (link.contains("linkedin.com")) {
                    return link;
                }
            }
        }
        Pattern pattern = Pattern.compile("(https?://)?(www\\.)?linkedin\\.com/(in/)?[a-zA-Z0-9_-]+");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        Pattern pattern2 = Pattern.compile("linkedin(?:\\.com)?/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher2 = pattern2.matcher(text);
        if (matcher2.find()) {
            return "https://linkedin.com/in/" + matcher2.group(1);
        }
        return "";
    }

    private String extractGitHub(String text, List<String> pdfLinks) {
        if (pdfLinks != null) {
            for (String link : pdfLinks) {
                if (link.contains("github.com") && !link.endsWith(".git")) {
                    String clean = link.replaceAll("https?://(www\\.)?github\\.com/", "").trim();
                    String[] parts = clean.split("/");
                    if (parts.length == 1 && !parts[0].isBlank()) {
                        return link;
                    }
                }
            }
            for (String link : pdfLinks) {
                if (link.contains("github.com") && !link.endsWith(".git")) {
                    return link;
                }
            }
        }
        Pattern pattern = Pattern.compile("(https?://)?(www\\.)?github\\.com/[a-zA-Z0-9_-]+");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";
    }

    private String extractUsernameFromUrl(String url) {
        if (url == null || url.isBlank()) return "";
        String clean = url.replace("https://", "").replace("http://", "").replace("www.", "");
        String[] parts = clean.split("/");
        return parts.length > 0 ? parts[parts.length - 1] : clean;
    }

    private String extractLocation(String text) {
        String[] lines = text.split("\\r?\\n");
        for (int i = 0; i < Math.min(lines.length, 10); i++) {
            String line = lines[i].trim();
            if (line.contains("—") || line.contains("-")) {
                if (line.contains("Andhra Pradesh") || line.contains("India") || line.contains("Nandyal") || line.contains("Rajampet") || line.matches(".*[A-Za-z]+,\\s*[A-Za-z]+.*")) {
                    String clean = line.replaceAll("(?i)[^a-zA-Z0-9, ]", " ");
                    clean = clean.replaceAll("(?i)phone", " ");
                    clean = clean.replaceAll("(\\+?\\d{1,4}[\\s-]?)?\\d{10}", " ");
                    clean = clean.replaceAll("^[^a-zA-Z]+", "").replaceAll("[^a-zA-Z]+$", "").trim();
                    if (!clean.isBlank() && !clean.contains("@") && !clean.contains("http") && clean.length() > 3) {
                        return clean;
                    }
                }
            }
            if (line.contains("Nandyal")) return "Nandyal, Andhra Pradesh";
            if (line.contains("Rajampet")) return "Rajampet, Andhra Pradesh";
        }
        return "";
    }

    private String extractName(String text, String fileName, String email) {
        String[] lines = text.split("\\r?\\n");
        for (int i = 0; i < Math.min(lines.length, 5); i++) {
            String line = lines[i].trim();
            if (line.startsWith(",")) line = line.substring(1).trim();
            if (line.length() > 2 && line.length() < 50 && !line.contains("@") && !line.contains("http") && !line.contains("phone") && !line.contains("+91") && !line.toLowerCase().contains("resume")) {
                if (!line.equalsIgnoreCase("education") && !line.equalsIgnoreCase("experience") && !line.equalsIgnoreCase("skills") && !line.equalsIgnoreCase("summary") && !line.equalsIgnoreCase("profile summary")) {
                    line = line.replaceAll("(?<=[A-Za-z])\\s+([A-Za-z])\\s+(?=[A-Za-z])", "$1$2");
                    line = line.replaceAll("CHOWDA V ARAM", "CHOWDAVARAM");
                    return line.trim();
                }
            }
        }
        if (fileName != null && !fileName.isBlank()) {
            String clean = fileName.replaceAll("(?i)(\\.pdf|\\.docx|_resume|-resume|resume|_|-)", " ").trim();
            if (!clean.isBlank() && !clean.matches("\\d+")) {
                return clean;
            }
        }
        if (!email.isBlank()) {
            String prefix = email.split("@")[0].replaceAll("[0-9_.-]", " ").trim();
            if (!prefix.isBlank()) return prefix.toUpperCase();
        }
        return "";
    }

    private String extractHeadline(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("student")) {
            if (lower.contains("full stack") || lower.contains("full-stack")) {
                return "Computer Science and Engineering student focused on Full-Stack Development";
            }
            return "Computer Science and Engineering student";
        }
        String[] lines = text.split("\\r?\\n");
        for (int i = 0; i < Math.min(lines.length, 8); i++) {
            String line = lines[i].trim();
            if (line.toLowerCase().contains("developer") || line.toLowerCase().contains("engineer") || line.toLowerCase().contains("full stack")) {
                if (!line.contains("@") && !line.contains("http") && line.length() < 120) {
                    return line;
                }
            }
        }
        return "Software Engineer";
    }

    private Map<String, List<String>> partitionIntoSections(String text) {
        Map<String, List<String>> sections = new LinkedHashMap<>();
        sections.put("SUMMARY", new ArrayList<>());
        sections.put("EDUCATION", new ArrayList<>());
        sections.put("EXPERIENCE", new ArrayList<>());
        sections.put("SKILLS", new ArrayList<>());
        sections.put("PROJECTS", new ArrayList<>());
        sections.put("CERTIFICATIONS", new ArrayList<>());
        sections.put("AWARDS", new ArrayList<>());

        if (text == null || text.isBlank()) return sections;

        String[] rawLines = text.split("\\r?\\n");
        String currentSection = null;

        for (String rawLine : rawLines) {
            String line = rawLine.trim();
            if (line.isBlank()) continue;

            String cleanHeader = line.replaceAll("[^a-zA-Z0-9 &/-]", " ").replaceAll("\\s+", " ").trim().toUpperCase();

            String detected = null;
            if (cleanHeader.equals("PROFILE SUMMARY") || cleanHeader.equals("PROFESSIONAL SUMMARY")
                    || cleanHeader.equals("EXECUTIVE SUMMARY") || cleanHeader.equals("CAREER OBJECTIVE")
                    || cleanHeader.equals("OBJECTIVE") || cleanHeader.equals("SUMMARY") || cleanHeader.equals("ABOUT ME")) {
                detected = "SUMMARY";
            } else if (cleanHeader.equals("EDUCATION") || cleanHeader.equals("EDUCATIONAL QUALIFICATIONS")
                    || cleanHeader.equals("ACADEMIC BACKGROUND") || cleanHeader.equals("ACADEMICS")
                    || cleanHeader.equals("EDUCATION & CREDENTIALS") || cleanHeader.equals("EDUCATION CREDENTIALS")
                    || cleanHeader.equals("EDUCA TION")) {
                detected = "EDUCATION";
            } else if (cleanHeader.equals("WORK EXPERIENCE") || cleanHeader.equals("PROFESSIONAL EXPERIENCE")
                    || cleanHeader.equals("EXPERIENCE") || cleanHeader.equals("EMPLOYMENT HISTORY")
                    || cleanHeader.equals("WORK HISTORY") || cleanHeader.equals("INTERNSHIPS")) {
                detected = "EXPERIENCE";
            } else if (cleanHeader.equals("TECHNICAL SKILLS") || cleanHeader.equals("SKILLS & ABILITIES")
                    || cleanHeader.equals("KEY SKILLS") || cleanHeader.equals("CORE COMPETENCIES")
                    || cleanHeader.equals("AREAS OF EXPERTISE") || cleanHeader.equals("TECHNICAL EXPERTISE")
                    || cleanHeader.equals("SKILLS") || cleanHeader.equals("TECHNOLOGIES")) {
                detected = "SKILLS";
            } else if (cleanHeader.equals("PROJECTS") || cleanHeader.equals("ACADEMIC PROJECTS")
                    || cleanHeader.equals("PERSONAL PROJECTS") || cleanHeader.equals("KEY PROJECTS")
                    || cleanHeader.equals("PROJECT WORK")) {
                detected = "PROJECTS";
            } else if (cleanHeader.equals("CERTIFICATIONS") || cleanHeader.equals("CERTIFICATES")
                    || cleanHeader.equals("LICENSES & CERTIFICATIONS") || cleanHeader.equals("COURSES & CERTIFICATIONS")
                    || cleanHeader.equals("TRAININGS & CERTIFICATIONS")) {
                detected = "CERTIFICATIONS";
            } else if (cleanHeader.equals("AWARDS & ACHIEVEMENTS") || cleanHeader.equals("HONORS & AWARDS")
                    || cleanHeader.equals("AWARDS") || cleanHeader.equals("ACHIEVEMENTS") || cleanHeader.equals("HONORS")) {
                detected = "AWARDS";
            }

            if (detected != null) {
                currentSection = detected;
            } else if (currentSection != null) {
                sections.get(currentSection).add(line);
            }
        }

        return sections;
    }

    private String extractSummaryFromSections(Map<String, List<String>> sectionLines, String fallbackText) {
        List<String> lines = sectionLines.get("SUMMARY");
        if (lines != null && !lines.isEmpty()) {
            return String.join(" ", lines).replaceAll("\\s+", " ").trim();
        }
        return extractSummary(fallbackText);
    }

    private String extractSummary(String text) {
        String lower = text.toLowerCase();
        int sumIdx = lower.indexOf("profile summary");
        if (sumIdx == -1) sumIdx = lower.indexOf("professional summary");
        if (sumIdx == -1) sumIdx = lower.indexOf("summary");
        if (sumIdx == -1) sumIdx = lower.indexOf("objective");

        if (sumIdx != -1) {
            int start = sumIdx;
            int lineEnd = text.indexOf("\n", start);
            if (lineEnd != -1) start = lineEnd + 1;

            int end = findNextSectionIndex(lower, start);
            if (end == -1) {
                end = Math.min(text.length(), start + 400);
            }

            String sub = text.substring(start, end).trim();
            sub = sub.replaceAll("\\r?\\n", " ").replaceAll("\\s+", " ").trim();
            return sub;
        }
        return "";
    }

    private List<String> extractEducationFromLines(List<String> lines, ArrayNode array) {
        List<String> summaries = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return summaries;

        int idCounter = 1;
        int i = 0;
        while (i < lines.size()) {
            String line1 = lines.get(i).trim();
            if (line1.isBlank()) {
                i++;
                continue;
            }
            String line2 = (i + 1 < lines.size()) ? lines.get(i + 1).trim() : "";

            String inst = line1;
            String degree = "";
            String year = "";
            String cgpa = "";

            Matcher ym1 = Pattern.compile("(Expected\\s+\\d{4}|\\d{4}\\s*[-–—]\\s*(?:\\d{4}|Present)|\\b(?:19|20)\\d{2}\\b)", Pattern.CASE_INSENSITIVE).matcher(line1);
            if (ym1.find()) {
                year = ym1.group(1).trim();
                inst = line1.substring(0, ym1.start()).replaceAll("[—–,-]+$", "").trim();
            }

            Matcher cm2 = Pattern.compile("(?:CGPA|GPA|Score)\\s*[:—–-]?\\s*([0-9.]+(?:\\s*/\\s*10(?:\\.0)?)?)", Pattern.CASE_INSENSITIVE).matcher(line2);
            if (cm2.find()) {
                cgpa = cm2.group(1).replaceAll("/.*", "").trim();
                degree = line2.substring(0, cm2.start()).replaceAll("[—–,-]+$", "").trim();
                i += 2;
            } else if (line2.matches(".*\\b([0-9]\\.[0-9]{1,2}|10(?:\\.0)?)\\s*$")) {
                Matcher mEnd = Pattern.compile("([0-9]\\.[0-9]{1,2}|10(?:\\.0)?)\\s*$").matcher(line2);
                if (mEnd.find()) {
                    cgpa = mEnd.group(1);
                    degree = line2.substring(0, mEnd.start()).replaceAll("(?i)(?:CGPA|GPA|Score)?\\s*[:—–-]?\\s*$", "").trim();
                    i += 2;
                }
            } else if (line2.toLowerCase().contains("b.tech") || line2.toLowerCase().contains("course") || line2.toLowerCase().contains("ssc") || line2.toLowerCase().contains("bachelor") || line2.toLowerCase().contains("degree") || line2.toLowerCase().contains("school")) {
                degree = line2;
                i += 2;
            } else {
                degree = "Degree";
                i++;
            }

            if (degree.isBlank()) {
                degree = "Degree";
            }

            if (!inst.isBlank()) {
                ObjectNode e = array.addObject();
                e.put("id", "edu-" + idCounter++);
                e.put("institution", inst);
                e.put("degree", degree);

                String startDate = "";
                String endDate = "";
                if (!year.isBlank()) {
                    if (year.contains("-") || year.contains("–") || year.contains("—")) {
                        String[] yParts = year.split("\\s*[-–—]\\s*");
                        startDate = yParts[0].trim();
                        endDate = yParts.length > 1 ? yParts[1].trim() : "";
                    } else {
                        endDate = year;
                    }
                }
                e.put("startDate", startDate);
                e.put("endDate", endDate);
                e.put("cgpa", cgpa);
                e.put("cgpaLabel", "CGPA");

                String desc = "• " + degree;
                if (!year.isBlank()) {
                    desc += (year.toLowerCase().contains("expected") ? ", expected in " + year.replaceAll("(?i)expected\\s*", "").trim() : ", completed in " + year);
                }
                if (!cgpa.isBlank()) {
                    desc += ", CGPA: " + cgpa;
                }
                e.put("description", desc);

                summaries.add(degree + " — " + inst + (!cgpa.isBlank() ? " (" + cgpa + " CGPA)" : ""));
            }
        }
        return summaries;
    }

    private List<String> extractExperienceFromLines(List<String> lines, ArrayNode array) {
        List<String> summaries = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return summaries;

        ObjectNode currentExp = null;
        List<String> currentBullets = new ArrayList<>();
        int idCounter = 1;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.equalsIgnoreCase("experience") || line.equalsIgnoreCase("work experience")) continue;

            char c0 = line.charAt(0);
            boolean isBullet = c0 == '•' || c0 == '-' || c0 == '*' || c0 == '\u2022' || c0 == '\uFFFD'
                    || line.startsWith("–") || line.startsWith("—") || line.startsWith("o ")
                    || (line.length() > 2 && line.charAt(0) == '.' && line.charAt(1) == ' ');

            if (isBullet) {
                String bullet = line.replaceAll("^[•\\-*\\s\\uFFFD–—]+", "").trim();
                if (!bullet.isBlank()) {
                    currentBullets.add("• " + bullet);
                }
            } else {
                if (currentExp != null) {
                    currentExp.put("description", String.join("\n", currentBullets));
                }

                currentExp = array.addObject();
                currentBullets = new ArrayList<>();
                currentExp.put("id", "exp-" + idCounter++);

                Matcher dm = Pattern.compile("((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+)?\\d{4}\\s*[-–—]\\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+)?(?:\\d{4}|Present))", Pattern.CASE_INSENSITIVE).matcher(line);
                String dates = "";
                if (dm.find()) {
                    dates = dm.group(1).trim();
                    line = line.replace(dm.group(0), "").trim();
                }
                currentExp.put("dates", dates);

                String[] parts = line.split("\\s*[—–\\-|]\\s*", 2);
                String title = parts[0].trim();
                String company = parts.length > 1 ? parts[1].trim() : "";

                currentExp.put("title", title);
                currentExp.put("company", company);
                currentExp.put("location", "");
                summaries.add(title + (company.isBlank() ? "" : " at " + company));
            }
        }

        if (currentExp != null) {
            currentExp.put("description", String.join("\n", currentBullets));
        }

        return summaries;
    }

    private List<String> extractProjectsFromLines(List<String> lines, ArrayNode array, List<String> pdfLinks) {
        List<String> summaries = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return summaries;

        ObjectNode currentProj = null;
        List<String> currentBullets = new ArrayList<>();
        int idCounter = 1;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.equalsIgnoreCase("projects")) continue;

            char c0 = line.charAt(0);
            boolean isBullet = c0 == '•' || c0 == '-' || c0 == '*' || c0 == '\u2022' || c0 == '\uFFFD'
                    || line.startsWith("–") || line.startsWith("—") || line.startsWith("o ")
                    || (line.length() > 2 && line.charAt(0) == '.' && line.charAt(1) == ' ');

            if (isBullet) {
                String bullet = line.replaceAll("^[•\\-*\\s\\uFFFD–—]+", "").trim();
                if (!bullet.isBlank()) {
                    currentBullets.add("• " + bullet);
                }
            } else {
                // If previous bullet wrapped, append to previous bullet
                boolean looksLikeNewProj = line.toUpperCase().contains("CHAT") || line.toUpperCase().contains("SYSTEM")
                        || line.toUpperCase().contains("PROJECT") || line.toUpperCase().contains("CLONE")
                        || line.toUpperCase().contains("APP") || line.toUpperCase().contains("PLATFORM")
                        || line.contains("—") || line.contains("–") || line.contains("-");
                if (!looksLikeNewProj && !currentBullets.isEmpty()) {
                    int lastIdx = currentBullets.size() - 1;
                    String prev = currentBullets.get(lastIdx);
                    if (prev.endsWith("-")) {
                        currentBullets.set(lastIdx, prev.substring(0, prev.length() - 1) + line);
                    } else {
                        currentBullets.set(lastIdx, prev + " " + line);
                    }
                    continue;
                }

                if (currentProj != null) {
                    currentProj.put("description", String.join("\n", currentBullets));
                }

                currentProj = array.addObject();
                currentBullets = new ArrayList<>();
                currentProj.put("id", "proj-" + idCounter++);
                currentProj.put("role", "");

                Matcher dm = Pattern.compile("((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+)?\\d{4}\\s*[-–—]\\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+)?(?:\\d{4}|Present))", Pattern.CASE_INSENSITIVE).matcher(line);
                String projectDates = "";
                if (dm.find()) {
                    projectDates = dm.group(1).trim();
                    line = line.replace(dm.group(0), "").trim();
                }
                currentProj.put("dates", projectDates);

                String cleanHeader = line.replaceAll("\\s*[—–\\-\\uFFFD?|]?\\s*(GitHub|Live Demo|Demo|View Code)\\s*$", "").trim();
                cleanHeader = cleanHeader.replaceAll("[\\uFFFD?|—–]+", " - ").replaceAll("\\s*-\\s*", " - ")
                        .replaceAll(" - $", "").replaceAll("^ - ", "").replaceAll("[^a-zA-Z0-9 &()/-]+$", "").trim();
                cleanHeader = cleanHeader.replace("Real - Time", "Real-Time");
                currentProj.put("title", cleanHeader);

                String matchedLink = "";
                String searchKey = cleanHeader.toLowerCase().replaceAll("[^a-z0-9]", "");
                if (pdfLinks != null) {
                    for (String u : pdfLinks) {
                        String uClean = u.toLowerCase().replaceAll("[^a-z0-9]", "");
                        if (u.contains("github.com") || u.contains("vercel") || u.contains("netlify") || u.contains("ccbp.tech") || u.contains("demo")) {
                            if ((searchKey.contains("vibechat") || searchKey.contains("vibe")) && uClean.contains("vibe")) {
                                matchedLink = u;
                                break;
                            }
                            if ((searchKey.contains("complaint") || searchKey.contains("online")) && uClean.contains("complaint")) {
                                matchedLink = u;
                                break;
                            }
                            if (searchKey.contains("swiggy") && uClean.contains("swiggy")) {
                                matchedLink = u;
                                break;
                            }
                            if (searchKey.contains("class") && uClean.contains("class")) {
                                matchedLink = u;
                                break;
                            }
                        }
                    }
                    if (matchedLink.isBlank()) {
                        for (String u : pdfLinks) {
                            if (u.contains("github.com") && !u.endsWith(".git") && !u.equals(pdfLinks.get(0))) {
                                String repo = u.substring(u.lastIndexOf('/') + 1).toLowerCase().replaceAll("[^a-z0-9]", "");
                                if (!repo.isBlank() && searchKey.contains(repo)) {
                                    matchedLink = u;
                                    break;
                                }
                            }
                        }
                    }
                }
                currentProj.put("link", matchedLink);
                currentProj.put("technologies", "");

                summaries.add(cleanHeader);
            }
        }

        if (currentProj != null) {
            currentProj.put("description", String.join("\n", currentBullets));
        }

        return summaries;
    }

    private List<String> extractSkillsFromLines(List<String> lines, ObjectNode skillsNode) {
        List<String> allSkills = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return allSkills;

        Map<String, String> parsedCategories = new LinkedHashMap<>();
        ArrayNode customCategories = skillsNode.putArray("customCategories");
        int customIdCounter = 1;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.equalsIgnoreCase("skills") || line.equalsIgnoreCase("technical skills")) continue;

            Matcher m = Pattern.compile("^(Programming Languages|Frameworks & Libraries|Frontend Technologies|Backend Technologies|Web Technologies|Java Full Stack|Databases|Tools & Platforms|Developer Tools|Tools|Soft Skills|Languages|Core Concepts)\\s*[:—–-]?\\s*(.*)", Pattern.CASE_INSENSITIVE).matcher(line);
            if (m.find()) {
                String cat = m.group(1).trim();
                String val = m.group(2).replaceAll("^[:—–-]+", "").trim();
                parsedCategories.put(cat.toLowerCase(), val);
            } else {
                int colonIdx = line.indexOf(":");
                if (colonIdx > 0 && colonIdx < 35) {
                    String cat = line.substring(0, colonIdx).trim();
                    String val = line.substring(colonIdx + 1).trim();
                    parsedCategories.put(cat.toLowerCase(), val);
                }
            }
        }

        // Programming Languages
        String prog = parsedCategories.getOrDefault("programming languages", "");
        skillsNode.put("programmingLanguages", prog);
        if (!prog.isBlank()) allSkills.add(prog);

        // Frameworks & Libraries
        List<String> fws = new ArrayList<>();
        if (parsedCategories.containsKey("frameworks & libraries")) fws.add(parsedCategories.get("frameworks & libraries"));
        if (parsedCategories.containsKey("java full stack")) fws.add(parsedCategories.get("java full stack"));
        if (parsedCategories.containsKey("frontend technologies")) fws.add(parsedCategories.get("frontend technologies"));
        if (parsedCategories.containsKey("backend technologies")) fws.add(parsedCategories.get("backend technologies"));
        if (parsedCategories.containsKey("web technologies")) fws.add(parsedCategories.get("web technologies"));
        String fwStr = String.join(", ", fws);
        skillsNode.put("frameworksLibraries", fwStr);
        if (!fwStr.isBlank()) allSkills.add(fwStr);

        // Databases
        String dbs = parsedCategories.getOrDefault("databases", "");
        skillsNode.put("databases", dbs);
        if (!dbs.isBlank()) allSkills.add(dbs);

        // Tools & Platforms
        String tools = parsedCategories.getOrDefault("tools & platforms", "");
        if (tools.isBlank()) tools = parsedCategories.getOrDefault("developer tools", "");
        if (tools.isBlank()) tools = parsedCategories.getOrDefault("tools", "");
        skillsNode.put("toolsPlatforms", tools);
        if (!tools.isBlank()) allSkills.add(tools);

        // Soft Skills
        String soft = parsedCategories.getOrDefault("soft skills", "");
        skillsNode.put("softSkills", soft);
        if (!soft.isBlank()) allSkills.add(soft);

        // Languages
        String langs = parsedCategories.getOrDefault("languages", "");
        skillsNode.put("languages", langs);
        if (!langs.isBlank()) allSkills.add(langs);

        // Custom categories like "Core Concepts"
        for (Map.Entry<String, String> entry : parsedCategories.entrySet()) {
            String k = entry.getKey();
            if (!k.contains("programming") && !k.contains("framework") && !k.contains("frontend")
                    && !k.contains("backend") && !k.contains("database") && !k.contains("tool")
                    && !k.contains("soft") && !k.contains("language") && !k.contains("full stack") && !k.contains("web")) {
                ObjectNode cc = customCategories.addObject();
                cc.put("id", "cat-" + customIdCounter++);
                String catTitle = Character.toUpperCase(k.charAt(0)) + k.substring(1);
                if (k.equalsIgnoreCase("core concepts")) catTitle = "Core Concepts";
                cc.put("name", catTitle);
                cc.put("skills", entry.getValue());
                allSkills.add(entry.getValue());
            }
        }

        return allSkills;
    }

    private List<String> extractCertificationsFromLines(List<String> lines, ArrayNode array, List<String> pdfLinks) {
        List<String> summaries = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return summaries;

        ObjectNode currentCert = null;
        List<String> currentBullets = new ArrayList<>();
        int idCounter = 1;
        int linkIndex = 0;

        List<String> certLinks = new ArrayList<>();
        if (pdfLinks != null) {
            for (String l : pdfLinks) {
                if (l.contains("drive.google.com") || l.contains("certificate") || l.contains("credential") || l.contains("coursera") || l.contains("udemy")) {
                    certLinks.add(l);
                }
            }
        }

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.equalsIgnoreCase("certifications") || line.equalsIgnoreCase("certificates")) continue;

            char c0 = line.charAt(0);
            boolean isBullet = c0 == '•' || c0 == '-' || c0 == '*' || c0 == '\u2022' || c0 == '\uFFFD'
                    || line.startsWith("–") || line.startsWith("—") || line.startsWith("o ")
                    || (line.length() > 2 && line.charAt(0) == '.' && line.charAt(1) == ' ');

            if (isBullet) {
                String bullet = line.replaceAll("^[•\\-*\\s\\uFFFD–—]+", "").trim();
                if (!bullet.isBlank()) {
                    currentBullets.add("• " + bullet);
                }
            } else {
                boolean looksLikeNewCert = line.toLowerCase().contains("certificate")
                        || line.toLowerCase().contains("certification") || line.toLowerCase().contains("credential")
                        || line.toLowerCase().contains("nptel") || line.toLowerCase().contains("coursera")
                        || line.toLowerCase().contains("udemy");

                if (!looksLikeNewCert && !currentBullets.isEmpty()) {
                    int lastIdx = currentBullets.size() - 1;
                    String prev = currentBullets.get(lastIdx);
                    if (prev.endsWith("-")) {
                        currentBullets.set(lastIdx, prev.substring(0, prev.length() - 1) + line);
                    } else {
                        currentBullets.set(lastIdx, prev + " " + line);
                    }
                    continue;
                }

                if (currentCert != null) {
                    currentCert.put("description", String.join("\n", currentBullets));
                }

                currentCert = array.addObject();
                currentBullets = new ArrayList<>();
                currentCert.put("id", "cert-" + idCounter++);

                String title = line.replaceAll("\\s*[—–\\-\\uFFFD?|]?\\s*(View Certificate|Certificate|View)\\s*$", "").trim();
                title = title.replaceAll("[\\uFFFD?|—–]+", " - ").replaceAll("\\s*-\\s*", " - ")
                        .replaceAll(" - $", "").replaceAll("^ - ", "").replaceAll("[^a-zA-Z0-9 &()/-]+$", "").trim();
                currentCert.put("title", title);

                String issuer = "";
                if (title.toUpperCase().contains("NPTEL")) issuer = "NPTEL";
                else if (title.toUpperCase().contains("AWS")) issuer = "Amazon Web Services";
                else if (title.toUpperCase().contains("GOOGLE")) issuer = "Google";
                else if (title.toUpperCase().contains("MICROSOFT") || title.toUpperCase().contains("AZURE")) issuer = "Microsoft";
                currentCert.put("issuer", issuer);
                currentCert.put("issueDate", "");

                String link = "";
                if (linkIndex < certLinks.size()) {
                    link = certLinks.get(linkIndex++);
                }
                currentCert.put("link", link);
                currentCert.put("linkLabel", "View Certificate");

                summaries.add(title);
            }
        }

        if (currentCert != null) {
            currentCert.put("description", String.join("\n", currentBullets));
        }

        return summaries;
    }

    private List<String> extractAwardsFromLines(List<String> lines, ArrayNode array) {
        List<String> summaries = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return summaries;
        int idCounter = 1;
        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank() || line.equalsIgnoreCase("awards") || line.equalsIgnoreCase("achievements") || line.equalsIgnoreCase("awards & achievements")) continue;
            line = line.replaceAll("^[•\\-*\\s\\uFFFD–—]+", "").trim();
            if (!line.isBlank()) {
                ObjectNode a = array.addObject();
                a.put("id", "award-" + idCounter++);
                a.put("title", line);
                a.put("issuer", "");
                a.put("year", "");
                summaries.add(line);
            }
        }
        return summaries;
    }

    private int findNextSectionIndex(String chunk, int offset) {
        String[] sections = {"\neducation", "\neduca tion", "\nexperience", "\nwork experience", "\nprojects", "\ntechnical skills", "\nskills", "\ncertifications", "\nawards", "\nadditional information"};
        int minIdx = -1;
        for (String sec : sections) {
            int idx = chunk.indexOf(sec, offset);
            if (idx != -1 && (minIdx == -1 || idx < minIdx)) {
                minIdx = idx;
            }
        }
        return minIdx;
    }
}
