/**
 * Reusable Resume Section Visibility & Meaningful Content Engine
 * 
 * Provides single-source-of-truth section visibility, placeholder detection,
 * and content filtering for Resume Editor Mode, Preview Mode, and PDF Export.
 */

// Comprehensive set of known default instructional placeholders
const KNOWN_PLACEHOLDER_LOWERCASE = new Set([
  // Contact & Personal
  '[first name] [last name]',
  '[first name]',
  '[last name]',
  '[your one-line professional headline]',
  '[professional headline]',
  '[phone number]',
  '[phone]',
  '[email]',
  '[city, state/country]',
  '[location]',
  'first name last name',
  'cambridge, ma • email@mit.edu • 555-0199',

  // Summary
  '[summarize your career in 2-3 sentences. focus on your years of experience and core strengths]',
  '[professional summary]',

  // Experience
  '[job title]',
  '[employment type]',
  '[mention work tenure]',
  '[work tenure]',
  '[organization name]',
  '[company name]',
  '[location type]',
  '[location type] • [location]',
  '[location type] · [location]',
  '[location type] | [location]',
  '[mention your work role and responsibilities]',
  '[list 3-5 key tools/skills used in this specific role]',
  '[job title] | [employment type]',
  '[add description about your work experience]',
  'job title - company',
  'employment type | location type | location',
  'add description about your work experience',

  // Education
  '[education tenure]',
  '[mention education tenure]',
  '[degree]',
  '[institution name]',
  '[institution name] | [location]',
  '[mention your score]',
  '[mention your academic score]',
  '[(optional) add education details like achievements, coursework, leadership roles etc]',
  '[add education details]',

  // Projects
  '[project name]',
  '[mention project tenure]',
  '[your role: e.g., lead developer / ux designer / individual project]',
  '[your role: e.g., lead developer / ux designer/ individual project]',
  '[add project description]',
  '[list 3-5 key technologies/skills used in this project]',

  // Skills
  '[programming languages]',
  '[add programming languages]',
  '[frameworks & libraries]',
  '[add frameworks & libraries]',
  '[tools & platforms]',
  '[add tools & platforms]',
  '[databases]',
  '[add databases]',
  '[soft skills]',
  '[add soft skills]',
  '[languages]',
  '[add languages]',
  '[add skills]',

  // Custom & Details
  '[mention your details...]',
  '[mention your details]'
]);

/**
 * Detects whether a string is null, empty, whitespace-only,
 * or an unedited default instructional placeholder.
 */
export const isPlaceholderText = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return true;

  const lower = trimmed.toLowerCase();
  if (KNOWN_PLACEHOLDER_LOWERCASE.has(lower)) return true;

  // Bracketed instructional pattern: starts with [ and ends with ]
  if (/^\[.*\]$/.test(trimmed)) {
    const inside = trimmed.slice(1, -1).toLowerCase().trim();
    const instructionalKeywords = [
      'mention', 'add ', 'your ', 'list ', 'e.g.', 'job title', 'employment type',
      'organization', 'institution', 'college', 'university', 'tenure', 'score',
      'academic', 'degree', 'field of study', 'project name', 'project title',
      'skills used', 'tools used', 'phone', 'email', 'location', 'city', 'country', 'state',
      'placeholder', 'bullet', 'action verb', 'quantifiable', 'brief', 'description',
      'skill 1', 'skill 2', 'skill 3'
    ];
    if (instructionalKeywords.some((kw) => inside.includes(kw))) {
      return true;
    }
    if (
      inside.includes('city') ||
      inside.includes('country') ||
      inside.includes('state') ||
      inside.includes('title') ||
      inside.includes('name') ||
      inside.includes('degree') ||
      inside.includes('skill') ||
      inside.includes('bullet') ||
      inside.includes('task') ||
      inside.includes('result') ||
      inside.includes('role')
    ) {
      return true;
    }
  }

  // Bracketed compound pattern like "[Job Title] | [Employment Type]" or "[Location Type] • [Location]"
  if (/^\[.*\]\s*(\|\s*\[.*\]|•\s*\[.*\]|·\s*\[.*\])$/.test(trimmed)) {
    return true;
  }

  return false;
};

/**
 * Returns true if the string is non-empty, non-whitespace, and not a default placeholder.
 */
