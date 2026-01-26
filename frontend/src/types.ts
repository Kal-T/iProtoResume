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

export interface ResumeData {
    fullName: string;
    email: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
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
