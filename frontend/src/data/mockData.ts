import {
  User,
  CandidateProfile,
  Resume,
  ATSAnalysis,
  Job,
  Application,
  Company,
  AdminStats,
  RecruiterStats,
  AppNotification,
  SystemActivityLog
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-cand-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-15T09:30:00Z',
    phone: '+1 (555) 234-5678',
    title: 'Senior Full Stack Engineer'
  },
  {
    id: 'usr-rec-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@cloudscale.io',
    role: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-11-20T14:15:00Z',
    phone: '+1 (555) 876-5432',
    companyName: 'CloudScale AI Technologies',
    title: 'Head of Talent Acquisition'
  },
  {
    id: 'usr-adm-1',
    name: 'Marcus Vance',
    email: 'admin@ai-ats.internal',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-08-01T08:00:00Z',
    phone: '+1 (555) 999-0000',
    title: 'Principal Platform Administrator'
  },
  {
    id: 'usr-cand-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-01T10:00:00Z',
    phone: '+91 98765 43210',
    title: 'Backend Java / Distributed Systems Engineer'
  },
  {
    id: 'usr-cand-3',
    name: 'David Chen',
    email: 'david.chen@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-10T11:20:00Z',
    phone: '+1 (555) 456-7890',
    title: 'AI / ML Engineer'
  },
  {
    id: 'usr-rec-2',
    name: 'Elena Rostova',
    email: 'elena@nexusfintech.com',
    role: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2025-12-05T16:45:00Z',
    phone: '+1 (555) 678-1234',
    companyName: 'Nexus Fintech Corp',
    title: 'Senior Technical Recruiter'
  },
  {
    id: 'usr-cand-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-05T10:00:00Z',
    phone: '+1 (555) 345-6789',
    title: 'Senior Frontend Engineer (Design Systems)'
  },
  {
    id: 'usr-cand-5',
    name: 'Aisha Patel',
    email: 'aisha.patel@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-07T12:00:00Z',
    phone: '+1 (555) 789-0123',
    title: 'Cloud DevOps & Site Reliability Engineer'
  },
  {
    id: 'usr-cand-6',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-08T09:30:00Z',
    phone: '+1 (555) 890-1234',
    title: 'Senior Distributed Backend Engineer'
  },
  {
    id: 'usr-cand-7',
    name: "Liam O'Connor",
    email: 'liam.oconnor@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-06T15:00:00Z',
    phone: '+1 (555) 901-2345',
    title: 'Lead Full Stack Engineer (Java + React)'
  },
  {
    id: 'usr-cand-8',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-09T14:15:00Z',
    phone: '+1 (555) 012-3456',
    title: 'Applied AI / NLP Research Engineer'
  },
  {
    id: 'usr-cand-9',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-03T11:00:00Z',
    phone: '+1 (555) 123-4567',
    title: 'Staff Systems Architect'
  },
  {
    id: 'usr-cand-10',
    name: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-04T16:30:00Z',
    phone: '+1 (555) 234-5670',
    title: 'Junior Web Developer'
  }
];

