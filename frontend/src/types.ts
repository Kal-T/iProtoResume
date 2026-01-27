export interface Experience {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description: string;
}

export interface Education {
    degree: string;
    institution: string;
    graduationDate?: string;
}

export interface SkillGroup {
    category: string;
    items: string[];
}

export interface Language {
    language: string;
    proficiency: string; // e.g. Native, Professional, Basic
}

export interface Achievement {
    title: string;
    description: string;
}

export interface Project {
    title: string;
    date: string;
    location?: string;
    description: string;
    techStack: string[];
}

export interface ResumeData {
    fullName: string;
    jobTitle?: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary?: string;

    // Phase 3 Extensions
    themeColor?: string; // Hex code for sidebar/accents
    profileImage?: string; // Base64 or URL
    templateId?: string; // 'modern' | 'classic'

    // Complex sections
    experience: Experience[];
    projects?: Project[];
    certificates?: Certificate[];
    education: Education[];
    skills: string[]; // Keep for backward compatibility/simple list
    skillGroups?: SkillGroup[]; // For the categorized view
    languages?: Language[];
    achievements?: Achievement[];
}

export interface Certificate {
    name: string;
    issuer: string;
    date: string;
    link?: string;
}

export interface ATSScore {
    score: number;
    missingKeywords: string[];
    feedback: string[];
}

export interface TailorResponse {
    tailoredResume: ResumeData;
    coverLetter: string;
}
