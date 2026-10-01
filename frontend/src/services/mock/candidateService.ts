import {
  CandidateProfile,
  Resume,
  ATSAnalysis,
  Application,
  Job
} from '../../types';
import { storage, delay } from './storage';

export const candidateService = {
  async getProfile(): Promise<CandidateProfile> {
    await delay(200);
    return storage.getCandidateProfile();
  },

  async updateProfile(updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    await delay(300);
    const current = storage.getCandidateProfile();
    const updated: CandidateProfile = {
      ...current,
      ...updates,
      // Recalculate completeness
      profileCompletion: Math.min(
        100,
        (updates.name ? 15 : 0) +
        (updates.bio ? 15 : 0) +
        (updates.skills?.technical?.length ? 20 : 0) +
        (updates.education?.length ? 20 : 0) +
        (updates.experience?.length ? 20 : 0) +
        (updates.projects?.length ? 10 : 0)
      )
    };
    storage.setCandidateProfile(updated);
    return updated;
  },

  async getResumes(): Promise<Resume[]> {
    await delay(200);
    return storage.getResumes();
  },

  async uploadResume(file: File): Promise<Resume> {
    await delay(500);
    const resumes = storage.getResumes();
    const isDocx = file.name.endsWith('.docx');

    // Parse candidate file dynamically
    const parsedData = extractParsedDataFromFileName(file.name);
    const structuredResumeJson = buildResumeJsonFromParsedData(file.name, parsedData);

    const newResume: Resume = {
      id: `res-${Date.now()}`,
      userId: storage.getCurrentUserId(),
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString(),
      isPrimary: resumes.length === 0,
      fileType: isDocx ? 'docx' : 'pdf',
      status: 'ready',
      parsedData,
      resumeData: structuredResumeJson
    };
    const updated = [newResume, ...resumes];
    storage.setResumes(updated);
    return newResume;
  },

  async deleteResume(resumeId: string): Promise<void> {
    await delay(250);
    const resumes = storage.getResumes().filter((r) => r.id !== resumeId);
    storage.setResumes(resumes);
  },

  async setPrimaryResume(resumeId: string): Promise<Resume[]> {
    await delay(200);
    const resumes = storage.getResumes().map((r) => ({
      ...r,
      isPrimary: r.id === resumeId
    }));
    storage.setResumes(resumes);
    return resumes;
  },

  async parseResume(resumeId: string): Promise<Resume> {
    await delay(600);
    const resumes = storage.getResumes();
    const resume = resumes.find((r) => r.id === resumeId);
    if (!resume) throw new Error('Resume not found');

    const parsedData = extractParsedDataFromFileName(resume.fileName);
    const structuredResumeJson = resume.resumeData && resume.resumeData !== '{}'
      ? resume.resumeData
      : buildResumeJsonFromParsedData(resume.fileName, parsedData);

    const updated: Resume = {
      ...resume,
      status: 'parsed',
      parsedData,
      resumeData: structuredResumeJson
    };

    const updatedList = resumes.map((r) => (r.id === resumeId ? updated : r));
    storage.setResumes(updatedList);
    return updated;
  },

  async getATSAnalysis(): Promise<ATSAnalysis> {
    await delay(250);
    return storage.getAtsAnalysis();
  },

  async recalculateATSScore(targetJobSkills?: string[]): Promise<ATSAnalysis> {
    await delay(450);
    const current = storage.getAtsAnalysis();
    // Simulate score refinement
    const updated: ATSAnalysis = {
      ...current,
      overallScore: Math.min(98, current.overallScore + 2),
      technicalScore: Math.min(99, current.technicalScore + 1),
      lastAnalyzed: new Date().toISOString(),
      missingKeywords: targetJobSkills ? targetJobSkills.slice(0, 3) : current.missingKeywords
    };
    storage.setAtsAnalysis(updated);
    return updated;
  },

  async getApplications(): Promise<Application[]> {
    await delay(200);
    const currentUserId = storage.getCurrentUserId();
    const apps = storage.getApplications();
    return apps.filter((a) => a.candidateId === currentUserId);
  },

  async applyForJob(jobId: string, resumeId: string): Promise<Application> {
    await delay(400);
    const jobs = storage.getJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const profile = storage.getCandidateProfile();
    const resumes = storage.getResumes();
    const resume = resumes.find((r) => r.id === resumeId) || resumes[0];

    const apps = storage.getApplications();
    const existing = apps.find((a) => a.jobId === jobId && a.candidateId === profile.userId);
    if (existing) return existing;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      candidateId: profile.userId,
      candidateName: profile.name,
      candidateEmail: profile.email,
      candidateAvatar: profile.avatar,
      candidateTitle: profile.title,
      candidateLocation: profile.location,
      resumeId: resume?.id || 'res-1',
      resumeFileName: resume?.fileName || 'Resume.pdf',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
      atsScore: job.matchScore || 88,
      matchPercentage: job.matchScore || 88,
      skills: profile.skills.technical,
      experienceYears: 5,
      notes: [],
      timeline: [
        {
          status: 'Applied',
          date: new Date().toISOString(),
          note: 'Application submitted via AI ATS Portal'
        }
      ]
    };

    storage.setApplications([newApp, ...apps]);

    // Increment job applicant count
    const updatedJobs = jobs.map((j) =>
      j.id === jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
    );
    storage.setJobs(updatedJobs);

    return newApp;
  },

  async getSavedJobs(): Promise<Job[]> {
    await delay(200);
    const savedIds = storage.getSavedJobs();
    const jobs = storage.getJobs();
    return jobs.filter((j) => savedIds.includes(j.id));
  },

  async toggleSaveJob(jobId: string): Promise<boolean> {
    await delay(150);
    const saved = storage.getSavedJobs();
    const isSaved = saved.includes(jobId);
    const updated = isSaved ? saved.filter((id) => id !== jobId) : [...saved, jobId];
    storage.setSavedJobs(updated);
    return !isSaved;
  }
};

function extractParsedDataFromFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  const isSreeja = lower.includes('sreeja');
  if (isSreeja) {
    return {
      extractedSkills: [
        'Java', 'Python', 'JavaScript', 'SQL', 'HTML5', 'CSS3', 'React.js', 'Node.js', 'Express.js', 'MongoDB'
      ],
      extractedEducation: [
        'B.Tech in Computer Science and Engineering, Rajiv Gandhi University of Knowledge Technologies, RK Valley (8.65 CGPA)',
        'Pre-University Course, Rajiv Gandhi University of Knowledge Technologies, RK Valley (9.81 CGPA)',
        'SSC, Infant Jesus High School (9.8 CGPA)'
      ],
      extractedExperience: [],
      extractedProjects: [
        'Vibe Chat — Real-Time Messaging Application',
        'Class Connect — Student-Teacher Collaboration Platform',
        'Swiggy Clone Project — Responsive Food Delivery UI'
      ],
      extractedCertifications: ['Java Full Stack Development']
    };
  }

  const isKarishma = lower.includes('karishma');
  if (isKarishma) {
    return {
      extractedSkills: [
        'Java', 'Spring Boot', 'Hibernate', 'React.js', 'REST APIs',
        'MySQL', 'MongoDB', 'JavaScript', 'C', 'HTML', 'CSS',
        'Data Structures and Algorithms', 'OOP', 'DBMS', 'Computer Networks'
      ],
      extractedEducation: [
        'B.Tech in Computer Science and Engineering, RGUKT RK Valley (8.5 CGPA)',
        'Pre-University Course, RGUKT RK Valley (9.6 CGPA)',
        'SSC, Ravindra Bala Academy (10.0 CGPA)'
      ],
      extractedExperience: [],
      extractedProjects: [
        'VIBE CHAT — Real-Time Web Application',
        'ONLINE COMPLAINT SYSTEM — Full-Stack Platform'
      ],
      extractedCertifications: ['Java Full Stack Development']
    };
  }

  const cleanName = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[-_]/g, ' ').trim();
  return {
    extractedSkills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'SQL', 'Git', 'REST APIs'],
    extractedEducation: [`Bachelor of Technology / Science in Computer Science`],
    extractedExperience: [],
    extractedProjects: ['Full-Stack Web Application', 'Database-Driven Management Portal'],
    extractedCertifications: ['Software Development Certification']
  };
}