export const INITIAL_CANDIDATE_PROFILE: CandidateProfile = {
  id: 'cand-prof-1',
  userId: 'usr-cand-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (Open to Remote)',
  title: 'Senior Full Stack & Cloud Application Engineer',
  bio: 'Product-minded software engineer with 5+ years of experience designing scalable distributed web architectures, high-throughput RESTful microservices, and reactive user interfaces. Passionate about AI-assisted developer workflows and cloud resilience.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  websiteUrl: 'https://alexrivera.dev',
  profileCompletion: 88,
  skills: {
    technical: ['React', 'TypeScript', 'Node.js', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Tailwind CSS'],
    soft: ['Technical Leadership', 'Cross-functional Collaboration', 'Agile/Scrum', 'System Architecture Design', 'Mentorship'],
    tools: ['Git', 'Docker', 'Kubernetes', 'Postman', 'VS Code', 'Jira', 'Figma'],
    languages: ['English (Fluent)', 'Spanish (Conversational)', 'German (Basic)']
  },
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      fieldOfStudy: 'Computer Science & Software Engineering',
      startYear: '2017',
      endYear: '2021',
      grade: '3.85 GPA (Magna Cum Laude)'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Aether Cloud Systems',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-03',
      endDate: '',
      current: true,
      description: 'Spearheaded the redesign of the core telemetry dashboard reducing latency by 45%. Architected microservices handling over 50M requests daily using TypeScript, React, and Java microservices.',
      technologies: ['React', 'TypeScript', 'Java', 'Kafka', 'PostgreSQL', 'AWS']
    },
    {
      id: 'exp-2',
      company: 'Vanguard Digital Labs',
      role: 'Full Stack Software Engineer',
      location: 'San Jose, CA',
      startDate: '2021-06',
      endDate: '2023-02',
      current: false,
      description: 'Developed scalable client-facing enterprise portals. Implemented end-to-end CI/CD deployment pipelines on AWS ECS and reduced bundle size by 30%.',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Tailwind']
    }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevPulse — Real-Time Developer Analytics Engine',
      description: 'High-performance observability dashboard aggregating Git metrics, PR turnaround velocity, and test suite health for 1,200+ active engineers.',
      technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Redis'],
      link: 'https://devpulse-demo.app',
      githubUrl: 'https://github.com/example/devpulse'
    },
    {
      id: 'proj-2',
      title: 'DocuQuery AI — Smart Document Search',
      description: 'Semantic search engine processing technical PDF documentation and extracting contextual snippets using vector embeddings and intuitive reactive UI.',
      technologies: ['TypeScript', 'FastAPI', 'Python', 'React', 'Tailwind CSS'],
      link: 'https://docuquery.ai',
      githubUrl: 'https://github.com/example/docuquery'
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2024-05',
      credentialUrl: 'https://aws.amazon.com/verification'
    },
    {
      id: 'cert-2',
      title: 'Certified Kubernetes Application Developer (CKAD)',
      issuer: 'Cloud Native Computing Foundation',
      issueDate: '2023-11',
      credentialUrl: 'https://cncf.io/verify'
    }
  ]
};

export const INITIAL_RESUMES: Resume[] = [
  {
    id: '8e5cd806-7a11-4074-af40-0caa6ad03a28',
    userId: 'usr-cand-1',
    fileName: 'KARISHMA-RESUME.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-02-28T14:30:00Z',
    isPrimary: true,
    fileType: 'pdf',
    status: 'parsed',
    parsedData: {
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
    },
    resumeData: JSON.stringify({
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
      activeSections: [
        'profile',
        'summary',
        'experience',
        'education',
        'projects',
        'skills'
      ],
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
      }
    })
  },
  {
    id: 'res-1',
    userId: 'usr-cand-1',
    fileName: 'Alex_Rivera_Senior_FullStack_2026.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-02-12T14:30:00Z',
    isPrimary: false,
    fileType: 'pdf',
    status: 'parsed',
    parsedData: {
      extractedSkills: ['React', 'TypeScript', 'Node.js', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
      extractedEducation: ['BS Computer Science, UC Berkeley (3.85 GPA)'],
      extractedExperience: ['Senior Software Engineer at Aether Cloud Systems (2023-Present)', 'Full Stack Engineer at Vanguard Labs (2021-2023)'],
      extractedProjects: ['DevPulse Analytics Engine', 'DocuQuery AI Semantic Search'],
      extractedCertifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Application Developer']
    }
  },
  {
    id: 'res-2',
    userId: 'usr-cand-1',
    fileName: 'Alex_Rivera_Backend_Cloud_Architect.docx',
    fileSize: '850 KB',
    uploadDate: '2026-01-20T10:15:00Z',
    isPrimary: false,
    fileType: 'docx',
    status: 'ready'
  }
];

