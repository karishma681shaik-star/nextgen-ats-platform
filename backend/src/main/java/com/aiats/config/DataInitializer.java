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
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CompanyRepository companyRepository,
                           JobRepository jobRepository,
                           ApplicationRepository applicationRepository,
                           SavedJobRepository savedJobRepository,
                           CandidateProfileRepository candidateProfileRepository,
                           CandidateSkillRepository candidateSkillRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.savedJobRepository = savedJobRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing authentic accounts, verified companies, and real recruiter jobs...");

        // 1. Clean up any unreal, broken, or test jobs (e.g. "Engineer 1", gibberish skills)
        cleanupUnrealJobs();

        // 2. Candidate: Karishma Shaik
        initCandidateKarishma();

        // 3. Admin: Marcus Vance
        initAdminMarcus();

        // 4. Verified Recruiter & Job: Coursera (Java Full Stack Developer)
        initCourseraJob();

        // 5. Verified Recruiter & Job: CloudScale AI Technologies (Senior Java Cloud Architect)
        initCloudScaleJob();

        // 6. Verified Recruiter & Job: American Express (Software Engineer II - Java & Distributed Systems)
        initAmericanExpressJob();

        logger.info("Database initialization complete. All jobs verified and ready for real candidate applications.");
    }

    private void cleanupUnrealJobs() {
        jobRepository.findAll().forEach(job -> {
            boolean isUnreal = false;
            String title = job.getTitle() != null ? job.getTitle().trim() : "";
            String skills = job.getSkills() != null ? job.getSkills() : "";
            String company = job.getCompany() != null ? job.getCompany().getName() : "";

            // Target "Engineer 1"
            if (title.equalsIgnoreCase("Engineer 1")) isUnreal = true;
            // Target gibberish skills from testing
            if (skills.contains("kfngkfdnkgnnfknnd")) isUnreal = true;
            // Target old American Express job with unrealistic salary
            if (company.equalsIgnoreCase("American Express") && job.getSalaryMax() != null
                    && job.getSalaryMax().compareTo(new BigDecimal("1000000")) > 0
                    && "USD".equalsIgnoreCase(job.getSalaryCurrency())) {
                isUnreal = true;
            }

            if (isUnreal) {
                try {
                    savedJobRepository.findAll().stream()
                            .filter(sj -> sj.getJob().getId().equals(job.getId()))
                            .forEach(savedJobRepository::delete);
                    applicationRepository.findByJobIdOrderByAppliedDateDesc(job.getId())
                            .forEach(applicationRepository::delete);
                    jobRepository.delete(job);
                    logger.info("Cleaned up unreal job: '{}' at '{}'", title, company);
                } catch (Exception ex) {
                    logger.warn("Could not delete unreal job {}: {}", title, ex.getMessage());
                }
            }
        });
    }

    private void initCandidateKarishma() {
        User candidate = userRepository.findByEmailIgnoreCase("karishma681shaik@gmail.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("karishma681shaik@gmail.com");
            u.setFullName("Karishma Shaik");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.CANDIDATE);
            u.setStatus(UserStatus.ACTIVE);
            u.setPhone("+91 98765 43210");
            u.setTitle("Senior Java Full Stack Engineer");
            return userRepository.save(u);
        });

        // Ensure password is always valid for login
        candidate.setPasswordHash(passwordEncoder.encode("Password123!"));
        candidate.setStatus(UserStatus.ACTIVE);
        candidate.setFullName("Karishma Shaik");
        candidate.setTitle("Senior Java Full Stack Engineer");
        userRepository.save(candidate);

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidate.getId()).orElseGet(() -> {
            CandidateProfile cp = new CandidateProfile();
            cp.setUser(candidate);
            cp.setCreatedAt(Instant.now());
            return candidateProfileRepository.save(cp);
        });

        profile.setTitle("Senior Java Full Stack Engineer");
        profile.setBio("Full Stack Java Developer proficient in Java 21, Spring Boot, React.js, Microservices, and Cloud Native architectures.");
        profile.setLocation("Bengaluru, Karnataka, India");
        profile.setGithubUrl("https://github.com/karishma681shaik-star");
        profile.setLinkedinUrl("https://www.linkedin.com/in/karishmashaik681/");
        profile.setProfileCompletion(95);
        candidateProfileRepository.save(profile);

        // Ensure candidate has verified technical skills
        List<CandidateSkill> existingSkills = candidateSkillRepository.findByCandidateProfileId(profile.getId());
        if (existingSkills.isEmpty()) {
            List<String> techSkills = List.of(
                    "Java", "Spring Boot", "React.js", "REST APIs", "PostgreSQL",
                    "Microservices", "Docker", "AWS", "Git", "SQL", "MongoDB", "Hibernate"
            );
            for (String s : techSkills) {
                candidateSkillRepository.save(new CandidateSkill(profile, s, SkillType.TECHNICAL));
            }
            logger.info("Seeded core technical skills for candidate Karishma Shaik.");
        }
    }

    private void initAdminMarcus() {
        User admin = userRepository.findByEmailIgnoreCase("admin@ai-ats.internal").orElseGet(() -> {
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
        admin.setPasswordHash(passwordEncoder.encode("Password123!"));
        userRepository.save(admin);
    }

    private void initCourseraJob() {
        // Coursera Recruiter
        User recruiter = userRepository.findByEmailIgnoreCase("talent@coursera.org").orElseGet(() -> {
            User u = new User();
            u.setEmail("talent@coursera.org");
            u.setFullName("Coursera Talent Acquisition");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.RECRUITER);
            u.setStatus(UserStatus.ACTIVE);
            u.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
            u.setCompanyName("Coursera");
            u.setTitle("Senior Technical Recruiter");
            return userRepository.save(u);
        });

        // Ensure Coursera Company is verified
        Company company = companyRepository.findByRecruiter(recruiter).orElseGet(() -> {
            Company c = new Company();
            c.setRecruiter(recruiter);
            c.setName("Coursera");
            c.setLogo("https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg");
            c.setTagline("Learn Without Limits. Connecting global learners to world-class education.");
            c.setIndustry("EdTech & Cloud Learning Infrastructure");
            c.setWebsite("https://www.coursera.org");
            c.setLocation("Mountain View, CA (Hybrid / Remote)");
            c.setSize("1,000-5,000 Employees");
            c.setDescription("Coursera partners with more than 275 leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.");
            c.setFoundedYear("2012");
            c.setBenefits("Comprehensive Healthcare, 401(k) Match, Unlimited PTO, Learning Stipend, Remote Flexibility");
            c.setContactEmail("careers@coursera.org");
            c.setVerified(true);
            return companyRepository.save(c);
        });
        company.setName("Coursera");
        company.setLogo("https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg");
        company.setVerified(true);
        companyRepository.save(company);

        // Ensure Real Coursera Job
        Optional<Job> existingJob = jobRepository.findAll().stream()
                .filter(j -> j.getCompany() != null && j.getCompany().getName().equalsIgnoreCase("Coursera"))
                .findFirst();

        Job job = existingJob.orElseGet(Job::new);
        job.setTitle("Java Full Stack Developer");
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setDepartment("Platform Engineering");
        job.setLocation("Mountain View, CA (Hybrid / Remote)");
        job.setEmploymentType("Full-time");
        job.setExperienceLevel("Mid Level");
        job.setSalaryMin(new BigDecimal("140000.00"));
        job.setSalaryMax(new BigDecimal("180000.00"));
        job.setSalaryCurrency("USD");
        job.setSkills("Java, Spring Boot, React.js, REST APIs, PostgreSQL, Microservices, Docker, AWS, Git");
        job.setDescription("Coursera is seeking a talented Java Full Stack Developer to build, scale, and optimize our core learning experience platform. You will design, develop, and maintain high-throughput microservices using Java 21 & Spring Boot, while creating responsive web interfaces using React.js.");
        job.setRequirements("B.Tech/B.E. or Master's in Computer Science, or related field||3+ years hands-on experience in Java and Spring Boot||Strong proficiency in React.js, JavaScript, and modern HTML/CSS||Proven track record designing and integrating RESTful APIs||Familiarity with PostgreSQL/MySQL, Docker, and AWS cloud deployment");
        job.setResponsibilities("Develop responsive web interfaces and robust microservices architecture||Build and consume enterprise REST APIs with secure authentication||Collaborate in an Agile environment with cross-functional product teams||Write clean, testable, and maintainable production code");
        job.setEducationRequired("Bachelor's Degree in Computer Science or related field");
        job.setExperienceRequiredYears(3);
        job.setDeadline("2026-12-31");
        job.setStatus(JobStatus.ACTIVE);
        if (job.getPostedDate() == null) job.setPostedDate(Instant.now().toString());

        jobRepository.save(job);
        logger.info("Initialized verified Coursera Java Full Stack Developer requisition.");
    }

    private void initCloudScaleJob() {
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
            return userRepository.save(u);
        });

        Company company = companyRepository.findByRecruiter(recruiter).orElseGet(() -> {
            Company c = new Company();
            c.setRecruiter(recruiter);
            c.setName("CloudScale AI Technologies");
            c.setLogo("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80");
            c.setTagline("Building Next-Generation Autonomous Cloud AI Systems");
            c.setIndustry("Artificial Intelligence & Cloud Computing");
            c.setWebsite("https://cloudscale.io");
            c.setLocation("San Francisco, CA (Hybrid)");
            c.setSize("250-500 Employees");
            c.setVerified(true);
            return companyRepository.save(c);
        });
        company.setVerified(true);
        companyRepository.save(company);

        Optional<Job> existingJob = jobRepository.findAll().stream()
                .filter(j -> j.getCompany() != null && j.getCompany().getName().equalsIgnoreCase("CloudScale AI Technologies"))
                .findFirst();

        Job job = existingJob.orElseGet(Job::new);
        job.setTitle("Senior Java Cloud Architect");
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setDepartment("Distributed Systems");
        job.setLocation("San Francisco, CA (Hybrid)");
        job.setEmploymentType("Full-time");
        job.setExperienceLevel("Senior Level");
        job.setSalaryMin(new BigDecimal("150000.00"));
        job.setSalaryMax(new BigDecimal("190000.00"));
        job.setSalaryCurrency("USD");
        job.setSkills("Java, Spring Boot, AWS, Kubernetes, Terraform, Docker, Microservices, Cloud Security");
        job.setDescription("CloudScale AI is hiring a Senior Java Cloud Architect to lead the design and implementation of distributed telemetry engines and autoscaling cloud infrastructure.");
        job.setRequirements("5+ years software engineering experience in enterprise Java systems and cloud orchestration||Expertise in Spring Boot, distributed caching, and event-driven architectures with Apache Kafka||Strong experience with container orchestration (Kubernetes, Docker) and AWS cloud infrastructure");
        job.setResponsibilities("Architect autonomous autoscaling systems and real-time observability telemetry pipelines||Lead technical implementation of core Java backend services handling high transaction throughput");
        job.setEducationRequired("Master's or Bachelor's in CS / Engineering");
        job.setExperienceRequiredYears(5);
        job.setDeadline("2026-11-30");
        job.setStatus(JobStatus.ACTIVE);
        if (job.getPostedDate() == null) job.setPostedDate(Instant.now().toString());

        jobRepository.save(job);
        logger.info("Initialized verified CloudScale AI Senior Java Cloud Architect requisition.");
    }

    private void initAmericanExpressJob() {
        User recruiter = userRepository.findByEmailIgnoreCase("careers@americanexpress.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("careers@americanexpress.com");
            u.setFullName("American Express Talent Acquisition");
            u.setPasswordHash(passwordEncoder.encode("Password123!"));
            u.setRole(Role.RECRUITER);
            u.setStatus(UserStatus.ACTIVE);
            u.setAvatarUrl("https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg");
            u.setCompanyName("American Express");
            u.setTitle("Global Talent Lead");
            return userRepository.save(u);
        });

        Company company = companyRepository.findByRecruiter(recruiter).orElseGet(() -> {
            Company c = new Company();
            c.setRecruiter(recruiter);
            c.setName("American Express");
            c.setLogo("https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg");
            c.setTagline("Powering Global Commerce and Seamless Enterprise Payments.");
            c.setIndustry("Financial Services & Global Enterprise Payments");
            c.setWebsite("https://www.americanexpress.com");
            c.setLocation("Bengaluru, Karnataka, India (Hybrid)");
            c.setSize("10,000+ Employees");
            c.setVerified(true);
            return companyRepository.save(c);
        });
        company.setVerified(true);
        companyRepository.save(company);

        Optional<Job> existingJob = jobRepository.findAll().stream()
                .filter(j -> j.getCompany() != null && j.getCompany().getName().equalsIgnoreCase("American Express")
                        && !"Engineer 1".equalsIgnoreCase(j.getTitle()))
                .findFirst();

        Job job = existingJob.orElseGet(Job::new);
        job.setTitle("Software Engineer II - Java & Distributed Systems");
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setDepartment("Global Merchant Services");
        job.setLocation("Bengaluru, Karnataka, India (Hybrid)");
        job.setEmploymentType("Full-time");
        job.setExperienceLevel("Mid Level");
        job.setSalaryMin(new BigDecimal("1800000.00"));
        job.setSalaryMax(new BigDecimal("2400000.00"));
        job.setSalaryCurrency("INR");
        job.setSkills("Java, Spring Boot, Distributed Systems, REST APIs, Microservices, SQL, Kafka, Git");
        job.setDescription("American Express is seeking a Software Engineer II to develop high-throughput transaction processing pipelines, resilient microservices, and secure payment APIs for millions of cardholders globally.");
        job.setRequirements("B.Tech/B.E. in Computer Science or related discipline||2+ years of professional backend development with Java and Spring Boot||Experience designing microservices, REST APIs, and relational databases (PostgreSQL/Oracle)||Understanding of distributed caching and Kafka message streaming");
        job.setResponsibilities("Design, build, and deploy fault-tolerant payment microservices||Participate in Agile sprints, architecture reviews, and automated CI/CD releases||Optimize database access and high-volume transaction routing");
        job.setEducationRequired("B.Tech / B.E. in Computer Science or Information Technology");
        job.setExperienceRequiredYears(2);
        job.setDeadline("2026-10-31");
        job.setStatus(JobStatus.ACTIVE);
        if (job.getPostedDate() == null) job.setPostedDate(Instant.now().toString());

        jobRepository.save(job);
        logger.info("Initialized verified American Express Software Engineer II requisition.");
    }
}