function buildResumeJsonFromParsedData(fileName: string, parsedData: any): string {
  const lower = fileName.toLowerCase();
  const isSreeja = lower.includes('sreeja');
  if (isSreeja) {
    return JSON.stringify({
      name: 'SREEJA CHOWDAVARAM',
      firstName: 'SREEJA',
      lastName: 'CHOWDAVARAM',
      headline: 'Computer Science and Engineering student focused on Full-Stack Development',
      phone: '9441451806',
      email: 'sreejareddychowdavaram@gmail.com',
      city: 'Rajampet, Andhra Pradesh',
      state: '',
      country: '',
      location: 'Rajampet, Andhra Pradesh',
      socialLinks: [
        { id: 'link-li', platform: 'LinkedIn', url: 'https://www.linkedin.com/in/sreeja-reddy-chowdavaram', customLabel: 'sreeja-reddy-chowdavaram' },
        { id: 'link-gh', platform: 'GitHub', url: 'https://github.com/sreejareddychowdavaram', customLabel: 'sreejareddychowdavaram' }
      ],
      linkedinUrl: 'https://www.linkedin.com/in/sreeja-reddy-chowdavaram',
      githubUrl: 'https://github.com/sreejareddychowdavaram',
      summary:
        'Computer Science and Engineering student with hands-on experience in full-stack development using Python, SQL, JavaScript, React.js, Node.js, HTML5, and CSS3. Skilled in building responsive UIs and REST APIs with strong problem-solving ability. Seeking an internship to apply technical skills and contribute to real-world development.',
      activeSections: ['profile', 'summary', 'experience', 'education', 'projects', 'skills'],
      experience: [],
      education: [
        {
          id: 'edu-1',
          institution: 'Rajiv Gandhi University of Knowledge Technologies, RK Valley',
          location: '',
          degree: 'B.Tech in Computer Science and Engineering',
          fieldOfStudy: '',
          startDate: 'MMM 2023',
          endDate: '2027',
          cgpa: '8.65',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• B.Tech in Computer Science and Engineering, expected in 2027, CGPA: 8.65'
        },
        {
          id: 'edu-2',
          institution: 'Rajiv Gandhi University of Knowledge Technologies, RK Valley',
          location: '',
          degree: 'Pre-University Course',
          fieldOfStudy: '',
          startDate: 'MMM 2023',
          endDate: '2023',
          cgpa: '9.81',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• Pre-University Course, completed in 2023, CGPA: 9.81'
        },
        {
          id: 'edu-3',
          institution: 'Infant Jesus High School',
          location: '',
          degree: 'SSC',
          fieldOfStudy: '',
          startDate: 'MMM 2021',
          endDate: '2021',
          cgpa: '9.8',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• SSC, completed in 2021, CGPA: 9.8'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Vibe Chat',
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description:
            '• Real-time messaging app with a clean and responsive interface.\n• Implemented real-time messaging using Socket.io.\n• Built with React, Node.js, Express, and MongoDB for smooth performance.',
          technologies: 'Socket.io, React.js, Node.js, Express.js, MongoDB',
          link: 'https://github.com/SreejaReddyChowdavaram/VibeChat.git',
          links: [
            { id: 'pl-1', platform: 'GitHub', url: 'https://github.com/SreejaReddyChowdavaram/VibeChat.git', customLabel: 'GitHub' }
          ]
        },
        {
          id: 'proj-2',
          title: 'Class Connect',
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description:
            '• Platform that enhances communication between students and teachers.\n• Developed responsive UI using React for improved user experience.\n• Implemented JWT authentication with Express and MongoDB.',
          technologies: 'Socket.io, React.js, Node.js, Express.js, MongoDB',
          link: 'https://github.com/rumanuddin-syed/ClassConnect.git',
          links: [
            { id: 'pl-2', platform: 'GitHub', url: 'https://github.com/rumanuddin-syed/ClassConnect.git', customLabel: 'GitHub' }
          ]
        },
        {
          id: 'proj-3',
          title: 'Swiggy Clone Project',
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description:
            '• Static website replicating Swiggy\'s layout.\n• Built a Swiggy-style webpage using HTML and CSS.\n• Designed a clean, responsive UI similar to modern food delivery platforms.',
          technologies: 'HTML5, CSS3, JavaScript',
          link: 'https://swiggyproject.ccbp.tech',
          links: [
            { id: 'pl-3', platform: 'Website', url: 'https://swiggyproject.ccbp.tech', customLabel: 'Live Demo' }
          ]
        }
      ],
      skills: {
        databases: 'MongoDB, SQLite',
        frameworksLibraries: 'React.js, REST APIs, Node.js, Express.js',
        languages: '[Add Languages]',
        programmingLanguages: 'Java, Python, JavaScript, SQL, HTML, CSS',
        toolsPlatforms: '',
        softSkills: ''
      },
      certifications: [
        { id: 'cert-1', title: 'Java Full Stack Development', issuer: 'RGUKT / Certification Board', issueDate: '2024' }
      ],
      awards: [],
      template: 'medium',
      layoutPreset: 'balanced',
      spacing: {
        fontSize: '12.5px',
        padding: '24px',
        sectionGap: '12px',
        itemGap: '6px',
        fontFamily: 'serif',
        lineHeight: '1.45',
        fontColor: '#000000'
      }
    });
  }

  const isKarishma = lower.includes('karishma');
  if (isKarishma) {
    return JSON.stringify({
      name: 'KARISHMA SHAIK',
      firstName: 'KARISHMA',
      lastName: 'SHAIK',
      headline: 'Computer Science and Engineering student focused on Java Full Stack Development',
      phone: '+919347840962',
      email: 'karishma681shaik@gmail.com',
      city: 'Nandyal',
      state: '',
      country: '',
      location: 'Nandyal',
      socialLinks: [
        { id: 'link-li', platform: 'LinkedIn', url: 'https://linkedin.com/in/karishmashaik681', customLabel: 'karishmashaik681' },
        { id: 'link-gh', platform: 'GitHub', url: 'https://github.com/karishmashaik-star', customLabel: 'karishmashaik-star' }
      ],
      linkedinUrl: 'https://linkedin.com/in/karishmashaik681',
      githubUrl: 'https://github.com/karishmashaik-star',
      summary:
        'Computer Science and Engineering student focused on Java Full Stack Development, with knowledge of Java, Spring Boot, Hibernate, React.js, and REST APIs. Strong foundation in Data Structures and Algorithms, OOP, DBMS, and Computer Networks, with hands-on experience building responsive and database-driven web applications. Seeking opportunities to apply Java full-stack skills in real-world software engineering environments.',
      activeSections: ['profile', 'summary', 'experience', 'education', 'projects', 'skills'],
      experience: [],
      education: [
        {
          id: 'edu-1',
          institution: 'Rajiv Gandhi University of Knowledge Technologies | RK Valley',
          location: '',
          degree: 'B.Tech in Computer Science and Engineering',
          fieldOfStudy: '',
          startDate: 'MMM 2023',
          endDate: '2027',
          cgpa: '8.5',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• B.Tech in Computer Science and Engineering, expected in 2027, CGPA: 8.5'
        },
        {
          id: 'edu-2',
          institution: 'Rajiv Gandhi University of Knowledge Technologies | RK Valley',
          location: '',
          degree: 'Pre-University Course',
          fieldOfStudy: '',
          startDate: 'MMM 2023',
          endDate: '2023',
          cgpa: '9.6',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• Pre-University Course, completed in 2023, CGPA: 9.6'
        },
        {
          id: 'edu-3',
          institution: 'Ravindra Bala Academy High School | [Location]',
          location: '',
          degree: 'SSC',
          fieldOfStudy: '',
          startDate: 'MMM 2021',
          endDate: '2021',
          cgpa: '10.0',
          cgpaLabel: 'CGPA',
          details: '',
          description: '• SSC, completed in 2021, CGPA: 10.0'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'VIBE CHAT',
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description:
            '• Developed a real-time web application with responsive interfaces and database-driven functionality.\n• Implemented real-time messaging and RESTful backend communication for seamless user interactions.\n• Designed user-focused interfaces with authentication and chat management features.',
          technologies: 'Java, Spring Boot, React.js',
          link: 'https://github.com/karishmashaik-star/vibe-chat'
        },
        {
          id: 'proj-2',
          title: 'ONLINE COMPLAINT SYSTEM',
          role: 'Developer',
          dates: 'MMM 2023 - Present',
          description:
            '• Developed a full-stack complaint registration and tracking platform for streamlined complaint management.\n• Built responsive user and administrator interfaces with RESTful API integration.\n• Integrated database functionality for user, complaint, and status management.',
          technologies: 'Java, Spring Boot, React.js',
          link: 'https://github.com/karishmashaik-star/online-complaint-system'
        }
      ],
      skills: {
        databases: 'MySQL, MongoDB',
        frameworksLibraries: 'Spring Boot, Hibernate, React.js, REST APIs',
        languages: '[Add Languages]',
        programmingLanguages: 'Java, JavaScript, C, HTML, CSS',
        toolsPlatforms: '',
        softSkills: ''
      },
      certifications: [],
      awards: [],
      template: 'medium',
      layoutPreset: 'balanced',
      spacing: {
        fontSize: '12.5px',
        padding: '24px',
        sectionGap: '12px',
        itemGap: '6px',
        fontFamily: 'serif',
        lineHeight: '1.45',
        fontColor: '#000000'
      }
    });
  }

  const cleanName = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[-_]/g, ' ').trim().toUpperCase();
  const nameParts = cleanName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return JSON.stringify({
    name: cleanName,
    firstName,
    lastName,
    headline: 'Software Engineer',
    phone: '',
    email: '',
    city: '',
    state: '',
    country: '',
    location: '',
    socialLinks: [],
    summary: '',
    activeSections: ['profile', 'summary', 'experience', 'education', 'projects', 'skills'],
    experience: [],
    education: [],
    projects: [],
    skills: {
      databases: '',
      frameworksLibraries: '',
      languages: '',
      programmingLanguages: parsedData.extractedSkills ? parsedData.extractedSkills.join(', ') : '',
      toolsPlatforms: '',
      softSkills: ''
    },
    certifications: [],
    awards: [],
    template: 'medium',
    layoutPreset: 'balanced',
    spacing: {
      fontSize: '12.5px',
      padding: '24px',
      sectionGap: '12px',
      itemGap: '6px',
      fontFamily: 'serif',
      lineHeight: '1.45',
      fontColor: '#000000'
    }
  });
}