export const INITIAL_ATS_ANALYSIS: ATSAnalysis = {
  id: 'ats-1',
  resumeId: 'res-1',
  overallScore: 86,
  technicalScore: 91,
  breakdown: {
    keywordScore: 88,
    skillsScore: 92,
    experienceScore: 85,
    educationScore: 90,
    formattingScore: 95
  },
  missingKeywords: [
    'Kubernetes Cluster Orchestration',
    'Microservices Resilience (Circuit Breaker)',
    'Event-Driven Architecture (Kafka)',
    'Redis Cache Invalidation',
    'CI/CD Pipeline Automation (GitHub Actions)'
  ],
  missingSkills: [
    'Apache Kafka Streaming',
    'Terraform Infrastructure as Code',
    'Distributed Tracing (OpenTelemetry)'
  ],
  strengths: [
    'Clear, quantifiable business impact bullet points (e.g. "reduced latency by 45%", "50M requests daily").',
    'Strong alignment between technical skill stack and modern cloud enterprise requirements.',
    'Clean, ATS-friendly section headers and semantic chronological formatting with zero multi-column parse traps.',
    'Accredited educational background with verified certifications (AWS Solutions Architect, CKAD).'
  ],
  weaknesses: [
    'Limited explicit mentions of cloud disaster recovery and high availability SLAs.',
    'Section summary could include more high-level keywords regarding distributed systems benchmarking.',
    'Some bullet points in older experience could benefit from explicit revenue or throughput metrics.'
  ],
  recommendations: [
    'Embed target keywords such as "Event-Driven Microservices" and "Kafka Event Streaming" in your Aether Cloud project summary.',
    'Add an explicit metric for system uptime or test coverage percentage (e.g. "Maintained 99.95% service availability").',
    'Incorporate Terraform or Infrastructure-as-Code keywords to strengthen Senior/Lead level relevance.'
  ],
  lastAnalyzed: '2026-02-14T09:00:00Z'
};

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-amex',
    name: 'American Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
    tagline: "Don't live life without it. Powering global commerce and financial innovation.",
    industry: 'Financial Services & Enterprise Technology',
    website: 'https://www.americanexpress.com',
    location: 'Bengaluru, Karnataka, India / New York, NY (Hybrid)',
    size: '10,000+ employees',
    description: 'American Express is a globally integrated payments company providing customers with access to products, insights, and experiences that enrich lives and build business success.',
    foundedYear: '1850',
    benefits: [
      'Comprehensive Medical, Dental & Vision Coverage',
      'Flexible Hybrid Work Model',
      'Competitive Annual Bonuses & Equity Grants',
      'Continuous Professional Learning Stipends'
    ],
    contactEmail: 'careers@americanexpress.com',
    contactPhone: '+1 (800) 528-4800',
    verified: true
  },
  {
    id: 'comp-1',
    name: 'CloudScale AI Technologies',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    tagline: 'Empowering enterprise engineering with intelligent automated cloud orchestration.',
    industry: 'Cloud Infrastructure & Artificial Intelligence',
    website: 'https://cloudscale.io',
    location: 'San Francisco, CA (Hybrid / Remote)',
    size: '250-500 employees',
    description: 'CloudScale AI builds next-generation developer tooling, distributed observability infrastructure, and AI-driven autoscaling engines trusted by Fortune 500 tech leaders globally.',
    foundedYear: '2019',
    benefits: [
      'Comprehensive Medical, Dental & Vision (100% covered)',
      'Flexible Remote Work / $1,500 Home Office Stipend',
      'Annual $3,000 Learning & Conference Budget',
      'Unlimited Paid Time Off & Mental Health Days',
      '401(k) Matching up to 5%'
    ],
    contactEmail: 'careers@cloudscale.io',
    contactPhone: '+1 (415) 555-0199',
    verified: true
  },
  {
    id: 'comp-2',
    name: 'Nexus Fintech Corp',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
    tagline: 'Ultra-low latency settlement rails for global institutional finance.',
    industry: 'Financial Technology / High-Frequency Trading',
    website: 'https://nexusfintech.com',
    location: 'New York, NY (Hybrid)',
    size: '500-1,000 employees',
    description: 'Nexus Fintech powers real-time cross-border settlements, smart fraud detection networks, and algorithmic trading liquidity pools across 40+ global exchanges.',
    foundedYear: '2016',
    benefits: [
      'Top-tier competitive base + performance bonus',
      'Full healthcare coverage + wellness stipend',
      'Catered gourmet meals and on-site gym',
      'Parental leave (16 weeks paid)'
    ],
    contactEmail: 'talent@nexusfintech.com',
    contactPhone: '+1 (212) 555-0144',
    verified: true
  },
  {
    id: 'comp-3',
    name: 'CyberShield Systems',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
    tagline: 'Autonomous zero-trust threat detection and automated incident defense.',
    industry: 'Cybersecurity & Defense Tech',
    website: 'https://cybershield.security',
    location: 'Austin, TX (Remote Available)',
    size: '100-250 employees',
    description: 'Pioneering AI-driven threat intelligence models that detect and neutralize sophisticated zero-day cyber attacks in milliseconds.',
    foundedYear: '2021',
    benefits: [
      'Equity package in high-growth defense startup',
      'Flexible working hours across all US timezones',
      'Generous hardware allowance (M3 Max / Linux rigs)'
    ],
    contactEmail: 'jobs@cybershield.security',
    contactPhone: '+1 (512) 555-0182',
    verified: true
  },
  {
    id: 'comp-4',
    name: 'PulseHealth BioAnalytics',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
    tagline: 'Transforming clinical trial intelligence with machine learning.',
    industry: 'Digital Health & Biotech',
    website: 'https://pulsehealth.bio',
    location: 'Boston, MA (On-site / Hybrid)',
    size: '50-100 employees',
    description: 'PulseHealth connects hospital EHR data streams to predictive analytics pipelines, accelerating clinical trial matching for oncology therapies.',
    foundedYear: '2022',
    benefits: [
      'Meaningful mission-driven healthcare impact',
      'Generous health savings account with employer seed',
      'Commuter transit passes and parking subsidies'
    ],
    contactEmail: 'recruiting@pulsehealth.bio',
    contactPhone: '+1 (617) 555-0112',
    verified: true
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-amex-1',
    title: 'Engineer 1',
    company: 'American Express',
    companyId: 'comp-amex',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
    department: 'Enterprise Platforms & Commercial Architecture',
    location: 'Bengaluru, Karnataka, India / New York, NY (Hybrid)',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    salary: {
      min: 1800000,
      max: 2400000,
      currency: 'INR',
      period: 'yearly'
    },
    description: 'American Express is looking for an Engineer 1 to join our global payment platform and engineering team. As a Software Engineer, you will design, build, and optimize high-throughput distributed systems, secure RESTful microservices, and event-driven transaction processing pipelines supporting millions of cardholders worldwide.',
    responsibilities: [
      'Design, develop, and maintain high-performance microservices using Java and Spring Boot.',
      'Build fault-tolerant distributed systems components capable of processing high-volume payment transactions.',
      'Collaborate in an Agile team with peer Software Engineers and product managers.',
      'Write comprehensive unit and integration tests to ensure enterprise software quality.',
      'Participate in architectural reviews, CI/CD pipeline automation, and performance benchmarking.'
    ],
    requirements: [
      "Bachelor's or Master's degree in Computer Science, or related engineering discipline.",
      'Proven foundation as a Software Engineer writing clean, robust code in Java and Spring Boot.',
      'Deep conceptual or hands-on understanding of Distributed Systems, microservices architecture, and scalable system design.',
      'Experience building and integrating secure REST APIs and relational databases (MySQL or PostgreSQL).',
      'Understanding of version control using Git and Agile collaborative development.'
    ],
    skills: ['Software Engineer', 'Distributed Systems', 'Java', 'Spring Boot', 'REST APIs', 'Microservices', 'SQL', 'Git'],
    educationRequired: "Bachelor's degree in Computer Science, or related field of study.",
    experienceRequiredYears: 1,
    deadline: '2026-10-31',
    postedDate: '2026-03-01',
    status: 'active',
    applicantCount: 22,
    recruiterId: 'usr-rec-amex',
    matchScore: 78
  },
  {
    id: 'job-ada-1',
    title: 'Software Engineer, Fullstack',
    company: 'ada',
    companyId: 'comp-ada',
    companyLogo: '',
    department: 'Core Platform',
    location: 'Bengaluru, Karnataka, India',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 0,
      max: 0,
      currency: 'INR',
      period: 'yearly'
    },
    description: 'We are seeking a Software Engineer to develop responsive frontend interfaces and high-performance backend microservices with Java, Spring Boot, React, and REST APIs.',
    responsibilities: [
      'Design, build, and optimize scalable web applications with React.js and modern TypeScript.',
      'Develop robust RESTful backend APIs with Java and Spring Boot.',
      'Collaborate with product and UX teams to deliver seamless user experiences.'
    ],
    requirements: [
      '2 - 4 YOE',
      'Bachelor level degree or equivalent in Computer Science, or related field of study.',
      'Technical or Professional Certification in Domain will be preferred.'
    ],
    skills: ['Computer Science', 'Technical Certification', 'Java', 'Spring Boot', 'React', 'REST APIs', 'SQL', 'Hibernate'],
    educationRequired: "Bachelor's level degree or equivalent in Computer Science, or related field of study.",
    experienceRequiredYears: 2,
    deadline: '2026-05-30',
    postedDate: '2026-02-11',
    status: 'active',
    applicantCount: 16,
    recruiterId: 'usr-rec-1',
    matchScore: 68
  },
  {
    id: 'job-cittabase-1',
    title: 'AI Engineer',
    company: 'Cittabase Solutions',
    companyId: 'comp-cittabase',
    companyLogo: '',
    department: 'Data & Artificial Intelligence',
    location: 'Chennai, India',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    salary: {
      min: 0,
      max: 0,
      currency: 'INR',
      period: 'yearly'
    },
    description: 'Join Cittabase Solutions as an AI Engineer working with Databricks, Apache Spark, Python, and machine learning pipelines for intelligent enterprise analytics.',
    responsibilities: [
      'Build and maintain scalable ETL pipelines on Databricks with PySpark.',
      'Train, fine-tune, and deploy machine learning models in production.',
      'Work alongside data engineers and cloud architects on distributed computing workloads.'
    ],
    requirements: [
      '1-2 years of hands-on experience with Databricks and PySpark.',
      'Strong proficiency in Python, SQL, and machine learning fundamentals.',
      'Familiarity with cloud platforms (Azure, AWS) and containerization.'
    ],
    skills: ['Databricks', 'Python', 'PySpark', 'Machine Learning', 'PyTorch', 'SQL', 'ETL', 'Docker'],
    educationRequired: "Bachelor's in Computer Science, AI/ML, or quantitative field.",
    experienceRequiredYears: 1,
    deadline: '2026-05-15',
    postedDate: '2026-02-11',
    status: 'active',
    applicantCount: 29,
    recruiterId: 'usr-rec-2',
    matchScore: 31
  },
  {
    id: 'job-1',
    title: 'Senior Full Stack Software Engineer',
    company: 'CloudScale AI Technologies',
    companyId: 'comp-1',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    department: 'Core Platform Engineering',
    location: 'San Francisco, CA (Hybrid / Remote)',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: {
      min: 155000,
      max: 195000,
      currency: 'USD',
      period: 'yearly'
    },
    description: 'We are seeking an experienced Senior Full Stack Engineer to lead the architectural evolution of our flagship cloud intelligence portal. You will build highly reactive frontends with TypeScript & React, orchestrate Spring Boot / Node microservices, and collaborate closely with product and AI researchers.',
    responsibilities: [
      'Architect, develop, and maintain high-throughput web applications with React 19, TypeScript, and modern state architectures.',
      'Design clean, resilient RESTful and GraphQL APIs backed by Java / Spring Boot and PostgreSQL.',
      'Collaborate with AI researchers to integrate LLM-based reasoning and automated cloud optimization agents.',
      'Mentor junior and mid-level engineers through detailed code reviews and architectural RFCs.',
      'Maintain 99.99% service availability with automated CI/CD and observability tooling.'
    ],
    requirements: [
      '5+ years of production experience building scalable web applications.',
      'Deep mastery of TypeScript, modern React, and CSS component systems.',
      'Proficient with Java/Spring Boot or Node.js backend microservices.',
      'Solid understanding of relational databases (PostgreSQL), index optimization, and Redis caching.',
      'Experience with Docker, Kubernetes, and AWS/GCP cloud environments.'
    ],
    skills: ['React', 'TypeScript', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'Tailwind CSS'],
    educationRequired: "Bachelor's or Master's in Computer Science, Software Engineering, or equivalent practical experience.",
    experienceRequiredYears: 5,
    deadline: '2026-03-31',
    postedDate: '2026-02-10',
    status: 'active',
    applicantCount: 24,
    recruiterId: 'usr-rec-1',
    matchScore: 94
  },
  {
    id: 'job-2',
    title: 'Backend Java / Distributed Systems Engineer',
    company: 'Nexus Fintech Corp',
    companyId: 'comp-2',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
    department: 'Settlement Engine Team',
    location: 'New York, NY (Hybrid)',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: {
      min: 165000,
      max: 215000,
      currency: 'USD',
      period: 'yearly'
    },
    description: 'Join the mission-critical core engineering team at Nexus Fintech. You will engineer ultra-low latency transaction clearing pipelines, distributed transaction ledgers, and event-driven settlement architectures capable of processing hundreds of thousands of transactions per second.',
    responsibilities: [
      'Design and implement high-performance Java 21 / Spring Boot microservices.',
      'Optimize database queries and transaction isolation levels across high-concurrency PostgreSQL clusters.',
      'Build resilient event streams using Apache Kafka and RabbitMQ.',
      'Establish robust automated integration and stress testing frameworks.'
    ],
    requirements: [
      '4+ years of focused backend development experience in Java/Spring ecosystem.',
      'Deep understanding of multithreading, concurrency patterns, and memory management.',
      'Hands-on experience with Kafka, Redis, and PostgreSQL replication.',
      'Strong knowledge of distributed systems principles (CAP theorem, consensus protocols).'
    ],
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Microservices'],
    educationRequired: "Bachelor's in CS or related quantitative discipline.",
    experienceRequiredYears: 4,
    deadline: '2026-04-15',
    postedDate: '2026-02-08',
    status: 'active',
    applicantCount: 38,
    recruiterId: 'usr-rec-2',
    matchScore: 86
  },
  {
    id: 'job-3',
    title: 'Cloud DevOps & Site Reliability Engineer',
    company: 'CloudScale AI Technologies',
    companyId: 'comp-1',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    department: 'Infrastructure & Reliability',
    location: 'Remote (US/Canada)',
    type: 'Full-time',
    experienceLevel: 'Mid Level',
    salary: {
      min: 130000,
      max: 165000,
      currency: 'USD',
      period: 'yearly'
    },
    description: 'Help scale our multi-region Kubernetes clusters across AWS and GCP. You will manage Infrastructure as Code with Terraform, configure zero-downtime deployment pipelines, and build observability solutions with Prometheus, Grafana, and OpenTelemetry.',
    responsibilities: [
      'Manage multi-tenant Kubernetes clusters across global AWS regions.',
      'Implement Terraform modules for automated environment provisioning.',
      'Build automated security scanning into GitHub Actions CI/CD pipelines.',
      'Participate in on-call rotations and lead blameless post-mortem investigations.'
    ],
    requirements: [
      '3+ years in DevOps, SRE, or Cloud Infrastructure roles.',
      'Expertise with Kubernetes, Helm, Docker, and AWS services.',
      'Proficiency in Terraform and scripting (Python, Bash, or Go).'
    ],
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Prometheus', 'Linux', 'Python'],
    educationRequired: "Degree in Computer Science or equivalent hands-on experience.",
    experienceRequiredYears: 3,
    deadline: '2026-03-20',
    postedDate: '2026-02-05',
    status: 'active',
    applicantCount: 19,
    recruiterId: 'usr-rec-1',
    matchScore: 78
  },
  {
    id: 'job-4',
    title: 'Senior Frontend Engineer (Design Systems & React)',
    company: 'CyberShield Systems',
    companyId: 'comp-3',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
    department: 'Threat Experience Team',
    location: 'Austin, TX / Remote',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salary: {
      min: 145000,
      max: 180000,
      currency: 'USD',
      period: 'yearly'
    },
    description: 'Transform complex cyber threat matrices into beautiful, intuitive visual dashboards. You will champion design tokens, accessible UI primitives, and high-performance real-time WebGL/Canvas network graph visualizers.',
    responsibilities: [
      'Develop our unified design system component library in React & Tailwind.',
      'Create reactive threat graph visualizations using Canvas / D3 / Three.js.',
      'Ensure WCAG 2.1 AA accessibility compliance across all customer flows.'
    ],
    requirements: [
      '4+ years building high-performance frontend interfaces in React & TypeScript.',
      'Eye for design aesthetics, micro-interactions, and visual precision.',
      'Experience with state management, virtualization, and performance profiling.'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma', 'GraphQL', 'D3.js'],
    educationRequired: 'Bachelor’s degree in Computer Science, Design, or equivalent.',
    experienceRequiredYears: 4,
    deadline: '2026-04-01',
    postedDate: '2026-02-01',
    status: 'active',
    applicantCount: 16,
    recruiterId: 'usr-rec-1',
    matchScore: 92
  },
  {
    id: 'job-5',
    title: 'AI / Machine Learning Engineer (NLP & Embeddings)',
    company: 'PulseHealth BioAnalytics',
    companyId: 'comp-4',
    companyLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
    department: 'Biomedical AI Research',
    location: 'Boston, MA (Hybrid)',
    type: 'Full-time',
    experienceLevel: 'Lead',
    salary: {
      min: 170000,
      max: 220000,
      currency: 'USD',
      period: 'yearly'
    },
    description: 'Lead the development of custom LLM fine-tuning pipelines and semantic embedding vector databases for biomedical entity extraction and medical record synthesis.',
    responsibilities: [
      'Train and fine-tune transformer models on clinical trial records.',
      'Build scalable inference microservices with FastAPI, PyTorch, and TensorRT.',
      'Deploy vector databases (Milvus / Pinecone / pgvector) for semantic retrieval.'
    ],
    requirements: [
      '5+ years experience applying NLP / Deep Learning in production.',
      'Master’s or PhD in Computer Science, AI, or Computational Biology.',
      'Strong coding skills in Python, PyTorch, Hugging Face, and Docker.'
    ],
    skills: ['Python', 'PyTorch', 'NLP', 'Transformers', 'FastAPI', 'Vector DB', 'Docker', 'AWS'],
    educationRequired: "Master's or PhD in Computer Science, AI, or related field.",
    experienceRequiredYears: 5,
    deadline: '2026-03-15',
    postedDate: '2026-01-28',
    status: 'active',
    applicantCount: 12,
    recruiterId: 'usr-rec-2',
    matchScore: 68
  }
];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-cand-1',
    title: 'Application Shortlisted 🎉',
    message: 'Your application for Senior Full Stack Engineer at CloudScale AI has been shortlisted for an interview.',
    type: 'success',
    read: false,
    createdAt: '2026-02-13T11:40:00Z',
    link: '/candidate/applications'
  },
  {
    id: 'notif-2',
    userId: 'usr-cand-1',
    title: 'ATS Analysis Completed 🚀',
    message: 'Your latest resume scored 86/100. We found 5 missing keywords you can add to boost your match rate.',
    type: 'info',
    read: false,
    createdAt: '2026-02-14T09:00:00Z',
    link: '/candidate/resume-analysis'
  },
  {
    id: 'notif-3',
    userId: 'usr-cand-1',
    title: 'New High-Match Job Found',
    message: 'Senior Frontend Engineer at CyberShield Systems matches 92% of your verified skills.',
    type: 'info',
    read: true,
    createdAt: '2026-02-12T14:00:00Z',
    link: '/candidate/jobs/job-4'
  }
];

