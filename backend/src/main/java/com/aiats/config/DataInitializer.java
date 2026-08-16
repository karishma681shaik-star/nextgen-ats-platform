package com.aiats.config;

import com.aiats.entity.*;
import com.aiats.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CandidateProfileRepository candidateProfileRepository,
                           CandidateSkillRepository candidateSkillRepository,
                           EducationRepository educationRepository,
                           ExperienceRepository experienceRepository,
                           ProjectRepository projectRepository,
                           CertificationRepository certificationRepository,
                           CompanyRepository companyRepository,
                           JobRepository jobRepository,
                           ResumeRepository resumeRepository,
                           ResumeAnalysisRepository resumeAnalysisRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Verifying and seeding initial database personas...");

        // 1. Candidate: Alex Rivera
        User candidate = userRepository.findByEmailIgnoreCase("alex.rivera@example.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("alex.rivera@example.com");
            u.setFullName("Alex Rivera");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.CANDIDATE);
            u.setStatus(UserStatus.ACTIVE);
            u.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            u.setTitle("Senior Full Stack & Cloud Architect");
            u.setPhone("+1 (555) 234-5678");
            return userRepository.save(u);
        });

        // Ensure candidate profile exists
        if (candidateProfileRepository.findByUser(candidate).isEmpty()) {
            CandidateProfile cp = new CandidateProfile(candidate);
            cp.setTitle("Senior Full Stack & Cloud Architect");
            cp.setLocation("San Francisco, CA");
            cp.setBio("Passionate full stack software engineer with 6+ years of expertise in distributed systems, Spring Boot, React, and cloud native architectures.");
            cp.setGithubUrl("https://github.com/alexrivera");
            cp.setLinkedinUrl("https://linkedin.com/in/alexrivera");
            cp.setWebsiteUrl("https://alexrivera.dev");
            cp.setProfileCompletion(92);
            CandidateProfile savedProfile = candidateProfileRepository.save(cp);

            // Skills
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "Java", SkillType.TECHNICAL));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "Spring Boot", SkillType.TECHNICAL));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "React", SkillType.TECHNICAL));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "TypeScript", SkillType.TECHNICAL));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "PostgreSQL", SkillType.TECHNICAL));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "Docker", SkillType.TOOLS));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "AWS", SkillType.TOOLS));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "System Design", SkillType.SOFT));
            candidateSkillRepository.save(new CandidateSkill(savedProfile, "English (Fluent)", SkillType.LANGUAGES));

            // Education
            Education edu = new Education();
            edu.setCandidateProfile(savedProfile);
            edu.setDegree("Bachelor of Science in Computer Science");
            edu.setInstitution("UC Berkeley");
            edu.setFieldOfStudy("Computer Science");
            edu.setStartYear("2016");
            edu.setEndYear("2020");
            edu.setGrade("3.85 GPA");
            educationRepository.save(edu);

            // Experience
            Experience exp = new Experience();
            exp.setCandidateProfile(savedProfile);
            exp.setCompany("Aether Cloud Systems");
            exp.setRole("Senior Full Stack Engineer");
            exp.setLocation("San Francisco, CA");
            exp.setStartDate("2023-01");
            exp.setCurrent(true);
            exp.setDescription("Architected resilient microservices handling 50M+ requests daily. Led cross-functional frontend and backend engineers.");
            exp.setTechnologies("Java, Spring Boot, React, AWS, PostgreSQL, Kafka");
            experienceRepository.save(exp);

            // Project
            Project proj = new Project();
            proj.setCandidateProfile(savedProfile);
            proj.setTitle("DevPulse Real-Time Analytics");
            proj.setDescription("Distributed developer telemetry and observability dashboard.");
            proj.setTechnologies("Spring Boot, WebSocket, React, Tailwind CSS");
            proj.setLink("https://devpulse.example.com");
            projectRepository.save(proj);

            // Certification
            Certification cert = new Certification();
            cert.setCandidateProfile(savedProfile);
            cert.setTitle("AWS Certified Solutions Architect – Associate");
            cert.setIssuer("Amazon Web Services");
            cert.setIssueDate("2023");
            certificationRepository.save(cert);

            // Resume & ATS Analysis
            Resume resume = new Resume();
            resume.setUser(candidate);
            resume.setFileName("Alex_Rivera_Senior_FullStack_Resume.pdf");
            resume.setFileSize("1.2 MB");
            resume.setFileType("pdf");
            resume.setPrimary(true);
            resume.setStatus("parsed");
            resume.setExtractedSkills("Java, Spring Boot, React, TypeScript, PostgreSQL, AWS, Docker, Kubernetes");
            resume.setExtractedEducation("BS in Computer Science - UC Berkeley");
            resume.setExtractedExperience("Senior Full Stack Engineer at Aether Cloud Systems (2023-Present)");
            Resume savedResume = resumeRepository.save(resume);

            ResumeAnalysis analysis = new ResumeAnalysis();
            analysis.setResume(savedResume);
            analysis.setOverallScore(94);
            analysis.setTechnicalScore(96);
            analysis.setKeywordScore(92);
            analysis.setSkillsScore(95);
            analysis.setExperienceScore(94);
            analysis.setEducationScore(90);
            analysis.setFormattingScore(98);
            analysis.setMissingKeywords("GraphQL, Terraform");
            analysis.setMissingSkills("GraphQL, Terraform");
            analysis.setStrengths("Strong architecture leadership demonstrated; Excellent quant metrics in work history; Clear tech stack stack alignment.");
            analysis.setWeaknesses("Could highlight more IaC infrastructure automation tools.");
            analysis.setRecommendations("Incorporate specific GraphQL and Terraform deployment accomplishments in experience section.");
            resumeAnalysisRepository.save(analysis);
        }

        // 2. Recruiter: Sarah Jenkins
        User recruiter = userRepository.findByEmailIgnoreCase("sarah.jenkins@cloudscale.io").orElseGet(() -> {
            User u = new User();
            u.setEmail("sarah.jenkins@cloudscale.io");
            u.setFullName("Sarah Jenkins");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.RECRUITER);
            u.setStatus(UserStatus.ACTIVE);
            u.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80");
            u.setCompanyName("CloudScale AI Technologies");
            u.setTitle("Head of Global Talent Acquisition");
            u.setPhone("+1 (555) 987-6543");
            return userRepository.save(u);
        });

        // Ensure Company exists
        Company company = companyRepository.findByRecruiter(recruiter).orElseGet(() -> {
            Company c = new Company();
            c.setRecruiter(recruiter);
            c.setName("CloudScale AI Technologies");
            c.setLogo("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80");
            c.setTagline("Building Next-Generation Autonomous Cloud AI Systems");
            c.setIndustry("Artificial Intelligence & Cloud Computing");
            c.setWebsite("https://cloudscale.io");
            c.setLocation("San Francisco, CA");
            c.setSize("250-500 Employees");
            c.setDescription("CloudScale AI is the premier platform empowering enterprise engineering teams with autonomous infrastructure.");
            c.setFoundedYear("2021");
            c.setBenefits("Comprehensive Health, 401(k) Matching, Remote First, Learning Stipend");
            c.setContactEmail("careers@cloudscale.io");
            c.setContactPhone("+1 (555) 987-6543");
            c.setVerified(true);
            return companyRepository.save(c);
        });

        // Seed initial Jobs if empty
        if (jobRepository.count() == 0) {
            Job job1 = new Job();
            job1.setCompany(company);
            job1.setRecruiter(recruiter);
            job1.setTitle("Senior Full Stack Engineer (Java + React)");
            job1.setDepartment("Engineering");
            job1.setLocation("San Francisco, CA (Hybrid)");
            job1.setEmploymentType("Full-time");
            job1.setExperienceLevel("Senior Level");
            job1.setSalaryMin(new BigDecimal("160000"));
            job1.setSalaryMax(new BigDecimal("210000"));
            job1.setSalaryCurrency("USD");
            job1.setSalaryPeriod("yearly");
            job1.setDescription("We are looking for a Senior Full Stack Engineer to lead the development of our core cloud intelligence web platform.");
            job1.setResponsibilities("Design robust REST and GraphQL APIs using Spring Boot; Build responsive interfaces in React; Collaborate with ML infrastructure teams.");
            job1.setRequirements("5+ years building production applications; Strong proficiency in Java, Spring Boot, React, TypeScript, and SQL.");
            job1.setSkills("Java, Spring Boot, React, TypeScript, PostgreSQL, AWS, Docker");
            job1.setEducationRequired("Bachelor's in CS or equivalent");
            job1.setExperienceRequiredYears(5);
            job1.setDeadline("2026-10-31");
            job1.setStatus(JobStatus.ACTIVE);
            job1.setApplicantCount(8);
            job1.setPostedDate("2026-08-10");
            jobRepository.save(job1);

            Job job2 = new Job();
            job2.setCompany(company);
            job2.setRecruiter(recruiter);
            job2.setTitle("Lead AI/ML Platform Architect");
            job2.setDepartment("AI Research");
            job2.setLocation("Remote (US)");
            job2.setEmploymentType("Full-time");
            job2.setExperienceLevel("Lead");
            job2.setSalaryMin(new BigDecimal("200000"));
            job2.setSalaryMax(new BigDecimal("260000"));
            job2.setSalaryCurrency("USD");
            job2.setSalaryPeriod("yearly");
            job2.setDescription("Lead the architectural vision for our high-throughput AI inference and vector retrieval pipelines.");
            job2.setResponsibilities("Architect scalable AI pipelines; Optimize model serving latency; Mentor senior engineers.");
            job2.setRequirements("7+ years in distributed systems and ML engineering.");
            job2.setSkills("Python, PyTorch, Kubernetes, Java, Kafka, Vector DB");
            job2.setEducationRequired("Master's or Ph.D. in CS/AI");
            job2.setExperienceRequiredYears(7);
            job2.setDeadline("2026-11-15");
            job2.setStatus(JobStatus.ACTIVE);
            job2.setApplicantCount(4);
            job2.setPostedDate("2026-08-12");
            jobRepository.save(job2);
        }

        // 3. Admin: Marcus Vance
        userRepository.findByEmailIgnoreCase("admin@ai-ats.internal").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@ai-ats.internal");
            u.setFullName("Marcus Vance");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.ADMIN);
            u.setStatus(UserStatus.ACTIVE);
            u.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
            u.setTitle("Lead System Administrator");
            u.setPhone("+1 (555) 111-2233");
            return userRepository.save(u);
        });

        logger.info("Database persona accounts successfully initialized and synced.");
    }
}