export const isMeaningfulText = (val: unknown): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
  return !isPlaceholderText(trimmed);
};

/**
 * Returns cleaned trimmed string if meaningful, or null otherwise.
 */
export const cleanMeaningfulText = (val: unknown): string | null => {
  if (!isMeaningfulText(val)) return null;
  return (val as string).trim();
};

/* ─────────────────────────────────────────────────────────────────────────────
   WORK EXPERIENCE
───────────────────────────────────────────────────────────────────────────── */

export const isMeaningfulExperienceItem = (exp: any): boolean => {
  if (!exp || typeof exp !== 'object') return false;
  if (exp.visible === false) return false;

  // Case D: A partially completed experience is meaningful if any core field has real content
  const hasRole = isMeaningfulText(exp.role);
  const hasCompany = isMeaningfulText(exp.company);
  const hasDescription = isMeaningfulText(exp.description);
  const hasTechnologies = isMeaningfulText(exp.technologies);

  return Boolean(hasRole || hasCompany || hasDescription || hasTechnologies);
};

export const filterMeaningfulExperience = (list: any[] | undefined | null): any[] => {
  return (list || []).filter(isMeaningfulExperienceItem);
};

export const hasMeaningfulExperience = (list: any[] | undefined | null): boolean => {
  return filterMeaningfulExperience(list).length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   EDUCATION
───────────────────────────────────────────────────────────────────────────── */

export const isMeaningfulEducationItem = (edu: any): boolean => {
  if (!edu || typeof edu !== 'object') return false;
  if (edu.visible === false) return false;

  const hasInstitution = isMeaningfulText(edu.institution);
  const hasDegree = isMeaningfulText(edu.degree);
  const hasField = isMeaningfulText(edu.fieldOfStudy);
  const hasDescription = isMeaningfulText(edu.description || edu.details);
  const hasCgpa = isMeaningfulText(edu.cgpa);

  return Boolean(hasInstitution || hasDegree || hasField || hasDescription || hasCgpa);
};

export const filterMeaningfulEducation = (list: any[] | undefined | null): any[] => {
  return (list || []).filter(isMeaningfulEducationItem);
};

export const hasMeaningfulEducation = (list: any[] | undefined | null): boolean => {
  return filterMeaningfulEducation(list).length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────────────────────────── */

export const isMeaningfulProjectItem = (project: any): boolean => {
  if (!project || typeof project !== 'object') return false;
  if (project.visible === false) return false;

  const hasTitle = isMeaningfulText(project.title);
  const hasRole = isMeaningfulText(project.role);
  const hasDescription = isMeaningfulText(project.description);
  const hasTechnologies = isMeaningfulText(project.technologies);
  const hasLink = isMeaningfulText(project.link);
  const hasLinks = Array.isArray(project.links) && project.links.some((l: any) => isMeaningfulText(l?.url));

  return Boolean(hasTitle || hasRole || hasDescription || hasTechnologies || hasLink || hasLinks);
};

export const filterMeaningfulProjects = (list: any[] | undefined | null): any[] => {
  return (list || []).filter(isMeaningfulProjectItem);
};

export const hasMeaningfulProjects = (list: any[] | undefined | null): boolean => {
  return filterMeaningfulProjects(list).length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS
───────────────────────────────────────────────────────────────────────────── */

export const getMeaningfulSkillCategories = (
  skills: any
): {
  standard: Array<{ key: string; label: string; value: string }>;
  custom: Array<{ id: string; name: string; skills: string }>;
} => {
  if (!skills || typeof skills !== 'object') {
    return { standard: [], custom: [] };
  }

  const standardDefs = [
    { key: 'programmingLanguages', label: 'Programming Languages :' },
    { key: 'frameworksLibraries', label: 'Frameworks & Libraries :' },
    { key: 'toolsPlatforms', label: 'Tools & Platforms :' },
    { key: 'databases', label: 'Databases :' },
    { key: 'softSkills', label: 'Soft Skills :' },
    { key: 'languages', label: 'Languages :' },
    { key: 'technical', label: 'Technical Skills :' },
    { key: 'tools', label: 'Tools & Technologies :' }
  ];

  const standard: Array<{ key: string; label: string; value: string }> = [];
  standardDefs.forEach(({ key, label }) => {
    const val = skills[key];
    if (Array.isArray(val)) {
      const meaningfulList = val.filter((item) => isMeaningfulText(item));
      if (meaningfulList.length > 0) {
        standard.push({ key, label, value: meaningfulList.join(', ') });
      }
    } else if (isMeaningfulText(val)) {
      standard.push({ key, label, value: (val as string).trim() });
    }
  });

  const custom: Array<{ id: string; name: string; skills: string }> = [];
  if (Array.isArray(skills.customCategories)) {
    skills.customCategories.forEach((cc: any) => {
      if (isMeaningfulText(cc?.skills)) {
        custom.push({
          id: cc.id || `custom-cat-${Math.random()}`,
          name: isMeaningfulText(cc.name) ? cc.name.trim() : 'Skills',
          skills: cc.skills.trim()
        });
      }
    });
  }

  return { standard, custom };
};

export const hasMeaningfulSkills = (skills: any): boolean => {
  const { standard, custom } = getMeaningfulSkillCategories(skills);
  return standard.length > 0 || custom.length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   CERTIFICATIONS
───────────────────────────────────────────────────────────────────────────── */

export const isMeaningfulCertificationItem = (cert: any): boolean => {
  if (!cert || typeof cert !== 'object') return false;
  if (cert.visible === false) return false;
  return Boolean(isMeaningfulText(cert.title) || isMeaningfulText(cert.issuer));
};

export const filterMeaningfulCertifications = (list: any[] | undefined | null): any[] => {
  return (list || []).filter(isMeaningfulCertificationItem);
};

export const hasMeaningfulCertifications = (list: any[] | undefined | null): boolean => {
  return filterMeaningfulCertifications(list).length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   AWARDS & ACHIEVEMENTS
───────────────────────────────────────────────────────────────────────────── */

export const isMeaningfulAwardItem = (award: any): boolean => {
  if (!award || typeof award !== 'object') return false;
  return Boolean(isMeaningfulText(award.title) || isMeaningfulText(award.description));
};

export const filterMeaningfulAwards = (list: any[] | undefined | null): any[] => {
  return (list || []).filter(isMeaningfulAwardItem);
};

export const hasMeaningfulAwards = (list: any[] | undefined | null): boolean => {
  return filterMeaningfulAwards(list).length > 0;
};

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM SECTION
───────────────────────────────────────────────────────────────────────────── */

export const hasMeaningfulCustomSection = (customSection: any): boolean => {
  if (!customSection || typeof customSection !== 'object') return false;
  return isMeaningfulText(customSection.content);
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROFESSIONAL SUMMARY
───────────────────────────────────────────────────────────────────────────── */

export const hasMeaningfulSummary = (summary: any): boolean => {
  return isMeaningfulText(summary);
};

/* ─────────────────────────────────────────────────────────────────────────────
   CENTRALIZED SECTION VISIBILITY DISPATCH
───────────────────────────────────────────────────────────────────────────── */

/**
 * Determines whether a resume section has genuine, meaningful user-entered content.
 * Used identically for Preview Mode, PDF export, and spacing calculations.
 */
export const hasMeaningfulContent = (sectionType: string, resumeData: any): boolean => {
  if (!resumeData) return false;

  switch (sectionType) {
    case 'summary':
      return hasMeaningfulSummary(resumeData.summary);

    case 'experience':
      return hasMeaningfulExperience(resumeData.experience);

    case 'education':
      return hasMeaningfulEducation(resumeData.education);

    case 'projects':
      return hasMeaningfulProjects(resumeData.projects);

    case 'skills':
      return hasMeaningfulSkills(resumeData.skills);

    case 'certifications':
      return hasMeaningfulCertifications(resumeData.certifications);

    case 'awards':
      return hasMeaningfulAwards(resumeData.awards);

    case 'custom':
      return hasMeaningfulCustomSection(resumeData.customSection);

    case 'profile':
    case 'personal-info':
      return Boolean(
        isMeaningfulText(resumeData.name) ||
        isMeaningfulText(resumeData.firstName) ||
        isMeaningfulText(resumeData.lastName) ||
        isMeaningfulText(resumeData.phone) ||
        isMeaningfulText(resumeData.email) ||
        isMeaningfulText(resumeData.headline) ||
        isMeaningfulText(resumeData.city) ||
        isMeaningfulText(resumeData.location)
      );

    default:
      return false;
  }
};