export const INITIAL_SAVED_JOB_IDS: string[] = [];

export const INITIAL_ADMIN_STATS: AdminStats = {
  totalCandidates: 1482,
  totalRecruiters: 214,
  activeUsers: 890,
  totalJobs: 326,
  activeJobs: 248,
  closedJobs: 78,
  totalApplications: 4190,
  shortlistedCount: 840,
  selectedCount: 312,
  rejectedCount: 654,
  placementRate: 74.2,
  systemHealth: '100% Operational (0.01s latency)'
};

export const INITIAL_RECRUITER_STATS: RecruiterStats = {
  activeJobs: 6,
  totalApplicants: 97,
  shortlisted: 28,
  interviewsScheduled: 14,
  hiresThisMonth: 5,
  averageTimeToHireDays: 16
};

export const INITIAL_SYSTEM_LOGS: SystemActivityLog[] = [
  {
    id: 'log-1',
    actorName: 'Sarah Jenkins',
    actorRole: 'recruiter',
    action: 'Posted new job listing',
    target: 'Senior Full Stack Software Engineer',
    timestamp: '2026-02-10T09:14:00Z',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    actorName: 'Alex Rivera',
    actorRole: 'candidate',
    action: 'Parsed and uploaded resume',
    target: 'Alex_Rivera_Senior_FullStack_2026.pdf',
    timestamp: '2026-02-12T14:30:00Z',
    ipAddress: '10.0.4.19'
  },
  {
    id: 'log-3',
    actorName: 'Marcus Vance',
    actorRole: 'admin',
    action: 'Verified recruiter organization',
    target: 'CloudScale AI Technologies',
    timestamp: '2026-02-13T10:00:00Z',
    ipAddress: '172.16.0.1'
  },
  {
    id: 'log-4',
    actorName: 'Sarah Jenkins',
    actorRole: 'recruiter',
    action: 'Advanced applicant status to Shortlisted',
    target: 'Alex Rivera (Job: Senior Full Stack)',
    timestamp: '2026-02-13T11:40:00Z',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-5',
    actorName: 'Alex Rivera',
    actorRole: 'candidate',
    action: 'Triggered ATS automated analysis',
    target: 'Overall Score: 86/100',
    timestamp: '2026-02-14T09:00:00Z',
    ipAddress: '10.0.4.19'
  }
];
