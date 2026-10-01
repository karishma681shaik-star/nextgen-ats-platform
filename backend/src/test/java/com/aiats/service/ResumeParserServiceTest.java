package com.aiats.service;

import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

public class ResumeParserServiceTest {

    @Test
    public void testParseSreejaResume() {
        ResumeParserService service = new ResumeParserService();
        Path sreejaPath = Paths.get("uploads/resumes/f67405f1-fd3d-48e8-94ed-d08da5d05ccf_1788589061532.pdf");
        if (!java.nio.file.Files.exists(sreejaPath)) {
            sreejaPath = Paths.get("backend/uploads/resumes/f67405f1-fd3d-48e8-94ed-d08da5d05ccf_1788589061532.pdf");
        }

        String rawText = service.extractRawText(sreejaPath, "pdf");
        ResumeParserService.ParsedResumeResult result = service.parseResume(rawText, "SREEJA CHOWDAVARAM.pdf", sreejaPath);

        int p = rawText.indexOf("PROJECTS");
        System.out.println("rawText.indexOf(PROJECTS): " + p);
        if (p != -1) {
            String chunk = rawText.substring(p + 8);
            System.out.println("chunk preview: " + chunk.substring(0, Math.min(200, chunk.length())));
        }
        System.out.println("=== PARSED RESULT JSON ===");
        System.out.println(result.structuredJson);

        assertNotNull(result.structuredJson);
        assertTrue(result.structuredJson.contains("SREEJA CHOWDAVARAM"));
        assertTrue(result.structuredJson.contains("sreejareddychowdavaram@gmail.com"));
        assertTrue(result.structuredJson.contains("sreeja-reddy-chowdavaram"));
        assertTrue(result.structuredJson.contains("Infant Jesus High School"));
        assertTrue(result.structuredJson.contains("Vibe Chat"));
        assertTrue(result.structuredJson.contains("Class Connect"));
        assertTrue(result.structuredJson.contains("Swiggy Clone Project"));
        assertTrue(result.structuredJson.contains("https://github.com/SreejaReddyChowdavaram/VibeChat.git"));

        // Sync to DB if PostgreSQL is available
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection("jdbc:postgresql://localhost:5432/ai_ats_db", "postgres", "postgres")) {
            try (java.sql.Statement stmt = conn.createStatement()) {
                java.sql.ResultSet rs = stmt.executeQuery("SELECT id, file_name, file_path FROM resumes");
                while (rs.next()) {
                    String id = rs.getString("id");
                    String fn = rs.getString("file_name");
                    String fp = rs.getString("file_path");
                    System.out.println("DB Resume: id=" + id + ", file_name=" + fn + ", file_path=" + fp);
                }

                // Update Sreeja's resume record (both fd6388a3 and any matching sreeja or 1788589061532)
                String updateSql = "UPDATE resumes SET resume_data = ?, status = 'parsed', extracted_skills = ?, extracted_education = ?, extracted_projects = ? WHERE LOWER(file_name) LIKE '%sreeja%' OR file_path LIKE '%1788589061532%' OR id = 'fd6388a3-c06e-45dc-bffe-91261e7c1910'";
                try (java.sql.PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, result.structuredJson);
                    ps.setString(2, result.extractedSkills);
                    ps.setString(3, result.extractedEducation);
                    ps.setString(4, result.extractedProjects);
                }
            }
        } catch (Exception e) {
            System.out.println("DB sync note: " + e.getMessage());
        }
    }

    @Test
    public void testParseKarishmaResume() {
        ResumeParserService service = new ResumeParserService();
        Path karishmaPath = Paths.get("C:/Users/karis/Downloads/KARISHMA-RESUME.pdf");
        if (java.nio.file.Files.exists(karishmaPath)) {
            String rawText = service.extractRawText(karishmaPath, "pdf");
            System.out.println("=== RAW TEXT OF KARISHMA RESUME ===");
            System.out.println(rawText);
            System.out.println("=== PDF LINKS ===");
            List<String> links = service.extractPdfLinks(karishmaPath);
            System.out.println(links);
            ResumeParserService.ParsedResumeResult result = service.parseResume(rawText, "KARISHMA-RESUME.pdf", karishmaPath);
            System.out.println("=== PARSED RESULT JSON ===");
            System.out.println(result.structuredJson);

            // Sync to DB if PostgreSQL is available
            try (java.sql.Connection conn = java.sql.DriverManager.getConnection("jdbc:postgresql://localhost:5432/ai_ats_db", "postgres", "postgres")) {
                String updateSql = "UPDATE resumes SET resume_data = ?, status = 'parsed', extracted_skills = ?, extracted_education = ?, extracted_projects = ? WHERE LOWER(file_name) LIKE '%karishma%' OR id IN (SELECT id FROM resumes WHERE LOWER(file_name) LIKE '%karishma%')";
                try (java.sql.PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, result.structuredJson);
                    ps.setString(2, result.extractedSkills);
                    ps.setString(3, result.extractedEducation);
                    ps.setString(4, result.extractedProjects);
                    int updated = ps.executeUpdate();
                    System.out.println("Updated " + updated + " Karishma resume rows in DB with pristine parsed data!");
                }
            } catch (Exception e) {
                System.out.println("DB sync note: " + e.getMessage());
            }
        }
    }
}
